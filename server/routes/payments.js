const express = require('express');
const Stripe = require('stripe');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { auth } = require('../middleware/auth');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { campaignId, amount, currency = 'usd' } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Calculate application fee (2.9% + $0.30)
    const applicationFee = Math.round(amount * 0.029 + 30);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        campaignId: campaignId.toString(),
        donorId: req.user.id.toString()
      },
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: process.env.STRIPE_CONNECT_ACCOUNT_ID, // Platform account
      },
    });

    // Create donation record
    const donation = new Donation({
      donor: req.user.id,
      campaign: campaignId,
      amount: amount / 100, // Store in dollars
      currency,
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id,
      fee: applicationFee / 100
    });

    await donation.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donation._id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { donationId } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(donation.paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      donation.status = 'completed';
      await donation.save();

      // Update campaign amount
      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { currentAmount: donation.amount }
      });

      res.json({ message: 'Payment confirmed successfully', donation });
    } else {
      donation.status = 'failed';
      await donation.save();
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;