const mongoose = require('mongoose');

const templateActivitySchema = new mongoose.Schema({
  name: String,
  category: String,
  duration: Number,
  notes: String,
  order: Number
}, { _id: false });

const templateDaySchema = new mongoose.Schema({
  dayNumber: Number,
  title: String,
  activities: [templateActivitySchema]
}, { _id: false });

const templateSchema = new mongoose.Schema({
  sourceTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', unique: true, sparse: true },
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  description: { type: String, default: '' },
  duration: { type: Number, required: true }, // number of days
  tags: [String],
  image: { type: String, default: '' },
  imageCredit: { name: String, url: String, license: String },
  sources: [{ title: String, url: String, _id: false }],
  planningTips: [String],
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging'],
    default: 'Easy'
  },
  estimatedBudget: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: { type: String, default: 'TravelSync' },
  authorAvatar: { type: String, default: '' },
  isPublic: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  days: [templateDaySchema],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
templateSchema.index({ title: 'text', destination: 'text', tags: 'text' });

module.exports = mongoose.model('Template', templateSchema);
