const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  avatar: String,
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now },
  online: { type: Boolean, default: false }
});

const activityFeedSchema = new mongoose.Schema({
  user: String,
  action: String,
  timestamp: { type: Date, default: Date.now }
});

const settlementSchema = new mongoose.Schema({
  requestId: String,
  payerId: { type: String, required: true },
  payeeId: { type: String, required: true },
  payerName: String,
  payeeName: String,
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  method: { type: String, default: 'Cash' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  transactionRevision: { type: Number, default: 0, select: false },
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
  startDate: { type: Date, required: [true, 'Start date is required'] },
  endDate: { type: Date, required: [true, 'End date is required'] },
  image: { type: String, default: '' },
  imageCredit: { name: String, url: String, license: String },
  sources: [{ title: String, url: String, _id: false }],
  planningTips: [String],
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  budget: { type: Number, default: 0, min: 0 },
  spent: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  settlements: [settlementSchema],
  settlementRequestIds: { type: [String], default: [], select: false },
  activityFeed: [activityFeedSchema],
  activitiesCount: { type: Number, default: 0 }
}, { timestamps: true });

tripSchema.pre('validate', function () {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
});

module.exports = mongoose.model('Trip', tripSchema);
