const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FinancialProfile = require('../models/FinancialProfile');
const { runFinancialAnalysis } = require('../utils/financialAnalysis'); // NOTE: This is the async function now

// @route   POST /api/profile
// @desc    Create or Update Financial Profile and Run Analysis (PROTECTED)
router.post('/', auth, async (req, res) => {
    try {
        // --- 1. Calculate Total Expenses from Budget ---
        const { budget } = req.body;
        let monthlyExpensesTotal = 0;
        if (budget) {
            // Sum all values in the budget object, ensuring they are numbers
            monthlyExpensesTotal = Object.values(budget).reduce((acc, val) => acc + (Number(val) || 0), 0);
        }
        
        // Add the calculated total to the req.body so it can be used by the analysis function
        req.body.monthlyExpensesTotal = monthlyExpensesTotal;
        
        // --- 2. Basic Input Validation ---
        const { monthlyIncome } = req.body;
        if (!monthlyIncome || isNaN(Number(monthlyIncome))) {
            return res.status(400).json({ msg: 'Monthly income must be a valid number.' });
        }
        if (req.body.property && (!req.body.property.targetPrice || isNaN(Number(req.body.property.targetPrice)))) {
            return res.status(400).json({ msg: 'Target price must be a valid number.' });
        }
        
        // --- 3. Run Analysis (CRITICAL CHANGE: Added AWAIT) ---
        // We must await this function as it makes an external call to the Python ML server
        const analysisResults = await runFinancialAnalysis(req.body); 

        // Combine the submitted data (including budget) with the calculated total and analysis
        const updateFields = { 
            ...req.body, 
            monthlyExpensesTotal: monthlyExpensesTotal, // Explicitly save the total
            analysis: analysisResults.analysis 
        };
        
        let profile = await FinancialProfile.findOne({ user: req.user.id });

        // --- 4. Save or Update ---
        if (profile) {
            // Update existing profile
            profile = await FinancialProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: updateFields }, 
                { new: true } // Return the updated document
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


// @route   POST /api/profile/chat
// @desc    Chat with AI advisor using profile data
// @access  Protected
router.post('/chat', auth, async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ msg: 'No question provided.' });
  }

  try {
    // 1. Retrieve the user's financial profile
    const profile = await FinancialProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ msg: 'Financial profile not found. Please complete your profile first.' });
    }

    // 2. Construct a detailed prompt for the Gemini API
    const systemPrompt = `You are a professional financial advisor for a platform called "Legacy Planner". 
    Your user is asking a question based on their saved financial data. 
    You must provide a concise, helpful, and safe answer.
    
    **CRITICAL INSTRUCTION: All monetary figures MUST use the Indian Rupee symbol (₹) and follow Indian number formatting (e.g., ₹1,00,000).**
    
    Do not give speculative investment advice (e.g., "buy X stock"). 
    Focus on practical financial planning (budgeting, saving, debt management).
    
    USER'S FINANCIAL DATA:
    - Monthly Income: ${profile.monthlyIncome.toLocaleString('en-IN')}
    - Monthly Expenses Total: ${profile.monthlyExpensesTotal.toLocaleString('en-IN')}
    - Current Savings: ${profile.currentSavings.toLocaleString('en-IN')}
    - Investment Portfolio: ${profile.investmentPortfolio.toLocaleString('en-IN')}
    - Debt Payments (from budget): ${profile.budget.debtPayments.toLocaleString('en-IN')}
    - Credit Score: ${profile.creditScore}
    - Dream Property Target Price: ${profile.property.targetPrice.toLocaleString('en-IN')}
    - Desired Timeline: ${profile.property.desiredTimelineYears} years
    - Calculated Monthly Savings Potential: ${profile.analysis.monthlySavingsPotential.toLocaleString('en-IN')}
    - Calculated EMI: ${profile.analysis.estimatedEMI.toLocaleString('en-IN')}
    - Calculated Monthly Savings Required for Goal: ${profile.analysis.monthlySavingsRequired.toLocaleString('en-IN')}
    - Affordability Score: ${profile.analysis.affordabilityScore}
    
    You must ground your answer *only* in the data provided.
    Start your answer by directly addressing the user's question.`;

    const userQuery = `My question is: "${question}"`;

    // 3. Call the Gemini API
    const apiKey = process.env.GEMINI_API_KEY; // Read the key from .env
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in .env file.");
    }

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    // Use exponential backoff for retries
    let apiResponse;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        try {
            apiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (apiResponse.ok) break; // Success
            if (apiResponse.status === 429 || apiResponse.status >= 500) {
                // Throttling or server error, wait and retry
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                attempts++;
            } else {
                // Other client-side error
                throw new Error(`API request failed with status ${apiResponse.status}`);
            }
        } catch (fetchError) {
             // Network error, wait and retry
             await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
             attempts++;
             if (attempts >= maxAttempts) throw fetchError;
        }
    }

    if (!apiResponse || !apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error("Gemini API Error Body:", errorBody);
      throw new Error('Gemini API request failed after retries.');
    }

    const result = await apiResponse.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ msg: 'AI failed to generate a response.' });
    }

    // 4. Send the AI's answer back to the front-end
    res.json({ answer: text });

  } catch (err) {
    console.error('Chat API Error:', err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;