const express = require('express');
const { body } = require('express-validator');
const plantController = require('../controllers/plantController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/plants
// Get all plants for the authenticated user
router.get('/', authenticateToken, plantController.getAllPlants);

// POST /api/plants
// Create a new plant
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Plant name is required'),
  body('species').optional().isString(),
  body('location').optional().isString(),
  body('plantedDate').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isString()
], plantController.createPlant);

// GET /api/plants/:id
// Get a specific plant by ID
router.get('/:id', authenticateToken, plantController.getPlant);

// PUT /api/plants/:id
// Update a plant
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Plant name cannot be empty'),
  body('species').optional().isString(),
  body('location').optional().isString(),
  body('plantedDate').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isString()
], plantController.updatePlant);

// DELETE /api/plants/:id
// Delete a plant
router.delete('/:id', authenticateToken, plantController.deletePlant);

// POST /api/plants/:id/diagnosis
// Add a diagnosis to a plant
router.post('/:id/diagnosis', authenticateToken, [
  body('disease').notEmpty().withMessage('Disease is required'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
  body('imageUrl').optional().isString(),
  body('notes').optional().isString()
], plantController.addDiagnosis);

// GET /api/plants/:id/diagnosis
// Get diagnosis history for a plant
router.get('/:id/diagnosis', authenticateToken, plantController.getDiagnosisHistory);

// GET /api/plants/health/summary
// Get health summary for all user's plants
router.get('/health/summary', authenticateToken, plantController.getHealthSummary);

module.exports = router; 