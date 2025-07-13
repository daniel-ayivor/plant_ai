const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIModelService {
  constructor() {
    this.modelLoaded = false;
    this.diseaseClasses = [
      'healthy',
      'bacterial_spot',
      'early_blight',
      'late_blight',
      'leaf_mold',
      'septoria_leaf_spot',
      'spider_mites',
      'target_spot',
      'yellow_leaf_curl_virus',
      'mosaic_virus'
    ];
  }

  async loadModel() {
    try {
      // Mock model loading - in production, this would load TensorFlow.js model
      console.log('Loading AI model...');
      this.modelLoaded = true;
      console.log('AI model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading AI model:', error);
      return false;
    }
  }

  async preprocessImage(imageBuffer) {
    try {
      // Mock image preprocessing
      // In production, this would resize, normalize, and format the image for the model
      console.log('Preprocessing image...');
      return {
        success: true,
        processedImage: imageBuffer,
        dimensions: { width: 224, height: 224 }
      };
    } catch (error) {
      console.error('Error preprocessing image:', error);
      return { success: false, error: error.message };
    }
  }

  async predictDisease(imageBuffer) {
    try {
      if (!this.modelLoaded) {
        await this.loadModel();
      }

      // Preprocess the image
      const preprocessResult = await this.preprocessImage(imageBuffer);
      if (!preprocessResult.success) {
        throw new Error(preprocessResult.error);
      }

      // Mock prediction - in production, this would use the actual AI model
      const predictions = this.generateMockPredictions();
      
      // Get the most likely disease
      const topPrediction = predictions.reduce((max, pred) => 
        pred.confidence > max.confidence ? pred : max
      );

      return {
        success: true,
        predictions: predictions,
        topPrediction: topPrediction,
        confidence: topPrediction.confidence,
        disease: topPrediction.disease,
        recommendations: this.getRecommendations(topPrediction.disease)
      };
    } catch (error) {
      console.error('Error predicting disease:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateMockPredictions() {
    // Generate mock predictions for demonstration
    const predictions = [];
    
    // Randomly select a disease (or healthy)
    const selectedDisease = this.diseaseClasses[Math.floor(Math.random() * this.diseaseClasses.length)];
    
    this.diseaseClasses.forEach(disease => {
      const confidence = disease === selectedDisease 
        ? Math.random() * 0.3 + 0.7 // 70-100% for selected disease
        : Math.random() * 0.2; // 0-20% for others
      
      predictions.push({
        disease: disease,
        confidence: confidence
      });
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  getRecommendations(disease) {
    const recommendations = {
      healthy: [
        "Your plant appears to be healthy!",
        "Continue with regular watering and care.",
        "Monitor for any changes in appearance."
      ],
      bacterial_spot: [
        "Remove infected leaves and destroy them.",
        "Avoid overhead watering to prevent spread.",
        "Apply copper-based fungicide.",
        "Improve air circulation around plants."
      ],
      early_blight: [
        "Remove and destroy infected leaves.",
        "Apply fungicide containing chlorothalonil.",
        "Avoid overhead watering.",
        "Space plants properly for better air circulation."
      ],
      late_blight: [
        "Remove all infected plant parts immediately.",
        "Apply fungicide containing copper or chlorothalonil.",
        "Avoid overhead watering.",
        "Improve air circulation and reduce humidity."
      ],
      leaf_mold: [
        "Remove infected leaves.",
        "Improve air circulation.",
        "Reduce humidity levels.",
        "Apply fungicide if necessary."
      ],
      septoria_leaf_spot: [
        "Remove infected leaves and destroy them.",
        "Apply fungicide containing chlorothalonil.",
        "Avoid overhead watering.",
        "Space plants properly."
      ],
      spider_mites: [
        "Spray plants with water to dislodge mites.",
        "Apply insecticidal soap or neem oil.",
        "Introduce predatory mites if available.",
        "Increase humidity to discourage mites."
      ],
      target_spot: [
        "Remove infected leaves.",
        "Apply fungicide containing chlorothalonil.",
        "Avoid overhead watering.",
        "Improve air circulation."
      ],
      yellow_leaf_curl_virus: [
        "Remove and destroy infected plants.",
        "Control whitefly populations.",
        "Use virus-resistant varieties.",
        "Practice good sanitation."
      ],
      mosaic_virus: [
        "Remove and destroy infected plants.",
        "Control aphid populations.",
        "Use virus-resistant varieties.",
        "Disinfect tools between uses."
      ]
    };

    return recommendations[disease] || [
      "Monitor the plant closely for changes.",
      "Consider consulting with a plant expert.",
      "Maintain proper watering and care practices."
    ];
  }

  async getPlantInfo(disease) {
    try {
      // Mock plant information - in production, this could come from a database
      const plantInfo = {
        name: "Tomato Plant",
        scientificName: "Solanum lycopersicum",
        family: "Solanaceae",
        description: "A popular vegetable plant grown for its edible fruits.",
        careInstructions: {
          watering: "Water deeply but infrequently, allowing soil to dry between waterings.",
          sunlight: "Full sun (6-8 hours per day)",
          soil: "Well-draining, rich soil with pH 6.0-6.8",
          temperature: "Optimal temperature range: 65-85°F (18-29°C)"
        }
      };

      return {
        success: true,
        plantInfo: plantInfo
      };
    } catch (error) {
      console.error('Error getting plant info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIModelService(); 