const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = User.verifyToken(token);
    
    // Get user from database
    const user = User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication middleware
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = User.verifyToken(token);
      const user = User.findById(decoded.userId);
      if (user) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = User.verifyToken(token);
    
    // Get user from database
    const user = User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateAdmin
}; 