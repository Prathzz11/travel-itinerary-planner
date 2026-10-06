const fail = message => { throw Object.assign(new Error(message), { status: 400 }); };
const money = (value, label, positive = false) => {
  if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') fail(`${label} must be a number`);
  const number = Number(value), units = Math.round(number * 100);
  if (!Number.isSafeInteger(units) || number < 0 || (positive && number <= 0) || Math.abs(number * 100 - units) > 1e-6) fail(`${label} must be ${positive ? 'positive' : 'non-negative'} with at most two decimal places`);
  return units;
};
const validateExpense = (input, trip) => {
  const amount = money(input.amount, 'Amount', true);
  if ((input.currency || trip.currency) !== trip.currency) fail('Expense currency must match the trip currency');
  const member = value => {
    const id = String(value?.userId || value?.memberId || '');
    const found = trip.members.find(m => [String(m._id), String(m.user || '')].includes(id) && id);
    if (!found) fail('Payer and split participants must belong to this trip');
    return { userId: found._id, name: found.name };
  };
  const paidBy = member(input.paidBy);
  if (!Array.isArray(input.splitAmong) || !input.splitAmong.length) fail('Select at least one split participant');
  const seen = new Set();
  const splitAmong = input.splitAmong.map(s => {
    const person = member(s), id = String(person.userId);
    if (seen.has(id)) fail('A member cannot appear twice in a split');
    seen.add(id);
    const share = Number(s.share);
    if (!['number','string'].includes(typeof s.share) || String(s.share).trim() === '' || !Number.isFinite(share) || share < 0) fail('Shares must be non-negative numbers');
    return { ...person, share };
  });
  if (input.splitType === 'equal') {
    const selected = splitAmong.filter(s => s.share > 0);
    if (!selected.length) fail('Select at least one split participant');
    const total = splitAmong.reduce((n,s) => n+s.share, 0);
    if (Math.abs(total*100-amount) > 0.01) fail('Split shares must equal the expense amount');
    const base = Math.floor(amount / selected.length), extra = amount % selected.length;
    if (selected.some(s => Math.abs(s.share*100 - amount/selected.length) > 1.01)) fail('Equal splits must divide the amount equally');
    selected.forEach((s,i) => { s.share = (base + (i < extra ? 1 : 0))/100; });
  } else {
    if (input.splitType !== 'custom') fail('Split type must be equal or custom');
    if (splitAmong.reduce((n,s) => n+money(s.share,'Share'),0) !== amount) fail('Split shares must equal the expense amount');
  }
  return { ...input, amount: amount/100, currency: trip.currency, paidBy, splitAmong };
};
module.exports = { validateExpense, money };
