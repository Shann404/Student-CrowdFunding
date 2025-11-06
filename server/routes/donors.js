const express = require('express');
const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get donor profile
router.get('/profile', auth, async (req, res) => {
  try {
    let donor = await Donor.findOne({ user: req.user.id })
      .populate('campaignsSupported.campaign', 'title student images category')
      .populate('campaignsSupported.campaign.student', 'name');

    // If donor profile doesn't exist, create one
    if (!donor) {
      donor = new Donor({
        user: req.user.id,
        totalDonated: 0,
        campaignsSupported: []
      });
      await donor.save();
    }

    res.json(donor);
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor's donations
router.get('/donations', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('campaign', 'title student images category')
      .populate('campaign.student', 'name')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Error fetching donor donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donor preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { emailNotifications, monthlyUpdates, anonymousByDefault } = req.body;

    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    donor.preferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : donor.preferences.emailNotifications,
      monthlyUpdates: monthlyUpdates !== undefined ? monthlyUpdates : donor.preferences.monthlyUpdates,
      anonymousByDefault: anonymousByDefault !== undefined ? anonymousByDefault : donor.preferences.anonymousByDefault
    };

    await donor.save();
    res.json({ message: 'Preferences updated successfully', preferences: donor.preferences });
  } catch (error) {
    console.error('Error updating donor preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donor profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { phone, address } = req.body;

    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    if (phone) donor.phone = phone;
    if (address) donor.address = address;

    await donor.save();
    res.json({ message: 'Profile updated successfully', donor });
  } catch (error) {
    console.error('Error updating donor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;