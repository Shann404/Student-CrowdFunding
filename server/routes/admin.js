const express = require('express');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Get dashboard statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalDonors,
      totalCampaigns,
      activeCampaigns,
      pendingCampaigns,
      totalDonations,
      totalAmountRaised
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'donor' }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ 'verificationStatus.overallStatus': 'pending' }),
      Donation.countDocuments({ status: 'completed' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Recent activities
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('donor', 'name')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCampaigns = await Campaign.find()
      .populate('student', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalDonors,
        totalCampaigns,
        activeCampaigns,
        pendingCampaigns,
        totalDonations,
        totalAmountRaised: totalAmountRaised[0]?.total || 0
      },
      recentActivities: {
        donations: recentDonations,
        campaigns: recentCampaigns
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination and filters
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sort = 'createdAt' } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get campaigns for approval
router.get('/campaigns/pending', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const campaigns = await Campaign.find({
      'verificationStatus.overallStatus': { $in: ['pending', 'under_review'] }
    })
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Campaign.countDocuments({
      'verificationStatus.overallStatus': { $in: ['pending', 'under_review'] }
    });

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
    console.error('Admin pending campaigns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or reject campaign
router.put('/campaigns/:id/verify', [
  auth,
  adminAuth,
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, notes } = req.body;
    const campaign = await Campaign.findById(req.params.id)
      .populate('student', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (action === 'approve') {
      campaign.verificationStatus = {
        studentVerified: true,
        documentsVerified: true,
        institutionVerified: true,
        financialsVerified: true,
        overallStatus: 'verified'
      };
      campaign.status = 'active';
      campaign.isVerified = true;
    } else {
      campaign.verificationStatus.overallStatus = 'rejected';
      campaign.status = 'cancelled';
    }

    campaign.verificationNotes = notes;
    
    // Add to verification history
    campaign.verificationHistory.push({
      action: `Campaign ${action}d`,
      performedBy: req.user.id,
      notes: notes || `Campaign ${action}d by admin`
    });

    await campaign.save();

    // TODO: Send email notification to student

    res.json({
      message: `Campaign ${action}d successfully`,
      campaign
    });
  } catch (error) {
    console.error('Admin campaign verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations
router.get('/donations', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, campaignId, donorId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (campaignId) query.campaign = campaignId;
    if (donorId) query.donor = donorId;

    const donations = await Donation.find(query)
      .populate('donor', 'name email')
      .populate('campaign', 'title student')
      .populate('campaign.student', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Monthly donations data
    const monthlyDonations = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top campaigns
    const topCampaigns = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$campaign',
          totalRaised: { $sum: '$amount' },
          donationCount: { $sum: 1 }
        }
      },
      { $sort: { totalRaised: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      {
        $lookup: {
          from: 'users',
          localField: 'campaign.student',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' }
    ]);

    // Top donors
    const topDonors = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$donor',
          totalDonated: { $sum: '$amount' },
          donationCount: { $sum: 1 }
        }
      },
      { $sort: { totalDonated: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor'
        }
      },
      { $unwind: '$donor' }
    ]);

    // Campaign categories distribution
    const categoryDistribution = await Campaign.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRaised: { $sum: '$currentAmount' }
        }
      }
    ]);

    res.json({
      monthlyDonations,
      topCampaigns,
      topDonors,
      categoryDistribution
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Flag user or campaign
router.post('/flag', [
  auth,
  adminAuth,
  body('type').isIn(['user', 'campaign']).withMessage('Type must be user or campaign'),
  body('targetId').isMongoId().withMessage('Valid target ID required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('severity').isIn(['low', 'medium', 'high']).withMessage('Severity must be low, medium, or high')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, targetId, reason, severity } = req.body;

    if (type === 'user') {
      const user = await User.findByIdAndUpdate(
        targetId,
        {
          $push: {
            flags: {
              reason,
              severity,
              flaggedBy: req.user.id,
              flaggedAt: new Date()
            }
          },
          isSuspended: severity === 'high'
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      const campaign = await Campaign.findByIdAndUpdate(
        targetId,
        {
          $push: {
            flags: {
              type: 'admin_flag',
              description: reason,
              severity,
              raisedBy: req.user.id,
              raisedAt: new Date()
            }
          },
          status: severity === 'high' ? 'cancelled' : 'under_review'
        },
        { new: true }
      );

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
    }

    res.json({ message: `${type} flagged successfully` });
  } catch (error) {
    console.error('Admin flag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user suspension
router.put('/users/:id/suspend', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `User ${user.isSuspended ? 'suspended' : 'activated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Admin suspend user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate reports
router.get('/reports/:type', auth, adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let report;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    switch (type) {
      case 'donations':
        report = await Donation.find({ ...dateFilter, status: 'completed' })
          .populate('donor', 'name email')
          .populate('campaign', 'title student')
          .populate('campaign.student', 'name');
        break;
      
      case 'campaigns':
        report = await Campaign.find(dateFilter)
          .populate('student', 'name email');
        break;
      
      case 'users':
        report = await User.find(dateFilter).select('-password');
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json({
      type,
      dateRange: { startDate, endDate },
      data: report,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Admin report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;