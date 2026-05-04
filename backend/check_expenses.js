const mongoose = require('mongoose');
require('dotenv').config();
const Expense = require('./models/Expense');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync', { useNewUrlParser: true })
  .then(async () => {
    const expenses = await Expense.find();
    console.log("Total expenses:", expenses.length);
    if(expenses.length > 0) {
      console.log("Sample expense splitAmong:", JSON.stringify(expenses[expenses.length-1].splitAmong, null, 2));
    }
    process.exit();
  });
