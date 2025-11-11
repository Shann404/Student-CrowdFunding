const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedAt: Date,
  rejectedAt: Date,
  adminNotes: String,
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  school: {
    name: {
      type: String,
      required: [true, 'School name is required']
    },
    address: String,
    type: {
      type: String,
      enum: ['university', 'college', 'high-school', 'vocational', 'technical', 'other'],
      required: true
    }
  },
  course: {
    name: {
      type: String,
      required: [true, 'Course name is required']
    },
    duration: String,
    yearOfStudy: {
      type: Number,
      required: [true, 'Year of study is required'],
      min: [1, 'Year of study must be at least 1'],
      max: [10, 'Year of study cannot exceed 10']
    }
  },
  academicDocuments: {
    studentIdCard: {
      url: String,
      publicId: String
    },
    admissionLetter: {
      url: String,
      publicId: String
    },
    feeStructure: {
      url: String,
      publicId: String
    }
  },
  bio: String,
  academicPerformance: String,
  futureGoals: String
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);