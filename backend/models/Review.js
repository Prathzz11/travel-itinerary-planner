const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  helpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ensure one review per user per template
reviewSchema.index({ templateId: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
