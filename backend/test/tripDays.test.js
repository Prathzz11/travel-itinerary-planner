const test = require('node:test');
const assert = require('node:assert/strict');
const { tripDays } = require('../utils/tripDays');

test('date changes fill every inclusive day and preserve existing activities', () => {
  const existing = { date: '2027-01-02', activities: [{ name: 'Walk' }] };
  const result = tripDays('2027-01-01', '2027-01-03', [existing]);
  assert.deepEqual(result.map(day => day.date), ['2027-01-01', '2027-01-02', '2027-01-03']);
  assert.equal(result[1], existing);
  assert.deepEqual(result[0].activities, []);
});

test('shortening dates cannot silently discard activities', () => {
  assert.throws(() => tripDays('2027-01-02', '2027-01-03', [{ date: '2027-01-01', activities: [{ name: 'Walk' }] }]), /Move or remove/);
  assert.equal(tripDays('2027-01-02', '2027-01-03', [{ date: '2027-01-01', activities: [] }]).length, 2);
});
