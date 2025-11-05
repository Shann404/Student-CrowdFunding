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
  
  // Institution Verification Details
  institutionDetails: {
    institutionName: {
      type: String,
      required: true,
      trim: true
    },
    studentId: {
      type: String,
      required: true,
      trim: true
    },
    academicPeriod: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Fee Structure & Financial Details
  feeStructure: {
    totalFees: {
      type: Number,
      required: true,
      min: 0
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },
    outstandingBalance: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Payment Instructions for Direct Institution Payment
  paymentInstructions: {
    instructions: {
      type: String,
      trim: true
    },
    paymentVerified: {
      type: Boolean,
      default: false
    },
    verifiedMethods: [{
      method: String, // e.g., 'bank_transfer', 'online_portal', 'bursar_office'
      details: String,
      isVerified: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Document Uploads
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: ['fee_statement', 'student_id', 'admission_letter', 'other'],
      required: true
    },
    fileName: String,
    fileUrl: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: String
  }],
  
  images: [{
    url: String,
    publicId: String,
    caption: String,
    isVerificationDoc: {
      type: Boolean,
      default: false
    }
  }],
  
  updates: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'milestone', 'verification_update', 'financial_update'],
      default: 'general'
    }
  }],
  
  withdrawalRequests: [{
    amount: Number,
    purpose: {
      type: String,
      enum: ['tuition', 'books', 'accommodation', 'research', 'other'],
      required: true
    },
    institutionPaymentDetails: {
      payeeName: String,
      accountNumber: String,
      routingNumber: String,
      paymentReference: String
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    adminNotes: String,
    supportingDocuments: [{
      documentType: String,
      fileUrl: String,
      fileName: String
    }]
  }],
  
  // Enhanced Verification Status
  verificationStatus: {
    studentVerified: {
      type: Boolean,
      default: false
    },
    documentsVerified: {
      type: Boolean,
      default: false
    },
    institutionVerified: {
      type: Boolean,
      default: false
    },
    financialsVerified: {
      type: Boolean,
      default: false
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationNotes: String,
  
  // Audit Trail
  verificationHistory: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Fraud Prevention Flags
  flags: [{
    type: String,
    enum: ['amount_mismatch', 'document_issue', 'institution_verification', 'payment_discrepancy'],
    description: String,
    resolved: {
      type: Boolean,
      default: false
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    raisedAt: {
      type: Date,
      default: Date.now
    }
  }]
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

// Check if all verifications are complete
campaignSchema.virtual('isFullyVerified').get(function() {
  return this.verificationStatus.studentVerified && 
         this.verificationStatus.documentsVerified && 
         this.verificationStatus.institutionVerified && 
         this.verificationStatus.financialsVerified;
});

// Pre-save middleware to calculate outstanding balance
campaignSchema.pre('save', function(next) {
  if (this.feeStructure.totalFees && this.feeStructure.amountPaid) {
    this.feeStructure.outstandingBalance = this.feeStructure.totalFees - this.feeStructure.amountPaid;
  }
  
  // Update overall verification status
  if (this.isFullyVerified) {
    this.verificationStatus.overallStatus = 'verified';
    this.isVerified = true;
  }
  
  next();
});

// Index for better query performance
campaignSchema.index({ student: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ 'institutionDetails.institutionName': 1 });
campaignSchema.index({ 'verificationStatus.overallStatus': 1 });
campaignSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);