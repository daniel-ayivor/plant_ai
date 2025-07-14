const Plant = require('../models/Plant');
const { validationResult } = require('express-validator');

class PlantController {
  // Get all plants for the authenticated user
  async getAllPlants(req, res) {
    try {
      const plants = await Plant.find({ userId: req.user.userId });
      res.status(200).json({
        success: true,
        plants
      });
    } catch (error) {
      console.error('❌ Error fetching plants:', error);
      res.status(500).json({
        error: 'Failed to fetch plants',
        message: error.message
      });
    }
  }

  // Create a new plant
  async createPlant(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, species, location, plantedDate, notes } = req.body;
      const newPlant = new Plant({
        userId: req.user.userId,
        name,
        species,
        location,
        plantedDate,
        notes
      });
      await newPlant.save();
      res.status(201).json({
        success: true,
        message: 'Plant created successfully',
        plant: newPlant
      });
    } catch (error) {
      console.error('❌ Error creating plant:', error);
      res.status(500).json({
        error: 'Failed to create plant',
        message: error.message
      });
    }
  }

  // Get a specific plant by ID
  async getPlant(req, res) {
    try {
      const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.userId });
      if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      res.status(200).json({
        success: true,
        plant
      });
    } catch (error) {
      console.error('❌ Error fetching plant:', error);
      res.status(500).json({
        error: 'Failed to fetch plant',
        message: error.message
      });
    }
  }

  // Update a plant
  async updatePlant(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, species, location, plantedDate, notes } = req.body;
      const updatedPlant = await Plant.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { name, species, location, plantedDate, notes },
        { new: true }
      );
      if (!updatedPlant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Plant updated successfully',
        plant: updatedPlant
      });
    } catch (error) {
      console.error('❌ Error updating plant:', error);
      res.status(500).json({
        error: 'Failed to update plant',
        message: error.message
      });
    }
  }

  // Delete a plant
  async deletePlant(req, res) {
    try {
      const deletedPlant = await Plant.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
      if (!deletedPlant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Plant deleted successfully',
        plant: deletedPlant
      });
    } catch (error) {
      console.error('❌ Error deleting plant:', error);
      res.status(500).json({
        error: 'Failed to delete plant',
        message: error.message
      });
    }
  }

  // Add a diagnosis to a plant (assumes diagnosis is a subdocument or array in Plant)
  async addDiagnosis(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { disease, confidence, imageUrl, notes } = req.body;
      const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.userId });
      if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      const diagnosis = { disease, confidence, imageUrl, notes, createdAt: new Date() };
      plant.diagnosisHistory = plant.diagnosisHistory || [];
      plant.diagnosisHistory.push(diagnosis);
      await plant.save();
      res.status(200).json({
        success: true,
        message: 'Diagnosis added successfully',
        diagnosis,
        plant
      });
    } catch (error) {
      console.error('❌ Error adding diagnosis:', error);
      res.status(500).json({
        error: 'Failed to add diagnosis',
        message: error.message
      });
    }
  }

  // Get diagnosis history for a plant
  async getDiagnosisHistory(req, res) {
    try {
      const plant = await Plant.findOne({ _id: req.params.id, userId: req.user.userId });
      if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      res.status(200).json({
        success: true,
        diagnosisHistory: plant.diagnosisHistory || []
      });
    } catch (error) {
      console.error('❌ Error fetching diagnosis history:', error);
      res.status(500).json({
        error: 'Failed to fetch diagnosis history',
        message: error.message
      });
    }
  }

  // Get health summary for all user's plants (example: count by health status)
  async getHealthSummary(req, res) {
    try {
      const plants = await Plant.find({ userId: req.user.userId });
      // Example: count by health status if you have such a field
      const summary = plants.reduce((acc, plant) => {
        const status = plant.healthStatus || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      res.status(200).json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('❌ Error fetching health summary:', error);
      res.status(500).json({
        error: 'Failed to fetch health summary',
        message: error.message
      });
    }
  }

  // Search plants
  async searchPlants(req, res) {
    try {
      const { q: query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const plants = await Plant.find({
        userId: req.user.userId,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { species: { $regex: query, $options: 'i' } },
          { notes: { $regex: query, $options: 'i' } }
        ]
      });
      res.status(200).json({
        success: true,
        plants,
        total: plants.length
      });
    } catch (error) {
      console.error('❌ Error searching plants:', error);
      res.status(500).json({
        error: 'Failed to search plants',
        message: error.message
      });
    }
  }

  // Get plants by health status
  async getPlantsByHealthStatus(req, res) {
    try {
      const { status } = req.params;
      const plants = await Plant.find({ userId: req.user.userId, healthStatus: status });
      res.status(200).json({
        success: true,
        plants,
        total: plants.length,
        status
      });
    } catch (error) {
      console.error('❌ Error fetching plants by health status:', error);
      res.status(500).json({
        error: 'Failed to fetch plants by health status',
        message: error.message
      });
    }
  }
}

module.exports = new PlantController(); 