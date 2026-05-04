const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  avatar: String,
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now },
  online: { type: Boolean, default: false }
}, { _id: false });

const activityFeedSchema = new mongoose.Schema({
  user: String,
  action: String,
  timestamp: { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  startDate: { type: Date },
  endDate: { type: Date },
  image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  activityFeed: [activityFeedSchema],
  activitiesCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
