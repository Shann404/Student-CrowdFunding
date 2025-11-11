const express = require('express');
const Campaign = require('../models/Campaign');
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
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

// Create campaign
router.post('/', [
  auth,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 10 },
    { name: 'studentIdImage', maxCount: 1 }
  ]),
  body('title').trim().isLength({ min: 10 }).withMessage('Title must be at least 10 characters'),
  body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be at least 1'),
  body('category').isIn(['tuition', 'books', 'accommodation', 'research', 'other']).withMessage('Invalid category'),
  body('deadline').isISO8601().withMessage('Invalid deadline date'),
  // New validation for verification fields
  body('institutionName').trim().isLength({ min: 2 }).withMessage('Institution name is required'),
  body('studentId').trim().isLength({ min: 1 }).withMessage('Student ID is required'),
  body('academicPeriod').trim().isLength({ min: 2 }).withMessage('Academic period is required'),
  body('totalFees').isFloat({ min: 0 }).withMessage('Total fees must be a valid number'),
  body('amountPaid').isFloat({ min: 0 }).withMessage('Amount paid must be a valid number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create campaigns' });
    }

    // Check if student profile exists
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(400).json({ message: 'Please complete your student profile first' });
    }

    const { 
      title, 
      description, 
      targetAmount, 
      category, 
      deadline, 
      currency,
      // New verification fields
      institutionName,
      studentId,
      academicPeriod,
      totalFees,
      amountPaid,
      paymentInstructions,
      paymentVerified
    } = req.body;

    // Calculate outstanding balance
    const outstandingBalance = parseFloat(totalFees) - parseFloat(amountPaid);

    // Process uploaded files
    const images = req.files['images'] ? req.files['images'].map(file => ({ 
      url: `/uploads/${file.filename}`,
      isVerificationDoc: false
    })) : [];

    const documents = req.files['documents'] ? req.files['documents'].map(file => {
      // Determine document type based on filename or other logic
      let documentType = 'other';
      const fileName = file.originalname.toLowerCase();
      
      if (fileName.includes('fee') || fileName.includes('invoice') || fileName.includes('statement')) {
        documentType = 'fee_statement';
      } else if (fileName.includes('student') || fileName.includes('id') || fileName.includes('card')) {
        documentType = 'student_id';
      } else if (fileName.includes('admission') || fileName.includes('enrollment') || fileName.includes('acceptance')) {
        documentType = 'admission_letter';
      }

      return {
        documentType,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        uploadedAt: new Date(),
        verificationStatus: 'pending'
      };
    }) : [];

    const campaign = new Campaign({
      student: req.user.id,
      title,
      description,
      targetAmount: parseFloat(targetAmount),
      category,
      deadline,
      currency: currency || 'USD',
      
      // Institution verification details
      institutionDetails: {
        institutionName,
        studentId,
        academicPeriod
      },
      
      // Fee structure
      feeStructure: {
        totalFees: parseFloat(totalFees),
        amountPaid: parseFloat(amountPaid),
        outstandingBalance: outstandingBalance
      },
      
      // Payment instructions
      paymentInstructions: {
        instructions: paymentInstructions,
        paymentVerified: paymentVerified === 'true' || paymentVerified === true
      },
      
      // Documents and images
      verificationDocuments: documents,
      images: images,
      
      // Initial verification status
      verificationStatus: {
        studentVerified: false,
        documentsVerified: false,
        institutionVerified: false,
        financialsVerified: false,
        overallStatus: 'pending'
      },
      
      status: 'under_review'
    });

    await campaign.save();
    
    // Populate student details
    await campaign.populate('student', 'name email');

    res.status(201).json({
      message: 'Campaign created successfully and is under review',
      campaign
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    const query = { 
      status: status || 'active', 
      'verificationStatus.overallStatus': 'verified' 
    };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'institutionDetails.institutionName': { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Campaign.countDocuments(query);

    res.json({
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('student', 'name email')
      .populate('verificationHistory.performedBy', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's campaigns
router.get('/user/my-campaigns', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// In your campaign routes
router.get('/admin/all-campaigns', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { 
      page = 1, 
      limit = 50, 
      status = '', 
      search = '' 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build filter query
    let filterQuery = {};
    if (status) {
      filterQuery.status = status;
    }
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { institutionName: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(filterQuery)
      .populate('student', 'name email')
      .populate({
        path: 'student',
        populate: {
          path: 'studentProfile',
          model: 'StudentProfile',
          select: 'school course studentId'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Campaign.countDocuments(filterQuery);

    res.json({
      campaigns,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get verified campaigns with enhanced filters
router.get('/verified', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      location,
      school,
      minAmount,
      maxAmount,
      sort = 'createdAt'
    } = req.query;
    
    const query = { 
      status: 'active',
      'verificationStatus.overallStatus': 'verified'
    };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'institutionDetails.institutionName': { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter (you'll need to add location to your Campaign model)
    if (location) {
      query['studentProfile.location'] = { $regex: location, $options: 'i' };
    }

    // School filter
    if (school) {
      query['institutionDetails.institutionName'] = { $regex: school, $options: 'i' };
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.targetAmount = {};
      if (minAmount) query.targetAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.targetAmount.$lte = parseFloat(maxAmount);
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'currentAmount') sortOption = { currentAmount: -1 };
    if (sort === 'deadline') sortOption = { deadline: 1 };
    if (sort === 'urgency') sortOption = { deadline: 1, currentAmount: -1 };
    if (sort === 'recent') sortOption = { createdAt: -1 };

    const campaigns = await Campaign.find(query)
      .populate('student', 'name email')
      .populate('student.studentProfile')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Campaign.countDocuments(query);

    res.json({
      campaigns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user owns the campaign
    if (campaign.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates to certain fields
    const allowedUpdates = [
      'title', 'description', 'targetAmount', 'category', 'deadline',
      'institutionDetails', 'feeStructure', 'paymentInstructions'
    ];
    
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        campaign[key] = updates[key];
      }
    });

    // Recalculate outstanding balance if fee structure changed
    if (updates.feeStructure) {
      campaign.feeStructure.outstandingBalance = 
        campaign.feeStructure.totalFees - campaign.feeStructure.amountPaid;
    }

    await campaign.save();
    res.json({ message: 'Campaign updated successfully', campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route to verify campaign
router.put('/:id/verify', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const { 
      studentVerified, 
      documentsVerified, 
      institutionVerified, 
      financialsVerified,
      verificationNotes 
    } = req.body;

    // Update verification status
    if (studentVerified !== undefined) campaign.verificationStatus.studentVerified = studentVerified;
    if (documentsVerified !== undefined) campaign.verificationStatus.documentsVerified = documentsVerified;
    if (institutionVerified !== undefined) campaign.verificationStatus.institutionVerified = institutionVerified;
    if (financialsVerified !== undefined) campaign.verificationStatus.financialsVerified = financialsVerified;
    
    // Update overall status
    if (campaign.verificationStatus.studentVerified && 
        campaign.verificationStatus.documentsVerified && 
        campaign.verificationStatus.institutionVerified && 
        campaign.verificationStatus.financialsVerified) {
      campaign.verificationStatus.overallStatus = 'verified';
      campaign.isVerified = true;
      campaign.status = 'active';
    } else {
      campaign.verificationStatus.overallStatus = 'under_review';
    }

    if (verificationNotes) campaign.verificationNotes = verificationNotes;

    // Add to verification history
    campaign.verificationHistory.push({
      action: 'Verification update',
      performedBy: req.user.id,
      notes: verificationNotes || 'Verification status updated'
    });

    await campaign.save();
    
    await campaign.populate('verificationHistory.performedBy', 'name email');
    
    res.json({ message: 'Campaign verification updated successfully', campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;