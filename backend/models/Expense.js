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
  splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Accommodation', 'Activities', 'Shopping', 'Other'],
    default: 'Other'
  },
  paidBy: {
    userId: { type: mongoose.Schema.Types.ObjectId }, // Trip member ID; legacy records may contain a User ID
    name: String
  },
  splitAmong: [{
    userId: { type: mongoose.Schema.Types.ObjectId }, // Trip member ID; legacy records may contain a User ID
    name: String,
    share: Number // amount owed
  }],
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  receipt: { type: String, default: '' } // URL to receipt image
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
