const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this profile' });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user.id })
      .populate('user', 'name email profilePicture');

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(studentProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update student profile
router.post('/profile', [
  auth,
  // Remove upload.fields for now to isolate the issue
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('school.name').notEmpty().withMessage('School name is required'),
  body('course.name').notEmpty().withMessage('Course name is required'),
  body('course.yearOfStudy').isInt({ min: 1 }).withMessage('Valid year of study is required') // Fixed: course.yearOfStudy
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create profiles' });
    }

    console.log('Received data:', req.body);

    const {
      studentId,
      dateOfBirth,
      gender,
      school,
      course,
      bio,
      academicPerformance,
      futureGoals
    } = req.body;

    // No need to parse - they're already objects from frontend
    const schoolData = school;
    const courseData = course;

    // Check if course.yearOfStudy exists and is valid
    if (!courseData.yearOfStudy) {
      return res.status(400).json({ 
        errors: [{ path: 'course.yearOfStudy', message: 'Year of study is required' }] 
      });
    }

    const profileData = {
      user: req.user.id,
      studentId,
      dateOfBirth,
      gender,
      school: schoolData,
      course: {
        ...courseData,
        yearOfStudy: parseInt(courseData.yearOfStudy) // Ensure it's a number
      },
      bio,
      academicPerformance,
      futureGoals
    };

    console.log('Processed profile data:', profileData);

    // Check if profile already exists
    let studentProfile = await StudentProfile.findOne({ user: req.user.id });

    if (studentProfile) {
      // Update existing profile
      studentProfile = await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileData },
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      studentProfile = new StudentProfile(profileData);
      await studentProfile.save();
    }

    await studentProfile.populate('user', 'name email profilePicture');

    res.json({
      message: 'Student profile saved successfully',
      profile: studentProfile
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        path: err.path,
        message: err.message
      }));
      return res.status(400).json({ errors });
    }
    
    // Handle duplicate studentId
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Student ID already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students (for admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await StudentProfile.find()
      .populate('user', 'name email isVerified')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify student (admin only)
router.patch('/:id/verify', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentProfile = await StudentProfile.findById(req.params.id);
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Update user verification status
    await User.findByIdAndUpdate(studentProfile.user, { isVerified: true });

    res.json({ message: 'Student verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;