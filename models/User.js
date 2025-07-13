const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor() {
    // In-memory user storage (in production, use a database)
    this.users = [];
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  // Create a new user
  async create(userData) {
    try {
      const { username, email, password, provider = 'local', googleId = null, facebookId = null, avatar = null } = userData;

      // Check if user already exists
      const existingUser = this.users.find(user => 
        user.email === email || user.username === username
      );

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        provider,
        googleId,
        facebookId,
        avatar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.users.push(newUser);

      return this.sanitizeUser(newUser);
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  findById(id) {
    const user = this.users.find(u => u.id === id);
    return user ? this.sanitizeUser(user) : null;
  }

  // Find user by email
  findByEmail(email) {
    const user = this.users.find(u => u.email === email);
    return user ? this.sanitizeUser(user) : null;
  }

  // Find user by Google ID
  findByGoogleId(googleId) {
    const user = this.users.find(u => u.googleId === googleId);
    return user ? this.sanitizeUser(user) : null;
  }

  // Find user by Facebook ID
  findByFacebookId(facebookId) {
    const user = this.users.find(u => u.facebookId === facebookId);
    return user ? this.sanitizeUser(user) : null;
  }

  // Update user
  async update(id, updateData) {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'password') {
          this.users[userIndex][key] = updateData[key];
        }
      });

      // Hash password if provided
      if (updateData.password) {
        const saltRounds = 10;
        this.users[userIndex].password = await bcrypt.hash(updateData.password, saltRounds);
      }

      this.users[userIndex].updatedAt = new Date().toISOString();

      return this.sanitizeUser(this.users[userIndex]);
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  delete(id) {
    const userIndex = this.users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletedUser = this.users.splice(userIndex, 1)[0];
    return this.sanitizeUser(deletedUser);
  }

  // Verify password
  async verifyPassword(user, password) {
    if (!user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        provider: user.provider 
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Sanitize user data (remove sensitive information)
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Get all users (for admin purposes)
  getAll() {
    return this.users.map(user => this.sanitizeUser(user));
  }

  // Get user count
  getCount() {
    return this.users.length;
  }
}

module.exports = new User(); 