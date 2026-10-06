const { test, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Booking = require('../models/Booking');
const Template = require('../models/Template');
const { importDays } = require('../utils/importDays');
const { mock } = require('node:test');

const owner = '111111111111111111111111';
const member = '222222222222222222222222';
const outsider = '333333333333333333333333';
const tripId = '444444444444444444444444';
const recordId = '555555555555555555555555';
let server;
let base;
before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-only';
  server = require('../app').listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => new Promise(resolve => server.close(resolve)));
afterEach(() => mock.restoreAll());
function setup(role = 'editor') {
  mock.method(User, 'findById', id => ({ select: async () => ({ _id: id, name: 'Test user' }) }));
  mock.method(Trip, 'findById', async () => ({ _id: tripId, owner, members: [{ _id: recordId, user: member, role }] }));
}
async function request(path, { user = member, method = 'GET', body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { Authorization: `Bearer ${jwt.sign({ id: user }, process.env.JWT_SECRET)}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: await response.json() };
}

test('all nested trip resources reject outsiders before querying resource data', async () => {
  setup();
  for (const resource of ['expenses', 'bookings', 'itinerary', 'settlements', 'members']) {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      if (resource === 'members' && method === 'GET') continue;
      if (resource === 'itinerary' && ['POST', 'DELETE'].includes(method)) continue;
      const suffix = ['PUT', 'DELETE'].includes(method) && resource !== 'itinerary' ? `/${recordId}` : '';
      assert.equal((await request(`/trips/${tripId}/${resource}${suffix}`, { user: outsider, method, body: method === 'GET' ? undefined : {} })).status, 403);
    }
  }
});
test('viewers can read expenses but cannot change trip data or membership', async () => {
  setup('viewer');
  mock.method(Expense, 'find', () => ({ sort: async () => [] }));
  assert.equal((await request(`/trips/${tripId}/expenses`)).status, 200);
  for (const resource of ['expenses', 'bookings', 'settlements', 'members']) {
    assert.equal((await request(`/trips/${tripId}/${resource}`, { method: 'POST', body: {} })).status, 403);
  }
  assert.equal((await request(`/trips/${tripId}/itinerary`, { method: 'PUT', body: {} })).status, 403);
});
test('editors cannot manage members', async () => {
  setup();
  assert.equal((await request(`/trips/${tripId}/members`, { method: 'POST', body: {} })).status, 403);
});
test('expense and booking mutations are scoped to the requested trip', async () => {
  setup();
  mock.method(Expense, 'findOne', async filter => { assert.deepEqual(filter, { _id: recordId, trip: tripId }); return null; });
  for (const [resource, model] of [['expenses', Expense], ['bookings', Booking]]) {
    mock.method(model, 'findOneAndUpdate', async (filter, updates, options) => {
      assert.deepEqual(filter, { _id: recordId, trip: tripId });
      assert.equal(options.runValidators, true);
      assert.equal(updates.trip, undefined);
      return null;
    });
    mock.method(model, 'findOneAndDelete', async filter => {
      assert.deepEqual(filter, { _id: recordId, trip: tripId });
      return null;
    });
    assert.equal((await request(`/trips/${tripId}/${resource}/${recordId}`, { method: 'PUT', body: { trip: outsider, amount: 10 } })).status, 404);
    assert.equal((await request(`/trips/${tripId}/${resource}/${recordId}`, { method: 'DELETE' })).status, 404);
  }
});
test('invalid trip IDs return a client error', async () => {
  setup();
  assert.equal((await request('/trips/not-an-id/expenses')).status, 400);
});
test('private templates are excluded from the public detail lookup', async () => {
  mock.method(Template, 'findOneAndUpdate', filter => {
    assert.deepEqual(filter, { _id: recordId, isPublic: true });
    return { populate: async () => null };
  });
  assert.equal((await request(`/itineraries/${recordId}`)).status, 404);
});
test('JSON bodies are sanitized after parsing', async () => {
  setup();
  mock.method(Booking, 'create', async data => {
    assert.deepEqual(data.title, {});
    return { _id: recordId };
  });
  assert.equal((await request(`/trips/${tripId}/bookings`, { method: 'POST', body: { title: { $ne: null }, type: 'hotel' } })).status, 201);
});
test('template days receive UTC dates and invalid ranges fail before writing', () => {
  assert.deepEqual(importDays([{ dayNumber: 1 }, { dayNumber: 3 }], '2026-12-31', '2027-01-02').map(day => day.date), ['2026-12-31', '2027-01-02']);
  for (const args of [[[], 'invalid', '2026-01-01'], [[], '2026-02-01', '2026-01-01'], [[{ dayNumber: 4 }], '2026-01-01', '2026-01-02'], [[{ date: 'invalid' }], '2026-01-01', '2026-01-02']]) {
    assert.throws(() => importDays(...args), error => error.status === 400);
  }
});
test('trip model rejects reversed dates and negative budgets without a database', async () => {
  const trip = new Trip({ title: 'Test', destination: 'Test', owner: new mongoose.Types.ObjectId(), startDate: '2026-02-01', endDate: '2026-01-01', budget: -1 });
  await assert.rejects(trip.validate(), error => Boolean(error.errors.endDate && error.errors.budget));
});

test('owner can access a trip without an embedded member entry', async () => {
  setup();
  mock.method(Expense, 'find', () => ({ sort: async () => [] }));
  assert.equal((await request(`/trips/${tripId}/expenses`, { user: owner })).status, 200);
});
test('invalid import payloads do not create trips', async () => {
  setup();
  const create = mock.method(Trip, 'create', async () => { throw new Error('Unexpected write'); });
  const result = await request('/trips/import', { method: 'POST', body: {
    title: 'Test', destination: 'Test', startDate: '2026-10-01', endDate: '2026-10-02',
    days: [{ date: '2026-10-03', activities: [] }],
  } });
  assert.equal(result.status, 400);
  assert.equal(create.mock.callCount(), 0);
});
test('settlements reject unknown members and non-positive amounts', async () => {
  setup();
  mock.method(Trip, 'findById', async () => ({ owner, members: [
    { _id: recordId, user: member, role: 'editor' },
    { _id: tripId, user: owner, role: 'admin' },
  ] }));
  for (const body of [
    { payerId: outsider, payeeId: owner, amount: 10 },
    { payerId: member, payeeId: owner, amount: 0 },
    { payerId: member, payeeId: recordId, amount: 10 },
  ]) {
    assert.equal((await request(`/trips/${tripId}/settlements`, { method: 'POST', body })).status, 400);
  }
});
test('public pagination rejects unbounded and invalid limits', async () => {
  for (const query of ['limit=0', 'limit=101', 'page=-1', 'page=abc']) {
    assert.equal((await request(`/itineraries?${query}`)).status, 400);
  }
});
