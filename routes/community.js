const express = require('express');
const { body } = require('express-validator');
const communityController = require('../controllers/communityController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();



// GET /api/community/search
// Search community posts with AI enhancement
router.get('/search', communityController.searchPosts);

// GET /api/community/posts
// Get all community posts with optional filters
router.get('/posts', communityController.getAllPosts);

// POST /api/community/posts
// Create a new community post
router.post('/posts', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('category').optional().isString().withMessage('Category must be a string')
], communityController.createPost);

// GET /api/community/insights
// Get AI-powered community insights
router.get('/insights', communityController.getCommunityInsights);

// GET /api/community/trending
// Get trending topics
router.get('/trending', communityController.getTrendingTopics);

// GET /api/community/categories
// Get available categories
router.get('/categories', communityController.getCategories);

// POST /api/community/posts/:id/like
// Like a community post
router.post('/posts/:id/like', authenticateToken, communityController.likePost);

// POST /api/community/posts/:id/comment
// Add a comment to a community post
router.post('/posts/:id/comment', authenticateToken, [
  body('content').notEmpty().withMessage('Comment content is required')
], communityController.addComment);

// GET /api/community/suggestions
// Get AI-powered search suggestions
router.get('/suggestions', communityController.getSearchSuggestions);

module.exports = router; 