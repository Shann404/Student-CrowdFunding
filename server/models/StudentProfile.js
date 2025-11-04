const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  school: {
    name: {
      type: String,
      required: true
    },
    address: String,
    type: {
      type: String,
      enum: ['university', 'college', 'high-school', 'other']
    }
  },
  course: {
    name: {
      type: String,
      required: true
    },
    duration: String,
    yearOfStudy: {
      type: Number,
      required: true
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