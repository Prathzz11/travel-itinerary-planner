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
  // Hotel-specific fields
  name: { type: String, default: '' },
  address: { type: String, default: '' },
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  roomType: { type: String, default: '' },
  amenities: [String],
  images: [String],
  // Flight-specific fields
  airline: { type: String, default: '' },
  flightNumber: { type: String, default: '' },
  departureTime: { type: String, default: '' },
  arrivalTime: { type: String, default: '' },
  // Common fields
  cost: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  bookingRef: { type: String, default: '' },
  link: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
