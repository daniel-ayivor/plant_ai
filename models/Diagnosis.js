const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  imageUrl: { type: String },
  disease: { type: String, required: true },
  confidence: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  recommendations: [String],
  predictions: [
    {
      disease: String,
      confidence: Number
    }
  ],
  plantInfo: {
    name: String,
    scientificName: String,
    family: String,
    description: String
  },
  notes: String
});

module.exports = mongoose.model('Diagnosis', DiagnosisSchema); 