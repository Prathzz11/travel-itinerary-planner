const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  type: {
    type: String,
    enum: ['flight', 'hotel', 'car', 'train', 'bus', 'activity', 'other'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  confirmationNumber: { type: String, default: '' },
  provider: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  checkIn: { type: Date },
  checkOut: { type: Date },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  notes: { type: String, default: '' },
  attachmentUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
