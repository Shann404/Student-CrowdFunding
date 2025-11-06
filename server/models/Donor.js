const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  guestEmail: {
    type: String,
    sparse: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer']
    },
    lastFour: String,
    brand: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  totalDonated: {
    type: Number,
    default: 0
  },
  campaignsSupported: [{
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    totalAmount: Number,
    firstDonation: Date,
    lastDonation: Date
  }],
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    monthlyUpdates: {
      type: Boolean,
      default: true
    },
    anonymousByDefault: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donor', donorSchema);