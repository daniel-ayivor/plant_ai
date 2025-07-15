const express = require('express');
const router = express.Router();
const { DiagnosisController, upload } = require('../controllers/diagnosisController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Upload plant image only (no analysis)
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, message: 'Image uploaded', file: req.file });
});

// Upload and analyze plant image
router.post('/analyze', upload.single('image'), DiagnosisController.analyzePlantImage);

// Get diagnosis history for authenticated user
router.get('/history', DiagnosisController.getDiagnosisHistory);

// Get specific diagnosis by ID
router.get('/:id', DiagnosisController.getDiagnosisById);

// Delete diagnosis
router.delete('/:id', DiagnosisController.deleteDiagnosis);

// Get diagnosis statistics
router.get('/stats/overview', DiagnosisController.getDiagnosisStats);

module.exports = router; 