const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Add this line
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    const userId = decoded.id || decoded.user?.id; // Support both formats
    console.log('UserId used for lookup:', userId);
    const user = await User.findById(userId);
    console.log('User found:', user);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
};

module.exports = { authenticate, authorize }; 