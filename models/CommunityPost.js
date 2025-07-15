const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: String,
  username: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const CommunityPostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, default: 'Anonymous' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  category: { type: String, default: 'general' },
  likes: { type: Number, default: 0 },
  comments: { type: [CommentSchema], default: [] },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema); 