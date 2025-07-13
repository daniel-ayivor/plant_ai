const { v4: uuidv4 } = require('uuid');

class Plant {
  constructor() {
    // In-memory plant storage (in production, use a database)
    this.plants = [];
  }

  // Create a new plant
  create(plantData) {
    try {
      const { userId, name, species, location, plantedDate, notes } = plantData;

      const newPlant = {
        id: uuidv4(),
        userId,
        name,
        species: species || 'Unknown',
        location: location || 'Unknown',
        plantedDate: plantedDate || new Date().toISOString(),
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastDiagnosis: null,
        healthStatus: 'Unknown',
        diagnosisHistory: []
      };

      this.plants.push(newPlant);
      return newPlant;
    } catch (error) {
      throw error;
    }
  }

  // Find plant by ID
  findById(id, userId = null) {
    let plant = this.plants.find(p => p.id === id);
    
    if (userId) {
      plant = plant && plant.userId === userId ? plant : null;
    }
    
    return plant;
  }

  // Find all plants for a user
  findByUserId(userId) {
    return this.plants.filter(plant => plant.userId === userId);
  }

  // Update plant
  update(id, userId, updateData) {
    try {
      const plantIndex = this.plants.findIndex(p => p.id === id && p.userId === userId);
      
      if (plantIndex === -1) {
        throw new Error('Plant not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'id' && key !== 'userId') {
          this.plants[plantIndex][key] = updateData[key];
        }
      });

      this.plants[plantIndex].updatedAt = new Date().toISOString();

      return this.plants[plantIndex];
    } catch (error) {
      throw error;
    }
  }

  // Delete plant
  delete(id, userId) {
    const plantIndex = this.plants.findIndex(p => p.id === id && p.userId === userId);
    
    if (plantIndex === -1) {
      throw new Error('Plant not found');
    }

    const deletedPlant = this.plants.splice(plantIndex, 1)[0];
    return deletedPlant;
  }

  // Add diagnosis to plant
  addDiagnosis(plantId, userId, diagnosisData) {
    try {
      const plantIndex = this.plants.findIndex(p => p.id === plantId && p.userId === userId);
      
      if (plantIndex === -1) {
        throw new Error('Plant not found');
      }

      const diagnosis = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ...diagnosisData
      };

      // Add diagnosis to plant history
      this.plants[plantIndex].diagnosisHistory.push(diagnosis);
      this.plants[plantIndex].lastDiagnosis = diagnosis;
      
      // Update health status based on disease
      if (diagnosisData.disease.includes('healthy')) {
        this.plants[plantIndex].healthStatus = 'Healthy';
      } else if (diagnosisData.confidence > 0.7) {
        this.plants[plantIndex].healthStatus = 'Diseased';
      } else {
        this.plants[plantIndex].healthStatus = 'Suspicious';
      }

      this.plants[plantIndex].updatedAt = new Date().toISOString();

      return {
        diagnosis,
        plant: this.plants[plantIndex]
      };
    } catch (error) {
      throw error;
    }
  }

  // Get diagnosis history for a plant
  getDiagnosisHistory(plantId, userId) {
    const plant = this.findById(plantId, userId);
    
    if (!plant) {
      throw new Error('Plant not found');
    }

    return plant.diagnosisHistory;
  }

  // Get health summary for a user's plants
  getHealthSummary(userId) {
    const userPlants = this.findByUserId(userId);
    
    const summary = {
      totalPlants: userPlants.length,
      healthyPlants: userPlants.filter(p => p.healthStatus === 'Healthy').length,
      diseasedPlants: userPlants.filter(p => p.healthStatus === 'Diseased').length,
      suspiciousPlants: userPlants.filter(p => p.healthStatus === 'Suspicious').length,
      unknownPlants: userPlants.filter(p => p.healthStatus === 'Unknown').length,
      plantsNeedingAttention: userPlants.filter(p => 
        p.healthStatus === 'Diseased' || p.healthStatus === 'Suspicious'
      ).length
    };

    return summary;
  }

  // Get all plants (for admin purposes)
  getAll() {
    return this.plants;
  }

  // Get plant count
  getCount() {
    return this.plants.length;
  }

  // Get plants by health status
  getByHealthStatus(userId, status) {
    return this.plants.filter(plant => 
      plant.userId === userId && plant.healthStatus === status
    );
  }

  // Search plants
  search(userId, query) {
    const userPlants = this.findByUserId(userId);
    
    return userPlants.filter(plant => 
      plant.name.toLowerCase().includes(query.toLowerCase()) ||
      plant.species.toLowerCase().includes(query.toLowerCase()) ||
      plant.location.toLowerCase().includes(query.toLowerCase()) ||
      plant.notes.toLowerCase().includes(query.toLowerCase())
    );
  }
}

module.exports = new Plant(); 