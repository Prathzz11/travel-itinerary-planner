const { test } = require('node:test');
const assert = require('node:assert/strict');
const { atlasFilters } = require('../utils/atlasFilters');
test('regional filters recognize seeded destinations without treating unknown places as international', () => {
  const domestic = atlasFilters({ region: 'domestic' }).conditions[0].destination;
  const overseas = atlasFilters({ region: 'international' }).conditions[0].destination;
  for (const name of ['Jaipur, India', 'Kochi and Alappuzha, India', 'Goa']) assert.ok(domestic.test(name));
  for (const name of ['Tokyo to Kyoto', 'Lisbon and Sintra, Portugal', 'Backpacking the Swiss Alps', 'New York, USA']) assert.ok(overseas.test(name));
  assert.equal(overseas.test('Unknown destination'), false);
  assert.equal(domestic.test('Indonesia'), false);
});
test('budget filters scope currency and exclude zero estimates, including on sorting', () => {
  assert.deepEqual(atlasFilters({ maxBudget: '25000' }).conditions, [{currency:'INR', estimatedBudget:{$gt:0,$lte:25000}}]);
  assert.deepEqual(atlasFilters({ sort: 'estimatedBudget', budgetCurrency: 'EUR' }).conditions, [{currency:'EUR', estimatedBudget:{$gt:0}}]);
  assert.equal(atlasFilters({}).conditions.length, 0);
  assert.throws(() => atlasFilters({maxBudget:'-1'}));
  assert.throws(() => atlasFilters({maxBudget:'NaN'}));
  assert.throws(() => atlasFilters({sort:'password'}));
  assert.throws(() => atlasFilters({region:'wrong'}));
});
