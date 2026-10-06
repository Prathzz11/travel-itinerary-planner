const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const Trip = require('./models/Trip');

mongoose.connect('mongodb://127.0.0.1:27017/travelsync').then(async () => {
    const expenses = await Expense.find({});
    let updatedCount = 0;

    for (let exp of expenses) {
        const trip = await Trip.findById(exp.trip);
        if (!trip) continue;

        let needsUpdate = false;
        
        // Find splits that reference a member no longer in the trip
        const originalLength = exp.splitAmong.length;
        const validSplits = exp.splitAmong.filter(s => {
            // Check if member is still in the trip
            return trip.members.some(m => 
                (m._id && m._id.toString() === s.userId?.toString()) || 
                (m.user && m.user.toString() === s.userId?.toString()) ||
                (m.name === s.name && s.name !== 'Unknown')
            );
        });

        if (validSplits.length < originalLength && validSplits.length > 0) {
            console.log(`Fixing expense "${exp.description}" - removing departed members and recalculating`);
            exp.splitAmong = validSplits;
            const newShare = Number((exp.amount / validSplits.length).toFixed(2));
            exp.splitAmong.forEach(s => s.share = newShare);
            needsUpdate = true;
        }

        if (needsUpdate) {
            await exp.save();
            updatedCount++;
        }
    }
    
    console.log(`Fixed ${updatedCount} old expenses.`);
    process.exit(0);
});
