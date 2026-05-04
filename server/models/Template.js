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
  durationDays: { type: Number },             // alias kept in sync with duration
  tags: [String],
  image: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Hard', 'Challenging'],
    default: 'Easy'
  },
  estimatedBudget: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },       // alias kept in sync with estimatedBudget
  currency: { type: String, default: 'INR' },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authorName: { type: String, default: 'TravelSync' },
  authorAvatar: { type: String, default: '' },
  isPublic: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  trendingScore: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  days: [templateDaySchema],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Text index for search
templateSchema.index({ title: 'text', destination: 'text', tags: 'text' });

// Keep alias fields in sync
templateSchema.pre('save', function (next) {
  if (this.isModified('duration')) this.durationDays = this.duration;
  if (this.isModified('estimatedBudget')) this.budget = this.estimatedBudget;
  next();
});

module.exports = mongoose.model('Template', templateSchema);
