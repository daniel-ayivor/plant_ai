# PlantAI - Plant Disease Detection System

A comprehensive plant disease detection system built with Express.js, AI/ML, and OAuth authentication.

## 🌟 Features

### 🔐 Authentication & Authorization
- **Local Authentication**: Email/password registration and login
- **OAuth Integration**: Google and Facebook OAuth support
- **JWT Token Management**: Secure token-based authentication
- **Role-based Access**: User and admin roles

### 🤖 AI-Powered Plant Disease Detection
- **Image Analysis**: Upload plant images for disease detection
- **Multiple Disease Support**: 33+ plant diseases supported
- **Confidence Scoring**: AI confidence levels for predictions
- **Batch Processing**: Process multiple images simultaneously
- **Disease Information**: Detailed treatment and prevention info

### 👥 Community Features
- **AI-Enhanced Search**: Intelligent community post search
- **Trending Topics**: AI-powered trending topic detection
- **Community Insights**: Analytics and engagement metrics
- **Post Management**: Create, like, and comment on posts
- **Category System**: Organized content by gardening topics

### 🌱 Plant Management
- **Plant Tracking**: Add and manage your plants
- **Health Monitoring**: Track plant health status over time
- **Diagnosis History**: Complete history of plant diagnoses
- **Health Summaries**: Overview of all plant health

## 🏗️ Architecture

### MVC Structure
```
PlantAI/
├── controllers/          # Business logic
│   ├── authController.js
│   ├── plantController.js
│   ├── diagnosisController.js
│   └── communityController.js
├── models/              # Data models
│   ├── User.js
│   ├── Plant.js
│   └── CommunityPost.js
├── routes/              # API routes
│   ├── auth.js
│   ├── plants.js
│   ├── diagnosis.js
│   └── community.js
├── services/            # External services
│   ├── aiModel.js
│   └── communitySearch.js
├── middleware/          # Custom middleware
│   └── auth.js
├── config/              # Configuration
│   └── passport.js
└── index.js            # Main application entry
```

### Key Components

#### Controllers
- **AuthController**: Handles user registration, login, OAuth, and profile management
- **PlantController**: Manages plant CRUD operations and health tracking
- **DiagnosisController**: Processes image uploads and AI predictions
- **CommunityController**: Handles community posts, search, and interactions

#### Models
- **User**: User data with OAuth support and JWT management
- **Plant**: Plant information with health tracking and diagnosis history
- **CommunityPost**: Community posts with engagement metrics

#### Services
- **aiModel**: TensorFlow.js-based plant disease detection
- **communitySearch**: AI-powered community search and insights

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PlantAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-secret-key-change-in-production
   
   # OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FACEBOOK_APP_ID=your-facebook-app-id
   FACEBOOK_APP_SECRET=your-facebook-app-secret
   
   # AI Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # Frontend URL (for OAuth redirects)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "gardener123",
  "email": "gardener@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "gardener@example.com",
  "password": "securepassword123"
}
```

#### OAuth Login
```http
GET /api/auth/google
GET /api/auth/facebook
```

### Plant Management

#### Get All Plants
```http
GET /api/plants
Authorization: Bearer <token>
```

#### Create Plant
```http
POST /api/plants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tomato Plant 1",
  "species": "Solanum lycopersicum",
  "location": "Backyard Garden",
  "notes": "Planted in March"
}
```

### Disease Detection

#### Upload Image for Diagnosis
```http
POST /api/diagnosis/upload
Content-Type: multipart/form-data

{
  "image": <file>,
  "plantType": "Tomato",
  "notes": "Brown spots on leaves"
}
```

#### Batch Diagnosis
```http
POST /api/diagnosis/batch
Content-Type: multipart/form-data

{
  "images": [<file1>, <file2>, ...]
}
```

### Community Features

#### Search Posts
```http
GET /api/community/search?q=organic+fertilizer&category=gardening-tips
```

#### Create Post
```http
POST /api/community/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Best Organic Fertilizers",
  "content": "I've been using fish emulsion...",
  "tags": ["organic", "fertilizer"],
  "category": "gardening-tips"
}
```

## 🔧 Configuration

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `http://localhost:3000/api/auth/facebook/callback`

### AI Model Configuration

The AI model uses TensorFlow.js for plant disease detection. The model supports 33+ plant diseases including:

- Apple diseases (scab, black rot, cedar apple rust)
- Tomato diseases (early blight, late blight, bacterial spot)
- Corn diseases (common rust, northern leaf blight)
- Grape diseases (black rot, leaf blight)
- And many more...

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API request throttling
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request data validation
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcrypt password encryption

## 🧪 Testing

```bash
# Run tests
npm test

# Health check
curl http://localhost:3000/api/health

# API documentation
curl http://localhost:3000/api/docs
```

## 📊 Monitoring

The application includes comprehensive logging and monitoring:

- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error management
- **Health Checks**: System status monitoring
- **Performance**: Request/response timing

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure OAuth redirect URIs
- [ ] Set up database (currently in-memory)
- [ ] Configure file upload storage
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS certificates

### Environment Variables
```env
# Required
PORT=3000
JWT_SECRET=your-production-secret
NODE_ENV=production

# OAuth (Required for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# AI Services (Optional)
OPENAI_API_KEY=your-openai-api-key

# Frontend (Required for OAuth)
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api/docs`
- Review the health check at `/api/health`
- Open an issue on GitHub

---

**PlantAI** - Making plant care smarter with AI! 🌱🤖 