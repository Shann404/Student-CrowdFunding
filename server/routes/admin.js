const express = require('express');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Donation = require('../models/Donation');
const StudentProfile = require('../models/StudentProfile');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingCampaigns = await Campaign.countDocuments({ status: 'under_review' });
    const pendingWithdrawals = await Campaign.countDocuments({
      'withdrawalRequests.status': 'pending'
    });

    const recentCampaigns = await Campaign.find()
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalCampaigns,
        totalUsers,
        totalDonations,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
        pendingCampaigns,
        pendingWithdrawals
      },
      recentCampaigns
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get campaigns for review
router.get('/campaigns/review', auth, adminAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: 'under_review' })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or reject campaign
router.patch('/campaigns/:id/review', auth, adminAuth, async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        status: status === 'active' ? 'active' : 'rejected',
        isVerified: status === 'active',
        verificationNotes
      },
      { new: true }
    ).populate('student', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({
      message: `Campaign ${status} successfully`,
      campaign
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get withdrawal requests
router.get('/withdrawals', auth, adminAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      'withdrawalRequests.status': 'pending'
    })
    .populate('student', 'name email')
    .select('title currentAmount withdrawalRequests student');

    res.json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process withdrawal request
router.patch('/withdrawals/:campaignId/process', auth, adminAuth, async (req, res) => {
  try {
    const { requestId, status, adminNotes } = req.body;

    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const withdrawalRequest = campaign.withdrawalRequests.id(requestId);
    if (!withdrawalRequest) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    withdrawalRequest.status = status;
    withdrawalRequest.adminNotes = adminNotes;
    withdrawalRequest.processedAt = new Date();

    await campaign.save();

    res.json({
      message: `Withdrawal request ${status} successfully`,
      campaign
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role or status
router.patch('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { role, isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;