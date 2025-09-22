const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AssessmentSchema = new mongoose.Schema({
  // Unique identifier for the assessment
  assessmentId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },

  // User session info (can be extended for user authentication)
  sessionId: {
    type: String,
    default: uuidv4
  },

  // Building Details
  buildingDetails: {
    roofArea: {
      type: Number,
      required: true,
      min: 0,
      max: 100000 // max sq ft
    },
    roofSlope: {
      type: Number,
      required: true,
      min: 0,
      max: 90 // degrees
    },
    roofMaterial: {
      type: String,
      required: true,
      enum: ['concrete', 'tiles', 'metal', 'asphalt', 'other'],
      lowercase: true
    },
    buildingHeight: {
      type: Number,
      required: true,
      min: 0,
      max: 1000 // feet
    }
  },

  // Location Information
  location: {
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    detectionMethod: {
      type: String,
      enum: ['browser-geolocation', 'ip-detection', 'manual-input', 'address-search','frontend-detected'],
      default: 'manual-input'
    }
  },

  // Environmental Data
  environmentalData: {
    annualRainfall: {
      type: Number,
      required: true,
      min: 0,
      max: 10000 // mm
    },
    // ML model predictions will be stored here
    soilData: {
      ksat: Number, // Saturated hydraulic conductivity
      soilType: String,
      clay: Number,
      silt: Number,
      sand: Number,
      organicCarbon: Number,
      textureEncoded: Number
    }
  },

  // Uploaded Image Information
  image: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },

  // Assessment Results (to be populated after calculations)
  results: {
    // Rainwater harvesting potential
    harvestingPotential: {
      monthlyCollection: [{
        month: String,
        volume: Number, // liters
        efficiency: Number // percentage
      }],
      annualCollection: Number, // liters per year
      peakMonthlyCollection: Number,
      averageMonthlyCollection: Number
    },

    // System recommendations
    systemRecommendations: {
      tankSize: Number, // liters
      pipeSize: String,
      filterType: String,
      estimatedCost: Number,
      paybackPeriod: Number // months
    },

    // Infiltration analysis (using ML predictions)
    infiltrationAnalysis: {
      infiltrationRate: Number, // mm/hr
      soilSuitability: String,
      rechargeRecommendations: [String]
    },

    // Environmental impact
    environmentalImpact: {
      waterSaved: Number, // liters/year
      carbonFootprintReduction: Number, // kg CO2/year
      costSavings: Number // rupees/year
    },

    // Overall assessment score
    assessmentScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },

  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },

  // Error information if processing fails
  error: {
    message: String,
    code: String,
    timestamp: Date
  },

  // ML Service Integration
  mlPredictions: {
    ksatPrediction: {
      value: Number,
      confidence: Number,
      model: String,
      timestamp: Date
    },
    soilAnalysis: {
      primarySoilType: String,
      infiltrationCategory: String,
      suitabilityScore: Number
    }
  },

  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    processingTime: Number, // milliseconds
    apiVersion: {
      type: String,
      default: '1.0'
    }
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'assessments'
});

// Indexes for better query performance
AssessmentSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
AssessmentSchema.index({ createdAt: -1 });
AssessmentSchema.index({ status: 1 });
AssessmentSchema.index({ 'location.city': 1 });
AssessmentSchema.index({ 'location.state': 1 });

// Virtual for full location
AssessmentSchema.virtual('fullLocation').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.state}`;
});

// Virtual for processing duration
AssessmentSchema.virtual('processingDuration').get(function() {
  if (this.metadata && this.metadata.processingTime) {
    return `${(this.metadata.processingTime / 1000).toFixed(2)}s`;
  }
  return null;
});

// Static method to find by coordinates within radius
AssessmentSchema.statics.findNearLocation = function(lat, lng, radius = 0.01) {
  return this.find({
    'location.coordinates.latitude': {
      $gte: lat - radius,
      $lte: lat + radius
    },
    'location.coordinates.longitude': {
      $gte: lng - radius,
      $lte: lng + radius
    }
  });
};

// Static method to get assessment statistics
AssessmentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAssessments: { $sum: 1 },
        completedAssessments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageRoofArea: { $avg: '$buildingDetails.roofArea' },
        averageRainfall: { $avg: '$environmentalData.annualRainfall' },
        topStates: { $push: '$location.state' }
      }
    }
  ]);
  
  return stats[0] || {};
};

// Pre-save middleware to validate coordinates
AssessmentSchema.pre('save', function(next) {
  const lat = this.location.coordinates.latitude;
  const lng = this.location.coordinates.longitude;
  
  // Basic coordinate validation
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return next(new Error('Invalid coordinates provided'));
  }
  
  // Set processing timestamp if status changed to processing
  if (this.isModified('status') && this.status === 'processing') {
    this.metadata = this.metadata || {};
    this.metadata.processingStartTime = new Date();
  }
  
  next();
});

// Instance method to calculate basic rainwater potential
AssessmentSchema.methods.calculateBasicPotential = function() {
  const roofArea = this.buildingDetails.roofArea; // sq ft
  const rainfall = this.environmentalData.annualRainfall; // mm
  
  // Convert sq ft to sq m (1 sq ft = 0.092903 sq m)
  const roofAreaM2 = roofArea * 0.092903;
  
  // Basic calculation: Area (m²) × Rainfall (mm) × Runoff coefficient
  // Runoff coefficient varies by roof material
  const runoffCoefficients = {
    'metal': 0.95,
    'concrete': 0.90,
    'tiles': 0.85,
    'asphalt': 0.80,
    'other': 0.75
  };
  
  const runoffCoeff = runoffCoefficients[this.buildingDetails.roofMaterial] || 0.75;
  
  // Calculate annual potential in liters
  const annualPotentialLiters = roofAreaM2 * rainfall * runoffCoeff;
  
  return {
    annualPotentialLiters: Math.round(annualPotentialLiters),
    monthlyAverageliters: Math.round(annualPotentialLiters / 12),
    runoffCoefficient: runoffCoeff
  };
};

module.exports = mongoose.model('Assessment', AssessmentSchema);