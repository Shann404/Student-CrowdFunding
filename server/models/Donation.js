const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'flutterwave'],
    required: true
  },
  paymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  message: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: String,
  feeAmount: Number,
  netAmount: Number,
  receiptUrl: String,
  refunds: [{
    amount: Number,
    reason: String,
    processedAt: Date,
    adminNotes: String
  }]
}, {
  timestamps: true
});

// Update campaign amount when donation is completed
donationSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    const Campaign = mongoose.model('Campaign');
    await Campaign.findByIdAndUpdate(doc.campaign, {
      $inc: { currentAmount: doc.amount }
    });
  }
});

module.exports = mongoose.model('Donation', donationSchema);