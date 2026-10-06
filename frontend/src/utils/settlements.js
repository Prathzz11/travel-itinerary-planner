import { resolveMemberId } from './memberLookup.js';

// Compute once in minor units so suggestions and every balance display agree.
export const getSettlementSummary = (members = [], expenses = [], payments = []) => {
  const balances = members.map(m => ({ id: resolveMemberId(m._id || m.id || m.user), name: m.name || 'Member', paid: 0, owes: 0, sent: 0, received: 0, net: 0 }));
  const issues = new Set();
  const resolve = value => {
    const id = resolveMemberId(value);
    const index = members.findIndex(m => [m._id, m.id, m.user, m.userId].map(resolveMemberId).filter(Boolean).includes(id));
    if (index >= 0) return balances[index];
    const matches = balances.filter(b => value?.name && b.name.toLowerCase() === value.name.toLowerCase());
    return matches.length === 1 ? matches[0] : null;
  };
  const cents = value => Math.round(Number(value) * 100);
  for (const expense of expenses) {
    const amount = cents(expense.amount);
    const payer = resolve(expense.paidBy);
    const splits = expense.splitAmong || [];
    if (!payer || !Number.isFinite(amount) || amount < 0) { issues.add('Some expenses have an invalid payer or amount.'); continue; }
    payer.paid += amount;
    const raw = splits.map(s => Number(s.share) * 100);
    if (raw.some(n => !Number.isFinite(n) || n < 0) || Math.abs(raw.reduce((a,b) => a+b, 0) - amount) > 0.01) {
      issues.add('Some expense shares do not match their total.'); continue;
    }
    // Older equal splits may contain repeating decimals. Allocate leftover cents deterministically.
    const allocated = raw.map(n => Math.floor(n + 1e-8));
    const order = raw.map((n,i) => i).sort((a,b) => (raw[b]-allocated[b])-(raw[a]-allocated[a]));
    let remainder = amount - allocated.reduce((a,b) => a+b, 0);
    for (const i of order) { if (remainder-- > 0) allocated[i]++; }
    splits.forEach((split,i) => {
      const member = resolve(split);
      if (member) member.owes += allocated[i];
      else if (allocated[i]) issues.add('Some expenses refer to members who are no longer in this trip.');
    });
  }
  for (const payment of payments) {
    const from = resolve(payment.payerId);
    const to = resolve(payment.payeeId);
    const amount = cents(payment.amount);
    if (!from || !to || from === to || !Number.isFinite(amount) || amount <= 0) { issues.add('Some payment records have invalid members or amounts.'); continue; }
    from.sent += amount; to.received += amount;
  }
  for (const b of balances) b.net = b.paid - b.owes + b.sent - b.received;
  const debtors = balances.filter(b => b.net < 0).map(b => ({ ...b, remaining: -b.net })).sort((a,b) => b.remaining-a.remaining);
  const creditors = balances.filter(b => b.net > 0).map(b => ({ ...b, remaining: b.net })).sort((a,b) => b.remaining-a.remaining);
  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length && !issues.size) {
    const from = debtors[i], to = creditors[j], amount = Math.min(from.remaining, to.remaining);
    transactions.push({ from: { id: from.id, name: from.name }, to: { id: to.id, name: to.name }, amount: amount / 100 });
    from.remaining -= amount; to.remaining -= amount;
    if (!from.remaining) i++;
    if (!to.remaining) j++;
  }
  for (const b of balances) for (const key of ['paid','owes','sent','received','net']) b[key] /= 100;
  return { balances: balances.sort((a,b) => b.net-a.net), transactions, issues: [...issues] };
};
