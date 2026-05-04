const mongoose = require('mongoose');
require('dotenv').config();
const Expense = require('./models/Expense');
const Trip = require('./models/Trip');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync', { useNewUrlParser: true })
  .then(async () => {
    const expenses = await Expense.find();
    let updated = 0;
    
    for (const exp of expenses) {
      const trip = await Trip.findById(exp.trip);
      if (!trip) continue;
      
      let changed = false;
      
      // Fix splitAmong
      if (exp.splitAmong && exp.splitAmong.length > 0) {
        if (exp.splitAmong.length === trip.members.length) {
          exp.splitAmong.forEach((split, idx) => {
            if (!split.userId) {
              split.userId = trip.members[idx].user;
              split.name = trip.members[idx].name;
              changed = true;
            }
          });
        } else {
          const amountPerPerson = exp.amount / trip.members.length;
          exp.splitAmong = trip.members.map(m => ({
            userId: m.user,
            name: m.name,
            share: amountPerPerson
          }));
          changed = true;
        }
      }
      
      // Fix paidBy
      if (exp.paidBy) {
        if (typeof exp.paidBy === 'string') {
           const payerStr = exp.paidBy;
           const payerMem = trip.members.find(m => m.user && m.user.toString() === payerStr);
           exp.paidBy = {
             userId: payerStr,
             name: payerMem ? payerMem.name : "Unknown"
           };
           changed = true;
        } else if (!exp.paidBy.userId) {
           const pratham = trip.members.find(m => m.name.includes("Pratham"));
           if(pratham) {
              exp.paidBy = {
                userId: pratham.user,
                name: pratham.name
              };
              changed = true;
           }
        }
      }
      
      if (changed) {
        try {
          await exp.save();
          updated++;
        } catch(e) {
          console.error("Failed to save", exp._id, e);
        }
      }
    }
    
    console.log(`\n✅ Fixed ${updated} expenses in the database.`);
    process.exit(0);
  });
