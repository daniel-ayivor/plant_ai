const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');
const diagnosisRoutes = require('./routes/diagnosis');
const communityRoutes = require('./routes/community');

// Import Passport configuration
const { passport } = require('./config/passport');

// Import middleware
const { authenticateToken, optionalAuth } = require('./middleware/auth');
const connectDB = require('./config/db');
connectDB();

const app = express();
const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet());
app.use(cors());

// Passport middleware
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/community', communityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PlantAI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Plant Disease Detection',
      'Google & Facebook OAuth',
      'Community Search with AI',
      'Plant Management',
      'Diagnosis History'
    ]
  });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'PlantAI API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (protected)',
        'PUT /api/auth/profile': 'Update user profile (protected)',
        'POST /api/auth/logout': 'Logout user (protected)',
        'GET /api/auth/verify': 'Verify JWT token (protected)',
        'GET /api/auth/google': 'Google OAuth login',
        'GET /api/auth/facebook': 'Facebook OAuth login'
      },
      plants: {
        'GET /api/plants': 'Get all user plants (protected)',
        'POST /api/plants': 'Create a new plant (protected)',
        'GET /api/plants/:id': 'Get specific plant (protected)',
        'PUT /api/plants/:id': 'Update plant (protected)',
        'DELETE /api/plants/:id': 'Delete plant (protected)',
        'POST /api/plants/:id/diagnosis': 'Add diagnosis to plant (protected)',
        'GET /api/plants/:id/diagnosis': 'Get plant diagnosis history (protected)',
        'GET /api/plants/health/summary': 'Get health summary (protected)'
      },
      diagnosis: {
        'POST /api/diagnosis/upload': 'Upload image for disease diagnosis',
        'POST /api/diagnosis/batch': 'Process multiple images',
        'GET /api/diagnosis/history': 'Get diagnosis history',
        'GET /api/diagnosis/diseases': 'Get supported diseases'
      },
      community: {
        'GET /api/community/search': 'Search community posts with AI',
        'GET /api/community/posts': 'Get all community posts',
        'POST /api/community/posts': 'Create community post (protected)',
        'GET /api/community/insights': 'Get AI-powered insights',
        'GET /api/community/trending': 'Get trending topics',
        'GET /api/community/categories': 'Get available categories',
        'POST /api/community/posts/:id/like': 'Like a post (protected)',
        'POST /api/community/posts/:id/comment': 'Add comment (protected)',
        'GET /api/community/suggestions': 'Get AI search suggestions'
      }
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      oauth: 'Google and Facebook OAuth supported'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'Check /api/docs for available endpoints'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PlantAI server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

module.exports = app; 