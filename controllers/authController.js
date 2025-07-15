const User = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const newUser = new User({ username, email, password });
      await newUser.save();
      res.status(201).json({ success: true, user: newUser });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user', message: error.message });
    }
  }

  // Login user
  async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = User.generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user,
        token
      });

    } catch (error) {
      console.error('❌ Error in user login:', error);
      res.status(500).json({ 
        error: 'Failed to login',
        message: error.message 
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        success: true,
        user
      });

    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user profile',
        message: error.message 
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email } = req.body;

      // Check if new email/username already exists
      if (email) {
        const existingUser = User.findByEmail(email);
        if (existingUser && existingUser.id !== req.user.userId) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // Update user
      const updatedUser = await User.update(req.user.userId, { username, email });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      res.status(500).json({ 
        error: 'Failed to update profile',
        message: error.message 
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('❌ Error in logout:', error);
      res.status(500).json({ 
        error: 'Failed to logout',
        message: error.message 
      });
    }
  }

  // Verify JWT token
  async verifyToken(req, res) {
    try {
      const user = User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('❌ Error verifying token:', error);
      res.status(500).json({ 
        error: 'Failed to verify token',
        message: error.message 
      });
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(req, res) {
    try {
      const token = User.generateToken(req.user);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth-callback?token=${token}&provider=${req.user.provider}`);
    } catch (error) {
      console.error('❌ Error in OAuth callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth-error`);
    }
  }
}

module.exports = new AuthController(); 