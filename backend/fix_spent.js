const mongoose = require('mongoose');
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');

mongoose.connect('mongodb://localhost:27017/travelsync')
  .then(async () => {
    // Recalculate spent for ALL trips based on actual expense documents
    const trips = await Trip.find();
    let updated = 0;
    for (const trip of trips) {
      const expenses = await Expense.find({ trip: trip._id });
      const realSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      if (trip.spent !== realSpent) {
        await Trip.findByIdAndUpdate(trip._id, { spent: realSpent });
        console.log(`Fixed "${trip.title}": was ₹${trip.spent}, now ₹${realSpent}`);
        updated++;
      }
    }
    console.log(`\n✅ Fixed ${updated} trips. All spent values now match real expenses.`);
    process.exit(0);
  });
