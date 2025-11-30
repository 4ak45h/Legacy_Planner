const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Will = require('../models/Will');
const User = require('../models/User'); // Need User model to check password
const bcrypt = require('bcryptjs'); // Need bcrypt to verify password

// @route   GET /api/will
// @desc    Get the user's will details
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const will = await Will.findOne({ user: req.user.id });
    if (!will) {
      return res.status(404).json({ msg: 'No will details found for this user.' });
    }
    res.json(will);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/will
// @desc    Create or securely update will details
// @access  Protected
router.post('/', auth, async (req, res) => {
  const { 
    location, executorName, executorPhone, 
    lawyerName, lawyerContact, notes, 
    password, reason // <-- Expect password and reason for updates
  } = req.body;

  const willFields = {
    user: req.user.id,
    location,
    executorName,
    executorPhone,
    lawyerName,
    lawyerContact,
    notes,
    lastUpdateReason: reason || 'Initial Draft',
    lastUpdated: Date.now(),
  };

  try {
    let will = await Will.findOne({ user: req.user.id });

    if (will) {
      // --- SECURITY CHECK FOR UPDATE ---
      // If a will exists, we MUST verify the password before allowing overwrite
      if (!password) {
        return res.status(400).json({ msg: 'Password is required to update an existing will.' });
      }

      // Find the user to get their hashed password
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found.' });
      }

      // Compare provided password with stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Incorrect password. Will update denied.' });
      }

      // If password matches, proceed with update
      will = await Will.findOneAndUpdate(
        { user: req.user.id },
        { $set: willFields },
        { new: true }
      );
      return res.json(will);
    }

    // --- CREATE NEW (First Time) ---
    // No password needed for the very first draft
    will = new Will(willFields);
    await will.save();
    res.json(will);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;