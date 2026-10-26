// Explicit destination matches: never infer a country from its budget currency.
const domestic = /\b(india|jaipur|delhi|mumbai|goa|kerala|kochi|alappuzha|manali|nainital|rajasthan|bengaluru|bangalore|chennai|kolkata|ladakh|rishikesh|udaipur|agra|varanasi|shimla|sikkim|darjeeling|kashmir|andaman|pune|hyderabad)\b/i;
const overseas = /\b(japan|tokyo|kyoto|osaka|portugal|lisbon|sintra|france|paris|switzerland|swiss|indonesia|bali|usa|united states|new york|thailand|bangkok|phuket|singapore|malaysia|vietnam|nepal|bhutan|sri lanka|maldives|uae|dubai|united kingdom|london|italy|rome|spain|barcelona|germany|australia|new zealand|canada|greece|turkey|egypt|south africa|south korea|china)\b/i;
const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'THB', 'SGD', 'AED'];
function atlasFilters(query) {
  const { region = '', maxBudget = '', budgetCurrency = 'INR', sort = '-createdAt' } = query;
  if (!['', 'domestic', 'international'].includes(region)) throw new Error('Invalid trip region');
  if (!['-createdAt', '-rating', '-views', 'duration', 'estimatedBudget'].includes(sort)) throw new Error('Invalid sort option');
  const conditions = [];
  if (region === 'domestic') conditions.push({ destination: domestic }, { destination: { $not: overseas } });
  if (region === 'international') conditions.push({ destination: overseas });
  if (maxBudget !== '' || sort === 'estimatedBudget') {
    if (!currencies.includes(budgetCurrency)) throw new Error('Invalid budget currency');
    const amount = Number(maxBudget);
    if (maxBudget !== '' && (!Number.isFinite(amount) || amount <= 0)) throw new Error('Budget must be a positive amount');
    conditions.push({ currency: budgetCurrency, estimatedBudget: { $gt: 0, ...(maxBudget !== '' ? { $lte: amount } : {}) } });
  }
  return { conditions, sort: { [sort.replace(/^-/, '')]: sort.startsWith('-') ? -1 : 1, _id: 1 } };
}
module.exports = { atlasFilters };
