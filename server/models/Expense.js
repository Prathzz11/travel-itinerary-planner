const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Expense description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: { type: String, default: 'INR' },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Other'],
    default: 'Other'
  },
  paidBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    memberId: { type: String }, // The ID from the trip's members array
    name: String
  },
  splitAmong: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    memberId: { type: String },
    name: String,
    share: Number // amount owed
  }],
  date: { type: Date, default: Date.now },
  receipt: { type: String, default: '' } // URL to receipt image
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
