const aiModel = require('../services/aiModel');
const Diagnosis = require('../models/Diagnosis');
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

  // Create and save a diagnosis entry
  async createDiagnosis(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Authentication required to save diagnosis.' });
      }
      const userId = req.user.id;
      const {
        disease,
        confidence,
        recommendations,
        predictions,
        plantInfo,
        notes,
        imageUrl,
        timestamp
      } = req.body;
      const diagnosisData = {
        userId,
        disease,
        confidence,
        recommendations,
        predictions,
        plantInfo,
        notes,
        imageUrl,
        timestamp: timestamp || Date.now()
      };
      const diagnosis = new Diagnosis(diagnosisData);
      await diagnosis.save();
      res.json({ success: true, diagnosis });
    } catch (error) {
      console.error('Error in createDiagnosis:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving diagnosis',
        error: error.message
      });
    }
  }

  // Get diagnosis history for a user
  async getDiagnosisHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await Diagnosis.find({ userId }).sort({ timestamp: -1 });
      res.json({
        success: true,
        history
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
      const diagnosis = await Diagnosis.findOne({ _id: id, userId });
      if (!diagnosis) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }
      res.json({
        success: true,
        diagnosis
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
      const deleted = await Diagnosis.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Diagnosis not found'
        });
      }
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
      const totalDiagnoses = await Diagnosis.countDocuments({ userId });
      const healthyCount = await Diagnosis.countDocuments({ userId, disease: 'healthy' });
      const diseasedCount = totalDiagnoses - healthyCount;
      const mostCommon = await Diagnosis.aggregate([
        { $match: { userId } },
        { $group: { _id: '$disease', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
      const mostCommonDisease = mostCommon[0]?._id || null;
      const avgConfidenceAgg = await Diagnosis.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avg: { $avg: '$confidence' } } }
      ]);
      const averageConfidence = avgConfidenceAgg[0]?.avg || 0;
      res.json({
        success: true,
        stats: {
          totalDiagnoses,
          healthyCount,
          diseasedCount,
          mostCommonDisease,
          averageConfidence
        }
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