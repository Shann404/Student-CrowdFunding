const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google OAuth
    }
  },
  role: {
    type: String,
    enum: ['student', 'donor', 'admin'],
    default: 'donor'
  },
  googleId: {
    type: String,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
   studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile'
  },
   isSuspended: {
    type: Boolean,
    default: false
  },
  flags: [{
    reason: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
  }],
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);