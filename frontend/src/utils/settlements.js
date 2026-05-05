import { buildTripMemberBalanceLookup, resolveMemberId } from './memberLookup';

export const calculateMemberBalances = (tripMembers, expenses, recordedSettlements) => {
  const memberMap = buildTripMemberBalanceLookup(tripMembers);

  const getBalance = (value) => {
    const id = resolveMemberId(value);
    let balance = id ? memberMap.get(id) : null;
    
    // Fallback to name matching if id doesn't match
    if (!balance && value && typeof value === 'object' && value.name && value.name !== 'Unknown') {
      balance = memberMap.get(value.name.toLowerCase());
    }
    
    return balance || null;
  };

  expenses.forEach(exp => {
    const payerBalance = getBalance(exp.paidBy);
    if (payerBalance) payerBalance.paid += Number(exp.amount || 0);
    
    (exp.splitAmong || []).forEach(split => {
      const splitBalance = getBalance(split);
      if (splitBalance) splitBalance.owes += Number(split.share || 0);
    });
  });

  recordedSettlements.forEach(settlement => {
    // Pass an object with name so the fallback can work if ID fails
    const payerBalance = getBalance({ id: settlement.payerId, name: settlement.payerName });
    const payeeBalance = getBalance({ id: settlement.payeeId, name: settlement.payeeName });
    if (payerBalance) payerBalance.owes -= Number(settlement.amount || 0);
    if (payeeBalance) payeeBalance.paid -= Number(settlement.amount || 0);
  });

  const uniqueBalances = Array.from(new Set(memberMap.values()));
  uniqueBalances.forEach(b => {
    // Cancel out matching paid and owes to simplify the display
    // e.g. if someone paid 16600 but their share is 4150, they effectively paid 12450 for others and owe 0.
    const min = Math.min(b.paid, b.owes);
    b.paid -= min;
    b.owes -= min;
    b.net = b.paid - b.owes;
  });

  return uniqueBalances.sort((a, b) => b.net - a.net);
};

/**
 * Calculates optimal settlement transactions to clear debts using a greedy algorithm.
 *
 * @param {Array} tripMembers - Array of member objects from TripContext
 * @param {Array} expenses - Array of expense objects from ExpenseContext
 * @param {Array} recordedSettlements - Array of recorded settlement objects from ExpenseContext
 * @returns {Array} Array of suggested transactions { from, to, amount }
 */
export const calculateOptimalSettlements = (tripMembers, expenses, recordedSettlements) => {
  const uniqueBalances = calculateMemberBalances(tripMembers, expenses, recordedSettlements);

  // 2. Separate into debtors (net < 0) and creditors (net > 0)
  const debtors = [];
  const creditors = [];

  uniqueBalances.forEach(b => {
    // Round to avoid floating point issues
    const net = Math.round(b.net * 100) / 100;
    if (net < 0) debtors.push({ ...b, net: Math.abs(net) }); // make net positive for easier math
    else if (net > 0) creditors.push({ ...b, net });
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.net - a.net);
  creditors.sort((a, b) => b.net - a.net);

  // 3. Greedily match largest debtor to largest creditor
  const transactions = [];
  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    // Amount to settle is the minimum of what debtor owes and creditor is owed
    const amount = Math.min(debtor.net, creditor.net);
    
    // Create transaction
    if (amount > 0) {
      transactions.push({
        from: { id: debtor.id, name: debtor.name },
        to: { id: creditor.id, name: creditor.name },
        amount: amount
      });
    }

    // Update remaining balances
    debtor.net -= amount;
    creditor.net -= amount;

    // Move to next if fully settled
    // Add small epsilon for floating point comparison
    if (debtor.net < 0.01) i++;
    if (creditor.net < 0.01) j++;
  }

  return transactions;
};
