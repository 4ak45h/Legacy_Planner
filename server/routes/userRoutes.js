const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import the middleware

// @route   GET /api/user/profile
// @desc    Get logged in user profile (Requires token)
router.get('/profile', auth, async (req, res) => {
  try {
    // req.user was set by the 'auth' middleware, giving us the ID of the logged-in user
    // We can use the ID to fetch specific user data, but for now, we just confirm authentication.
    res.json({
      msg: 'Authentication Successful',
      userId: req.user.id,
      accessLevel: 'Legacy Planner User'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;