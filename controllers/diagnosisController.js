const aiModel = require('../services/aiModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

class DiagnosisController {
  // Upload and analyze plant image
  async analyzePlantImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageBuffer = fs.readFileSync(req.file.path);
      
      // Analyze the image using AI model
      const result = await aiModel.predictDisease(imageBuffer);
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Error analyzing image',
          error: result.error
        });
      }

      // Get plant information
      const plantInfo = await aiModel.getPlantInfo(result.disease);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        diagnosis: {
          disease: result.disease,
          confidence: result.confidence,
          predictions: result.predictions,
          recommendations: result.recommendations,
          plantInfo: plantInfo.success ? plantInfo.plantInfo : null
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in analyzePlantImage:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Error processing image',
        error: error.message
      });
    }
  }

  // Get diagnosis history for a user
  async getDiagnosisHistory(req, res) {
    try {
      const userId = req.user.id;
      
      // Mock diagnosis history - in production, this would come from a database
      const history = [
        {
          id: 1,
          userId: userId,
          imageUrl: '/uploads/sample1.jpg',
          disease: 'early_blight',
          confidence: 0.85,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          recommendations: [
            'Remove infected leaves and destroy them.',
            'Apply fungicide containing chlorothalonil.',
            'Avoid overhead watering.'
          ]
        },
        {
          id: 2,
          userId: userId,
          imageUrl: '/uploads/sample2.jpg',
          disease: 'healthy',
          confidence: 0.92,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          recommendations: [
            'Your plant appears to be healthy!',
            'Continue with regular watering and care.'
          ]
        }
      ];

      res.json({
        success: true,
        history: history
      });

    } catch (error) {
      console.error('Error in getDiagnosisHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving diagnosis history',
        error: error.message
      });
    }
  }

  // Get detailed diagnosis by ID
  async getDiagnosisById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Mock diagnosis details - in production, this would come from a database
      const diagnosis = {
        id: parseInt(id),
        userId: userId,
        imageUrl: '/uploads/sample1.jpg',
        disease: 'early_blight',
        confidence: 0.85,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        predictions: [
          { disease: 'early_blight', confidence: 0.85 },
          { disease: 'late_blight', confidence: 0.08 },
          { disease: 'healthy', confidence: 0.05 },
          { disease: 'bacterial_spot', confidence: 0.02 }
        ],
        recommendations: [
          'Remove infected leaves and destroy them.',
          'Apply fungicide containing chlorothalonil.',
          'Avoid overhead watering.',
          'Space plants properly for better air circulation.'
        ],
        plantInfo: {
          name: "Tomato Plant",
          scientificName: "Solanum lycopersicum",
          family: "Solanaceae",
          description: "A popular vegetable plant grown for its edible fruits."
        }
      };

      if (diagnosis.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        diagnosis: diagnosis
      });

    } catch (error) {
      console.error('Error in getDiagnosisById:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving diagnosis',
        error: error.message
      });
    }
  }

  // Delete diagnosis
  async deleteDiagnosis(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Mock deletion - in production, this would delete from database
      console.log(`Deleting diagnosis ${id} for user ${userId}`);

      res.json({
        success: true,
        message: 'Diagnosis deleted successfully'
      });

    } catch (error) {
      console.error('Error in deleteDiagnosis:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting diagnosis',
        error: error.message
      });
    }
  }

  // Get diagnosis statistics
  async getDiagnosisStats(req, res) {
    try {
      const userId = req.user.id;

      // Mock statistics - in production, this would come from a database
      const stats = {
        totalDiagnoses: 15,
        healthyCount: 8,
        diseasedCount: 7,
        mostCommonDisease: 'early_blight',
        averageConfidence: 0.87,
        recentActivity: {
          lastWeek: 3,
          lastMonth: 12,
          lastYear: 15
        }
      };

      res.json({
        success: true,
        stats: stats
      });

    } catch (error) {
      console.error('Error in getDiagnosisStats:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving statistics',
        error: error.message
      });
    }
  }
}

module.exports = {
  DiagnosisController: new DiagnosisController(),
  upload
}; 