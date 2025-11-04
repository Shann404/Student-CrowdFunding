const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  category: {
    type: String,
    enum: ['tuition', 'books', 'accommodation', 'research', 'other'],
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'under_review'],
    default: 'under_review'
  },
  images: [{
    url: String,
    publicId: String
  }],
  updates: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  withdrawalRequests: [{
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    adminNotes: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationNotes: String
}, {
  timestamps: true
});

// Calculate progress percentage
campaignSchema.virtual('progress').get(function() {
  return (this.currentAmount / this.targetAmount) * 100;
});

// Check if campaign is completed
campaignSchema.virtual('isCompleted').get(function() {
  return this.currentAmount >= this.targetAmount;
});

module.exports = mongoose.model('Campaign', campaignSchema);