const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LegacyContact = require('../models/LegacyContact');
const FinancialProfile = require('../models/FinancialProfile'); // <--- NEW IMPORT ADDED
const crypto = require('crypto');

// @route   POST /api/contacts
// @desc    Designate a new legacy contact (PROTECTED)
router.post('/', auth, async (req, res) => {
  const { contactName, contactEmail } = req.body;
  
  try {
    // 1. Check if this contact already exists for the user
    let existingContact = await LegacyContact.findOne({ user: req.user.id, contactEmail });
    if (existingContact) {
      return res.status(400).json({ msg: 'This email is already designated as a contact.' });
    }
    
    // 2. Generate a unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // 3. Create the new designation
    const newContact = new LegacyContact({
      user: req.user.id,
      contactName,
      contactEmail,
      verificationToken,
      status: 'Pending',
    });

    const contact = await newContact.save();

    console.log(`[EMAIL SIMULATED] Legacy Data Retrieval Token for ${contactEmail}: ${verificationToken}`);

    res.json(contact);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/contacts
// @desc    Get all designated legacy contacts for the user (PROTECTED)
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await LegacyContact.find({ user: req.user.id }).sort({ dateDesignated: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// =======================================================
// PUBLIC RETRIEVAL ROUTE
// =======================================================
// @route   GET /api/contacts/retrieve/:token
// @desc    Retrieve user data using the unique verification token (PUBLIC)
router.get('/retrieve/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Find the Legacy Contact using the token
    const legacyContact = await LegacyContact.findOne({ verificationToken: token });

    if (!legacyContact) {
      return res.status(404).json({ msg: 'Invalid or expired retrieval token.' });
    }

    // 2. Find the original user's profile using the linked user ID
    // This connects the legacy contact to the stored financial profile
    const profile = await FinancialProfile.findOne({ user: legacyContact.user });
    
    if (!profile) {
        return res.status(404).json({ msg: 'User profile not found or deleted.' });
    }

    // 3. Optional: Update the status (e.g., set to 'Active')
    if (legacyContact.status !== 'Active') {
        legacyContact.status = 'Active';
        await legacyContact.save();
    }

    // 4. Return the key data (Financial Profile)
    res.json({
        status: legacyContact.status,
        userProfile: profile.fullName,
        retrievedData: profile.property, 
        fullAnalysis: profile.analysis,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
