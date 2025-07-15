const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  disease: String,
  confidence: Number,
  imageUrl: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const PlantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  species: String,
  location: String,
  plantedDate: Date,
  notes: String,
  healthStatus: String,
  diagnosisHistory: { type: [DiagnosisSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plant', PlantSchema); 