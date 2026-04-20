/**
 * Calculates optimal settlement transactions to clear debts using a greedy algorithm.
 * 
 * @param {Array} expenses - Array of expense objects from ExpenseContext
 * @param {Array} recordedSettlements - Array of recorded settlement objects from ExpenseContext
 * @param {Array} tripMembers - Array of member objects from TripContext
 * @returns {Array} Array of suggested transactions { from, to, amount }
 */
export const calculateOptimalSettlements = (expenses, recordedSettlements, tripMembers) => {
  // 1. Calculate net balances for each member
  const balances = {};
  tripMembers.forEach(m => balances[m.id] = { id: m.id, name: m.name, net: 0 });

  // Add what they paid, subtract what they owe (from expenses)
  expenses.forEach(exp => {
    if (balances[exp.paidBy]) balances[exp.paidBy].net += exp.amount;
    exp.splits.forEach(split => {
      if (balances[split.memberId]) balances[split.memberId].net -= split.amountOwed;
    });
  });

  // Adjust for recorded settlements (from settled debts)
  // If A pays B $50 to settle, A's net goes up by 50, B's net goes down by 50
  recordedSettlements.forEach(settlement => {
    if (balances[settlement.payerId]) balances[settlement.payerId].net += settlement.amount;
    if (balances[settlement.payeeId]) balances[settlement.payeeId].net -= settlement.amount;
  });

  // 2. Separate into debtors (net < 0) and creditors (net > 0)
  const debtors = [];
  const creditors = [];

  Object.values(balances).forEach(b => {
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
