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
   res.json({
      ...studentProfile.toObject(),
      // Ensure image URLs are absolute
      studentIdImage: studentProfile.studentIdImage ? {
        ...studentProfile.studentIdImage,
        url: `${req.protocol}://${req.get('host')}${studentProfile.studentIdImage.url}`
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update student profile 
router.post('/profile', [
  auth,
  upload.single('studentIdImage'), // Add file upload for student ID image
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('schoolName').notEmpty().withMessage('School name is required'), // Changed from school.name
  body('courseName').notEmpty().withMessage('Course name is required'), // Changed from course.name
  body('yearOfStudy').isInt({ min: 1, max: 10 }).withMessage('Valid year of study is required') // Changed from course.yearOfStudy
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
    console.log('Received file:', req.file);

    const {
      studentId,
      dateOfBirth,
      gender,
      schoolName,        // Flat field from frontend
      schoolAddress,     // Flat field from frontend
      schoolType,        // Flat field from frontend
      courseName,        // Flat field from frontend
      courseDuration,    // Flat field from frontend
      yearOfStudy,       // Flat field from frontend
      bio,
      academicPerformance,
      futureGoals
    } = req.body;

    // Check if yearOfStudy exists and is valid
    if (!yearOfStudy) {
      return res.status(400).json({ 
        errors: [{ path: 'yearOfStudy', message: 'Year of study is required' }] 
      });
    }

    // Handle student ID image upload
    let studentIdCard = {};
    if (req.file) {
      studentIdCard = {
        url: `/uploads/${req.file.filename}`,
        publicId: req.file.filename
      };
    } else {
      return res.status(400).json({
        errors: [{ path: 'studentIdImage', message: 'Student ID image is required' }]
      });
    }

    // Structure data to match the MongoDB model (nested structure)
    const profileData = {
      user: req.user.id,
      studentId,
      dateOfBirth,
      gender,
      school: {
        name: schoolName,
        address: schoolAddress,
        type: schoolType
      },
      course: {
        name: courseName,
        duration: courseDuration,
        yearOfStudy: parseInt(yearOfStudy)
      },
      academicDocuments: {
        studentIdCard: studentIdCard
      },
      bio,
      academicPerformance,
      futureGoals
    };

    console.log('Processed profile data:', profileData);

    // Check if student ID already exists (for new profiles)
    const existingStudentId = await StudentProfile.findOne({ studentId });
    if (existingStudentId && existingStudentId.user.toString() !== req.user.id) {
      return res.status(400).json({ 
        errors: [{ path: 'studentId', message: 'Student ID already exists' }] 
      });
    }

    // Check if profile already exists for this user
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
        errors: [{ path: 'studentId', message: 'Student ID already exists' }]
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
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

router.get('/admin/profiles', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    
    // Text search
    if (search) {
      searchQuery.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { 'school.name': { $regex: search, $options: 'i' } },
        { 'course.name': { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter - FIX: Add status filtering
    if (status) {
      if (status === 'pending') {
        searchQuery.status = { $in: [null, 'pending'] };
        searchQuery['user.isVerified'] = false;
      } else if (status === 'verified') {
        searchQuery.status = 'verified';
        searchQuery['user.isVerified'] = true;
      } else if (status === 'rejected') {
        searchQuery.status = 'rejected';
        searchQuery['user.isVerified'] = false;
      }
    }

    console.log('=== FETCHING STUDENT PROFILES ===');
    console.log('Search query:', JSON.stringify(searchQuery, null, 2));
    console.log('Status filter:', status);

    const studentProfiles = await StudentProfile.find(searchQuery)
      .populate('user', 'name email isVerified createdAt')
      .populate({
        path: 'user',
        populate: {
          path: 'campaigns',
          model: 'Campaign',
          select: 'title status targetAmount amountRaised createdAt'
        }
      })
      .populate('school', 'name type')
      .populate('course', 'name duration yearOfStudy')
      .select('+status +verifiedAt +rejectedAt +adminNotes') // FIX: Ensure status fields are included
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudentProfile.countDocuments(searchQuery);

    // Debug log the results
    console.log(`Found ${studentProfiles.length} profiles`);
    studentProfiles.forEach(profile => {
      console.log(`Student: ${profile._id}, Status: ${profile.status}, User Verified: ${profile.user?.isVerified}`);
    });

    // Convert relative URLs to absolute URLs
    const profilesWithAbsoluteUrls = studentProfiles.map(profile => ({
      ...profile.toObject(),
      studentIdImage: profile.studentIdImage ? {
        ...profile.studentIdImage,
        url: `${req.protocol}://${req.get('host')}${profile.studentIdImage.url}`
      } : null
    }));

    res.json({
      studentProfiles: profilesWithAbsoluteUrls,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching student profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// In your student routes (student.js)
router.put('/admin/:studentId/verify', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { studentId } = req.params;
    const { action, notes } = req.body;

    const studentProfile = await StudentProfile.findById(studentId).populate('user');
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (action === 'verify') {
      // Verify the student
      await User.findByIdAndUpdate(studentProfile.user._id, { 
        isVerified: true 
      });
    } else if (action === 'reject') {
      // Reject the student profile
      await User.findByIdAndUpdate(studentProfile.user._id, { 
        isVerified: false 
      });
    }

    // Return updated student profile
    const updatedStudentProfile = await StudentProfile.findById(studentId)
      .populate('user', 'name email isVerified createdAt');

    res.json({
      message: `Student profile ${action}ed successfully`,
      student: updatedStudentProfile,
      action: action
    });
  } catch (error) {
    console.error('Error verifying student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// This should already exist in your backend
router.patch('/:id/verify', auth, async (req, res) => {
  try {
    console.log('=== VERIFICATION REQUEST ===');
    console.log('User:', req.user._id, 'Role:', req.user.role);
    console.log('Student ID:', req.params.id);
    console.log('Action:', req.body.action);
    console.log('Notes:', req.body.notes);

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { action, notes } = req.body;
    const studentProfile = await StudentProfile.findById(req.params.id);
    
    if (!studentProfile) {
      console.log('Student profile not found');
      return res.status(404).json({ message: 'Student profile not found' });
    }

    console.log('Found student profile:', studentProfile._id);
    console.log('Current status:', studentProfile.status);
    console.log('Current user verification:', studentProfile.user?.isVerified);

    if (action === 'verify') {
      // Update user verification status
      await User.findByIdAndUpdate(studentProfile.user, { isVerified: true });
      const updatedStudent = await StudentProfile.findByIdAndUpdate(
        req.params.id, 
        { 
          status: 'verified',
          verifiedAt: new Date()
        },
        { new: true }
      ).populate('user');

      console.log('Verified - New status:', updatedStudent.status);
      
      return res.json({ 
        message: 'Student verified successfully',
        student: updatedStudent
      });
    } else if (action === 'reject') {
      // Update user verification status
      await User.findByIdAndUpdate(studentProfile.user, { isVerified: false });
      
      // Mark as rejected
      const updatedStudent = await StudentProfile.findByIdAndUpdate(
        req.params.id, 
        { 
          status: 'rejected',
          rejectedAt: new Date(),
          adminNotes: notes || studentProfile.adminNotes
        },
        { new: true }
      ).populate('user');

      console.log('Rejected - New status:', updatedStudent.status);
      console.log('Rejected - User verification:', updatedStudent.user?.isVerified);
      
      return res.json({ 
        message: 'Student application rejected',
        student: updatedStudent
      });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;