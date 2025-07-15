const express = require('express');
const router = express.Router();
const { DiagnosisController, upload } = require('../controllers/diagnosisController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Save a diagnosis entry
router.post('/', DiagnosisController.createDiagnosis.bind(DiagnosisController));

// Upload and analyze plant image (diagnosis)
router.post('/upload', upload.single('image'), DiagnosisController.analyzePlantImage);

// Get diagnosis history for authenticated user
router.get('/history', DiagnosisController.getDiagnosisHistory);

// Get specific diagnosis by ID
router.get('/:id', DiagnosisController.getDiagnosisById);

// Delete diagnosis
router.delete('/:id', DiagnosisController.deleteDiagnosis);

// Get diagnosis statistics
router.get('/stats/overview', DiagnosisController.getDiagnosisStats);

module.exports = router; 