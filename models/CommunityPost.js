const { v4: uuidv4 } = require('uuid');

class CommunityPost {
  constructor() {
    // In-memory community post storage (in production, use a database)
    this.posts = [];
  }

  // Create a new community post
  create(postData) {
    try {
      const { userId, username, title, content, tags, category } = postData;

      const newPost = {
        id: uuidv4(),
        userId,
        username,
        title,
        content,
        tags: tags || [],
        category: category || 'general',
        likes: 0,
        comments: [],
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.posts.push(newPost);
      return newPost;
    } catch (error) {
      throw error;
    }
  }

  // Find post by ID
  findById(id) {
    return this.posts.find(post => post.id === id);
  }

  // Find posts by user ID
  findByUserId(userId) {
    return this.posts.filter(post => post.userId === userId);
  }

  // Find posts by category
  findByCategory(category) {
    return this.posts.filter(post => post.category === category);
  }

  // Get all posts with optional filters
  getAll(filters = {}) {
    let posts = [...this.posts];

    // Apply category filter
    if (filters.category) {
      posts = posts.filter(post => post.category === filters.category);
    }

    // Apply minimum likes filter
    if (filters.minLikes) {
      posts = posts.filter(post => post.likes >= filters.minLikes);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order || 'desc';

    posts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (order === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Apply limit
    if (filters.limit) {
      posts = posts.slice(0, parseInt(filters.limit));
    }

    return posts;
  }

  // Update post
  update(id, userId, updateData) {
    try {
      const postIndex = this.posts.findIndex(p => p.id === id && p.userId === userId);
      
      if (postIndex === -1) {
        throw new Error('Post not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'userId') {
          this.posts[postIndex][key] = updateData[key];
        }
      });

      this.posts[postIndex].updatedAt = new Date().toISOString();

      return this.posts[postIndex];
    } catch (error) {
      throw error;
    }
  }

  // Delete post
  delete(id, userId) {
    const postIndex = this.posts.findIndex(p => p.id === id && p.userId === userId);
    
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const deletedPost = this.posts.splice(postIndex, 1)[0];
    return deletedPost;
  }

  // Like a post
  like(id) {
    const post = this.findById(id);
    
    if (!post) {
      throw new Error('Post not found');
    }

    post.likes += 1;
    return post;
  }

  // Add comment to post
  addComment(id, commentData) {
    try {
      const post = this.findById(id);
      
      if (!post) {
        throw new Error('Post not found');
      }

      const comment = {
        id: uuidv4(),
        userId: commentData.userId,
        username: commentData.username,
        content: commentData.content,
        createdAt: new Date().toISOString()
      };

      post.comments.push(comment);
      post.commentCount = (post.commentCount || 0) + 1;
      post.updatedAt = new Date().toISOString();

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Search posts
  search(query, filters = {}) {
    let results = this.posts.filter(post => 
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

    return results;
  }

  // Get trending posts
  getTrending(limit = 10) {
    return this.posts
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  }

  // Get posts by engagement
  getByEngagement(limit = 10) {
    return this.posts
      .sort((a, b) => (b.likes + b.commentCount) - (a.likes + a.commentCount))
      .slice(0, limit);
  }

  // Get post count
  getCount() {
    return this.posts.length;
  }

  // Get posts by date range
  getByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.posts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= start && postDate <= end;
    });
  }

  // Get categories with post counts
  getCategories() {
    const categories = {};
    
    this.posts.forEach(post => {
      if (categories[post.category]) {
        categories[post.category]++;
      } else {
        categories[post.category] = 1;
      }
    });

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count
    }));
  }
}

module.exports = new CommunityPost(); 