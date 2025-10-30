const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FinancialProfile = require('../models/FinancialProfile');
const { runFinancialAnalysis } = require('../utils/financialAnalysis'); // <-- IMPORTANT: Make sure this path is correct

// @route   POST /api/profile
// @desc    Create or Update Financial Profile and Run Analysis (PROTECTED)
router.post('/', auth, async (req, res) => {
    try {
        // --- 1. Basic Input Validation (to prevent Mongoose silent failure) ---
        // Ensure required numeric fields are sent as numbers, not empty strings
        const { monthlyIncome, monthlyExpenses, targetPrice, downPaymentPercentage, desiredTimelineYears } = req.body;
        
        if (isNaN(Number(monthlyIncome)) || isNaN(Number(monthlyExpenses))) {
            return res.status(400).json({ msg: 'Monthly income and expenses must be valid numbers.' });
        }
        if (req.body.property && (isNaN(Number(req.body.property.targetPrice)))) {
            return res.status(400).json({ msg: 'Target price must be a valid number.' });
        }
        
        // --- 2. Run Analysis ---
        const analysisResults = runFinancialAnalysis(req.body); 

        // Combine the submitted data with the calculated analysis
        // The `updateFields` variable now contains all cleaned form data + analysis results
        const updateFields = { ...req.body, analysis: analysisResults.analysis };
        
        let profile = await FinancialProfile.findOne({ user: req.user.id });

        // --- 3. Save or Update ---
        if (profile) {
            // Update existing profile
            profile = await FinancialProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: updateFields }, 
                { new: true }
            );
            return res.json(profile);
        }

        // Create new profile
        const profileFields = { user: req.user.id, ...updateFields };
        profile = new FinancialProfile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        // Catch any Mongoose validation errors or server errors
        console.error("Profile Save Failed:", err.message);

        // Check for specific Mongoose validation errors
        if (err.name === 'ValidationError') {
             return res.status(400).json({ msg: 'Mongoose Validation Error: ' + err.message });
        }

        res.status(500).send('Server Error during profile update.');
    }
});

// @route   GET /api/profile/me
// @desc    Get current user's financial profile (PROTECTED)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await FinancialProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ msg: 'Financial profile not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
