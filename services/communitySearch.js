const OpenAI = require('openai');
const axios = require('axios');

class CommunitySearchService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
    });
    
    // In-memory community data (in production, use a database)
    this.communityPosts = [
      {
        id: '1',
        userId: 'user-1',
        username: 'PlantLover123',
        title: 'Best organic fertilizers for tomatoes',
        content: 'I\'ve been using fish emulsion and seaweed extract for my tomatoes. The results are amazing!',
        tags: ['tomatoes', 'fertilizer', 'organic'],
        likes: 15,
        comments: 8,
        createdAt: '2024-01-15T10:30:00Z',
        category: 'gardening-tips'
      },
      {
        id: '2',
        userId: 'user-2',
        username: 'GardenExpert',
        title: 'Natural pest control methods',
        content: 'Try neem oil and companion planting. Marigolds work great as natural pest repellents.',
        tags: ['pest-control', 'natural', 'companion-planting'],
        likes: 23,
        comments: 12,
        createdAt: '2024-01-14T15:45:00Z',
        category: 'pest-control'
      },
      {
        id: '3',
        userId: 'user-3',
        username: 'UrbanFarmer',
        title: 'Vertical gardening tips for small spaces',
        content: 'Use trellises and hanging planters. You can grow a lot in a small balcony!',
        tags: ['vertical-gardening', 'small-space', 'urban'],
        likes: 31,
        comments: 19,
        createdAt: '2024-01-13T09:20:00Z',
        category: 'urban-gardening'
      }
    ];
  }

  // Search community posts with AI enhancement
  async searchPosts(query, filters = {}) {
    try {
      // Basic text search
      let results = this.communityPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      // Apply filters
      if (filters.category) {
        results = results.filter(post => post.category === filters.category);
      }

      if (filters.minLikes) {
        results = results.filter(post => post.likes >= filters.minLikes);
      }

      // Use AI to enhance search results
      const enhancedResults = await this.enhanceSearchResults(query, results);

      return {
        success: true,
        query,
        results: enhancedResults,
        total: enhancedResults.length,
        suggestions: await this.generateSearchSuggestions(query)
      };
    } catch (error) {
      console.error('❌ Error in community search:', error);
      throw error;
    }
  }

  // Enhance search results with AI insights
  async enhanceSearchResults(query, results) {
    try {
      if (results.length === 0) {
        return results;
      }

      const prompt = `
        Analyze these community posts about gardening and plant care:
        ${results.map(post => `- ${post.title}: ${post.content}`).join('\n')}
        
        Query: "${query}"
        
        Provide insights about:
        1. Relevance to the query
        2. Practical value
        3. Community engagement
        4. Additional tips or suggestions
        
        Format as JSON with fields: relevance_score, practical_value, engagement_score, ai_suggestions
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      });

      const aiInsights = JSON.parse(completion.choices[0].message.content);

      // Enhance results with AI insights
      return results.map((post, index) => ({
        ...post,
        aiInsights: {
          relevanceScore: aiInsights.relevance_score || 0.5,
          practicalValue: aiInsights.practical_value || 'Good',
          engagementScore: aiInsights.engagement_score || 0.5,
          suggestions: aiInsights.ai_suggestions || []
        }
      })).sort((a, b) => b.aiInsights.relevanceScore - a.aiInsights.relevanceScore);

    } catch (error) {
      console.error('Error enhancing search results:', error);
      return results;
    }
  }

  // Generate AI-powered search suggestions
  async generateSearchSuggestions(query) {
    try {
      const prompt = `
        Based on the query "${query}" about gardening and plant care, suggest 5 related search terms that users might find helpful.
        Focus on practical gardening topics, plant diseases, care tips, and community-relevant terms.
        Return as a JSON array of strings.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('❌ Error generating search suggestions:', error);
      return [];
    }
  }

  // Get AI-powered community insights
  async getCommunityInsights() {
    try {
      const prompt = `
        Analyze this gardening community data and provide insights:
        ${this.communityPosts.map(post => `- ${post.title} (${post.likes} likes, ${post.comments} comments)`).join('\n')}
        
        Provide insights about:
        1. Most popular topics
        2. Community engagement trends
        3. Emerging gardening interests
        4. Seasonal trends
        
        Format as JSON with fields: popular_topics, engagement_trends, emerging_interests, seasonal_trends
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('❌ Error getting community insights:', error);
      return {
        popular_topics: ['organic gardening', 'pest control', 'urban farming'],
        engagement_trends: 'High engagement on practical tips',
        emerging_interests: ['vertical gardening', 'sustainable practices'],
        seasonal_trends: 'Spring planting and summer care tips'
      };
    }
  }

  // Create a new community post
  async createPost(postData) {
    try {
      const newPost = {
        id: Date.now().toString(),
        userId: postData.userId,
        username: postData.username,
        title: postData.title,
        content: postData.content,
        tags: postData.tags || [],
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        category: postData.category || 'general'
      };

      // Use AI to suggest tags if not provided
      if (!postData.tags || postData.tags.length === 0) {
        newPost.tags = await this.suggestTags(postData.title, postData.content);
      }

      // Use AI to suggest category if not provided
      if (!postData.category) {
        newPost.category = await this.suggestCategory(postData.title, postData.content);
      }

      this.communityPosts.push(newPost);

      return {
        success: true,
        post: newPost
      };
    } catch (error) {
      console.error('❌ Error creating community post:', error);
      throw error;
    }
  }

  // AI-powered tag suggestion
  async suggestTags(title, content) {
    try {
      const prompt = `
        Suggest 3-5 relevant tags for this gardening post:
        Title: "${title}"
        Content: "${content}"
        
        Return as a JSON array of strings. Focus on practical gardening terms.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('❌ Error suggesting tags:', error);
      return ['gardening', 'tips'];
    }
  }

  // AI-powered category suggestion
  async suggestCategory(title, content) {
    try {
      const prompt = `
        Categorize this gardening post into one of these categories:
        - gardening-tips
        - pest-control
        - plant-diseases
        - urban-gardening
        - organic-gardening
        - seasonal-care
        
        Title: "${title}"
        Content: "${content}"
        
        Return only the category name as a string.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('❌ Error suggesting category:', error);
      return 'gardening-tips';
    }
  }

  // Get trending topics
  async getTrendingTopics() {
    try {
      const prompt = `
        Based on this gardening community data, identify 5 trending topics:
        ${this.communityPosts.map(post => `- ${post.title} (${post.likes} likes)`).join('\n')}
        
        Return as a JSON array of objects with fields: topic, description, engagement_score
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('❌ Error getting trending topics:', error);
      return [
        { topic: 'Organic Fertilizers', description: 'Natural plant nutrition', engagement_score: 0.8 },
        { topic: 'Pest Control', description: 'Natural pest management', engagement_score: 0.7 },
        { topic: 'Urban Gardening', description: 'Small space solutions', engagement_score: 0.9 }
      ];
    }
  }
}

module.exports = new CommunitySearchService(); 