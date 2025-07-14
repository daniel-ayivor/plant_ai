const CommunityPost = require('../models/CommunityPost');
const communitySearch = require('../services/communitySearch');
const { validationResult } = require('express-validator');

class CommunityController {
  // Search community posts with AI enhancement
  async searchPosts(req, res) {
    try {
      const { q: query, category, minLikes, limit = 10 } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filters = {};
      if (category) filters.category = category;
      if (minLikes) filters.minLikes = parseInt(minLikes);

      const searchResults = await communitySearch.searchPosts(query, filters);

      // Limit results
      searchResults.results = searchResults.results.slice(0, limit);

      res.status(200).json(searchResults);

    } catch (error) {
      console.error('❌ Error in community search:', error);
      res.status(500).json({ 
        error: 'Failed to search community',
        message: error.message 
      });
    }
  }

  // Get all community posts with optional filters
  async getAllPosts(req, res) {
    try {
      const { category, sortBy = 'createdAt', order = 'desc', limit = 20 } = req.query;
      const filter = {};
      if (category) filter.category = category;

      const sort = {};
      sort[sortBy] = order === 'desc' ? -1 : 1;

      const posts = await CommunityPost.find(filter)
        .sort(sort)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        posts,
        total: posts.length
      });
    } catch (error) {
      console.error('❌ Error fetching community posts:', error);
      res.status(500).json({
        error: 'Failed to fetch community posts',
        message: error.message
      });
    }
  }

  // Create a new community post
  async createPost(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, tags, category } = req.body;

      const postData = {
        userId: req.user.userId,
        username: req.user.username || 'Anonymous',
        title,
        content,
        tags,
        category
      };

      const result = await communitySearch.createPost(postData);

      res.status(201).json(result);

    } catch (error) {
      console.error('❌ Error creating community post:', error);
      res.status(500).json({ 
        error: 'Failed to create community post',
        message: error.message 
      });
    }
  }

  // Get AI-powered community insights
  async getCommunityInsights(req, res) {
    try {
      const insights = await communitySearch.getCommunityInsights();

      res.status(200).json({
        success: true,
        insights
      });

    } catch (error) {
      console.error('❌ Error fetching community insights:', error);
      res.status(500).json({ 
        error: 'Failed to fetch community insights',
        message: error.message 
      });
    }
  }

  // Get trending topics
  async getTrendingTopics(req, res) {
    try {
      const trendingTopics = await communitySearch.getTrendingTopics();

      res.status(200).json({
        success: true,
        trendingTopics
      });

    } catch (error) {
      console.error('❌ Error fetching trending topics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trending topics',
        message: error.message 
      });
    }
  }

  // Get available categories
  async getCategories(req, res) {
    try {
      const categories = [
        { id: 'gardening-tips', name: 'Gardening Tips', description: 'General gardening advice' },
        { id: 'pest-control', name: 'Pest Control', description: 'Natural pest management' },
        { id: 'plant-diseases', name: 'Plant Diseases', description: 'Disease identification and treatment' },
        { id: 'urban-gardening', name: 'Urban Gardening', description: 'Small space gardening solutions' },
        { id: 'organic-gardening', name: 'Organic Gardening', description: 'Natural and organic methods' },
        { id: 'seasonal-care', name: 'Seasonal Care', description: 'Season-specific plant care' }
      ];

      res.status(200).json({
        success: true,
        categories
      });

    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      res.status(500).json({ 
        error: 'Failed to fetch categories',
        message: error.message 
      });
    }
  }

  // Like a community post
  async likePost(req, res) {
    try {
      const postId = req.params.id;
      const updatedPost = CommunityPost.like(postId);

      res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        likes: updatedPost.likes
      });

    } catch (error) {
      console.error('❌ Error liking post:', error);
      res.status(500).json({ 
        error: 'Failed to like post',
        message: error.message 
      });
    }
  }

  // Add a comment to a community post
  async addComment(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const postId = req.params.id;
      const { content } = req.body;

      const commentData = {
        userId: req.user.userId,
        username: req.user.username || 'Anonymous',
        content
      };

      const comment = CommunityPost.addComment(postId, commentData);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment
      });

    } catch (error) {
      console.error('❌ Error adding comment:', error);
      res.status(500).json({ 
        error: 'Failed to add comment',
        message: error.message 
      });
    }
  }

  // Get AI-powered search suggestions
  async getSearchSuggestions(req, res) {
    try {
      const { q: query } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const suggestions = await communitySearch.generateSearchSuggestions(query);

      res.status(200).json({
        success: true,
        query,
        suggestions
      });

    } catch (error) {
      console.error('❌ Error generating suggestions:', error);
      res.status(500).json({ 
        error: 'Failed to generate suggestions',
        message: error.message 
      });
    }
  }

  // Get trending posts
  async getTrendingPosts(req, res) {
    try {
      const { limit = 10 } = req.query;
      const trendingPosts = CommunityPost.getTrending(parseInt(limit));

      res.status(200).json({
        success: true,
        posts: trendingPosts,
        total: trendingPosts.length
      });

    } catch (error) {
      console.error('❌ Error fetching trending posts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch trending posts',
        message: error.message 
      });
    }
  }

  // Get posts by engagement
  async getPostsByEngagement(req, res) {
    try {
      const { limit = 10 } = req.query;
      const posts = CommunityPost.getByEngagement(parseInt(limit));

      res.status(200).json({
        success: true,
        posts,
        total: posts.length
      });

    } catch (error) {
      console.error('❌ Error fetching posts by engagement:', error);
      res.status(500).json({ 
        error: 'Failed to fetch posts by engagement',
        message: error.message 
      });
    }
  }

  // Get community statistics
  async getCommunityStats(req, res) {
    try {
      const stats = {
        totalPosts: CommunityPost.getCount(),
        totalCategories: CommunityPost.getCategories().length,
        trendingPosts: CommunityPost.getTrending(5).length,
        engagementPosts: CommunityPost.getByEngagement(5).length
      };

      res.status(200).json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Error fetching community stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch community stats',
        message: error.message 
      });
    }
  }
}

module.exports = new CommunityController(); 