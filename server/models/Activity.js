const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    dayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Day',
      required: [true, 'Day reference is required'],
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    startTime: {
      type: String, // stored as "HH:mm" string for flexibility
      default: '',
    },
    endTime: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['sightseeing', 'food', 'transport', 'accommodation', 'other'],
      default: 'other',
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    photoUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
