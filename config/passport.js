const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user storage (in production, use a database)
const users = [];

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = users.find(u => u.googleId === profile.id);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      
      users.push(user);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = users.find(u => u.facebookId === profile.id);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        facebookId: profile.id,
        username: profile.displayName,
        email: profile.emails ? profile.emails[0].value : null,
        avatar: profile.photos ? profile.photos[0].value : null,
        provider: 'facebook',
        createdAt: new Date().toISOString()
      };
      
      users.push(user);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      provider: user.provider 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Helper function to get user by ID
const getUserById = (id) => {
  return users.find(u => u.id === id);
};

// Helper function to get user by email
const getUserByEmail = (email) => {
  return users.find(u => u.email === email);
};

module.exports = {
  passport,
  generateToken,
  getUserById,
  getUserByEmail,
  users
}; 