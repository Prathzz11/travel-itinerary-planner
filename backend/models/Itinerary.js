const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  time: { type: String, default: '' }, // e.g. "09:00"
  duration: { type: Number, default: 60 }, // minutes
  category: {
    type: String,
    default: 'Other'
  },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  order: { type: Number, default: 0 }
}, { _id: true });

const daySchema = new mongoose.Schema({
  date: { type: String, required: true }, // ISO date string e.g. "2026-06-15"
  activities: [activitySchema]
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    unique: true // one itinerary per trip
  },
  days: [daySchema],
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
