const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import the auth middleware
const Asset = require('../models/Asset'); // Import the Asset model

// @route   POST /api/assets
// @desc    Create a new legacy asset (PROTECTED)
router.post('/', auth, async (req, res) => {
  // req.user.id is available thanks to the 'auth' middleware
  const { category, name, primaryData, notes } = req.body;
  try {
    const newAsset = new Asset({
      user: req.user.id, // Assign the asset to the logged-in user
      category,
      name,
      primaryData,
      notes,
    });

    const asset = await newAsset.save();
    res.json(asset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/assets
// @desc    Get all assets for the logged-in user (PROTECTED)
router.get('/', auth, async (req, res) => {
  try {
    // Find all assets where the user field matches the logged-in user's ID
    const assets = await Asset.find({ user: req.user.id }).sort({ date: -1 });
    res.json(assets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Note: You would add PUT (Update) and DELETE routes here next.

module.exports = router;