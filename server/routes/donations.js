const express = require('express');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all donations for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const donations = await Donation.find({ 
      campaign: req.params.campaignId,
      status: 'completed'
    })
    .populate('donor', 'name profilePicture')
    .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's donations
router.get('/my-donations', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('campaign', 'title student')
      .populate({
        path: 'campaign',
        populate: {
          path: 'student',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments({ donor: req.user.id });
    const totalAmount = await Donation.aggregate([
      { $match: { donor: req.user.id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentDonations = await Donation.find({ donor: req.user.id })
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalDonations,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      recentDonations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation record (for non-Stripe payments)
router.post('/', auth, async (req, res) => {
  try {
    const { campaignId, amount, currency, paymentMethod, message, isAnonymous } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const donation = new Donation({
      donor: req.user.id,
      campaign: campaignId,
      amount,
      currency,
      paymentMethod,
      message,
      isAnonymous
    });

    let donor = await Donor.findOne({ user: req.user.id });
if (!donor) {
  donor = new Donor({
    user: req.user.id,
    totalDonated: 0,
    campaignsSupported: []
  });
}

// Update total donated
donor.totalDonated += parseFloat(amount);

// Update campaigns supported
const existingCampaignSupport = donor.campaignsSupported.find(
  support => support.campaign.toString() === campaignId
);

if (existingCampaignSupport) {
  existingCampaignSupport.totalAmount += parseFloat(amount);
  existingCampaignSupport.lastDonation = new Date();
} else {
  donor.campaignsSupported.push({
    campaign: campaignId,
    totalAmount: parseFloat(amount),
    firstDonation: new Date(),
    lastDonation: new Date()
  });
}

    await donation.save();
    await donation.populate('donor', 'name profilePicture');
    await donation.populate('campaign', 'title');

    res.status(201).json({
      message: 'Donation recorded successfully',
      donation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;