const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
// Register a new user
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

// POST /api/auth/login
// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// GET /api/auth/profile
// Get user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

// PUT /api/auth/profile
// Update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email')
], authController.updateProfile);

// POST /api/auth/logout
// Logout user (in JWT, logout is client-side by removing token)
router.post('/logout', authenticateToken, authController.logout);

// Google OAuth Routes
// GET /api/auth/google
// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// GET /api/auth/google/callback
// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  authController.handleOAuthCallback
);

// Facebook OAuth Routes
// GET /api/auth/facebook
// Initiate Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email'] 
}));

// GET /api/auth/facebook/callback
// Facebook OAuth callback
router.get('/facebook/callback', 
  passport.authenticate('facebook', { session: false }),
  authController.handleOAuthCallback
);

// GET /api/auth/verify
// Verify JWT token
router.get('/verify', authenticateToken, authController.verifyToken);

module.exports = router; 