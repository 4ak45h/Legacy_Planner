const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  // Tokens are usually sent in the format: "Bearer <token>"
  const token = req.header('x-auth-token'); 

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // Decode the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // The decoded token contains the user's ID (payload: { user: { id: user.id } })
    // Attach the user object to the request so we can access it in the route handler
    req.user = decoded.user; 
    
    // Move on to the next middleware or the route handler
    next(); 
  } catch (err) {
    // If verification fails (e.g., token expired or tampered with)
    res.status(401).json({ msg: 'Token is not valid' });
  }
};