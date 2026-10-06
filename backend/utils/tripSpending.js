const Expense = require('../models/Expense');
// Read derived spending from expenses instead of racing to overwrite a cached total.
async function withSpending(trips) {
  const totals = await Expense.aggregate([
    {$match:{trip:{$in:trips.map(t=>t._id)}}},
    {$group:{_id:'$trip',amount:{$sum:'$amount'}}}
  ]);
  const byId = new Map(totals.map(t=>[String(t._id),t.amount]));
  return trips.map(t=>({...t.toObject(),spent:Math.round((byId.get(String(t._id)) || 0)*100)/100}));
}
module.exports={withSpending};
