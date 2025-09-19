const express = require('express');
const { body, validationResult, param } = require('express-validator');
const axios = require('axios');
const Assessment = require('../models/Assessment');

const router = express.Router();

// Validation middleware
const validateAssessment = [
  body('buildingDetails.roofArea')
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Roof area must be between 1 and 100,000 sq ft'),
  
  body('buildingDetails.roofSlope')
    .isFloat({ min: 0, max: 90 })
    .withMessage('Roof slope must be between 0 and 90 degrees'),
  
  body('buildingDetails.roofMaterial')
    .isIn(['concrete', 'tiles', 'metal', 'asphalt', 'other'])
    .withMessage('Invalid roof material'),
  
  body('buildingDetails.buildingHeight')
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Building height must be between 1 and 1000 feet'),
  
  body('location.address')
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('environmentalData.annualRainfall')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Annual rainfall must be between 0 and 10000 mm')
];

// @route   POST /api/assessments
// @desc    Create new assessment
// @access  Public
router.post('/', validateAssessment, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const startTime = Date.now();

    // Extract data from request
    const {
      buildingDetails,
      location,
      environmentalData,
      image,
      sessionId
    } = req.body;

    // Create new assessment
    const assessment = new Assessment({
      buildingDetails,
      location,
      environmentalData,
      image,
      sessionId,
      status: 'processing',
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        apiVersion: '1.0'
      }
    });

    // Save initial assessment
    await assessment.save();

    // Start background processing
    processAssessmentAsync(assessment._id);

    const processingTime = Date.now() - startTime;

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully and is being processed',
      data: {
        assessmentId: assessment.assessmentId,
        _id: assessment._id,
        status: assessment.status,
        estimatedProcessingTime: '30-60 seconds'
      },
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get assessment by ID
// @access  Public
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid assessment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format',
        errors: errors.array()
      });
    }

    const assessment = await Assessment.findById(req.params.id)
      .select('-metadata.ipAddress') // Hide IP address for privacy
      .lean();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment'
    });
  }
});

// @route   GET /api/assessments/by-assessment-id/:assessmentId
// @desc    Get assessment by assessment ID (public ID)
// @access  Public
router.get('/by-assessment-id/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = await Assessment.findOne({ assessmentId })
      .select('-metadata.ipAddress')
      .lean();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment'
    });
  }
});

// @route   GET /api/assessments/:id/status
// @desc    Get assessment processing status
// @access  Public
router.get('/:id/status', [
  param('id').isMongoId().withMessage('Invalid assessment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format',
        errors: errors.array()
      });
    }

    const assessment = await Assessment.findById(req.params.id)
      .select('status error results.assessmentScore createdAt updatedAt')
      .lean();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: assessment.status,
        error: assessment.error,
        assessmentScore: assessment.results?.assessmentScore,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
        isComplete: assessment.status === 'completed',
        hasError: assessment.status === 'failed'
      }
    });

  } catch (error) {
    console.error('Error fetching assessment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment status'
    });
  }
});

// @route   GET /api/assessments
// @desc    Get all assessments (with pagination and filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      city,
      state,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    if (status) filter.status = status;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const assessments = await Assessment.find(filter)
      .select('-metadata.ipAddress -metadata.userAgent')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Assessment.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalAssessments: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments'
    });
  }
});

// @route   GET /api/assessments/statistics
// @desc    Get assessment statistics
// @access  Public
router.get('/statistics/overview', async (req, res) => {
  try {
    const stats = await Assessment.getStatistics();
    
    // Additional location-based statistics
    const locationStats = await Assessment.aggregate([
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 },
          avgRainfall: { $avg: '$environmentalData.annualRainfall' },
          avgRoofArea: { $avg: '$buildingDetails.roofArea' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent assessments trend
    const recentTrend = await Assessment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats,
        locationStats,
        recentTrend,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Background processing function
async function processAssessmentAsync(assessmentId) {
  try {
    console.log(`🔄 Starting processing for assessment: ${assessmentId}`);
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    const startTime = Date.now();

    // Step 1: Get ML predictions for Ksat value
    let mlPredictions = {};
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict-ksat`, {
        latitude: assessment.location.coordinates.latitude,
        longitude: assessment.location.coordinates.longitude
      });

      mlPredictions = {
        ksatPrediction: {
          value: mlResponse.data.ksat,
          confidence: mlResponse.data.confidence || 0.8,
          model: 'XGBoost',
          timestamp: new Date()
        },
        soilAnalysis: mlResponse.data.soil_analysis || {}
      };

      // Store soil data in environmental data
      assessment.environmentalData.soilData = {
        ksat: mlResponse.data.ksat,
        soilType: mlResponse.data.soil_analysis?.primarySoilType,
        clay: mlResponse.data.soil_properties?.clay,
        silt: mlResponse.data.soil_properties?.silt,
        sand: mlResponse.data.soil_properties?.sand,
        organicCarbon: mlResponse.data.soil_properties?.organicCarbon,
        textureEncoded: mlResponse.data.soil_properties?.textureEncoded
      };

    } catch (mlError) {
      console.warn('ML prediction failed, using fallback values:', mlError.message);
      // Fallback values
      mlPredictions = {
        ksatPrediction: {
          value: 50, // Default Ksat value
          confidence: 0.5,
          model: 'fallback',
          timestamp: new Date()
        }
      };
    }

    // Step 2: Calculate rainwater harvesting potential
    const basicPotential = assessment.calculateBasicPotential();
    
    // Step 3: Generate detailed results
    const results = {
      harvestingPotential: {
        annualCollection: basicPotential.annualPotentialLiters,
        averageMonthlyCollection: basicPotential.monthlyAverageliters,
        peakMonthlyCollection: Math.round(basicPotential.monthlyAverageliters * 1.5), // Estimate
        monthlyCollection: generateMonthlyCollection(basicPotential.annualPotentialLiters)
      },
      
      systemRecommendations: generateSystemRecommendations(basicPotential.annualPotentialLiters, assessment.buildingDetails),
      
      infiltrationAnalysis: generateInfiltrationAnalysis(mlPredictions.ksatPrediction?.value || 50),
      
      environmentalImpact: calculateEnvironmentalImpact(basicPotential.annualPotentialLiters),
      
      assessmentScore: calculateAssessmentScore(assessment, mlPredictions.ksatPrediction?.value || 50)
    };

    // Step 4: Update assessment with results
    const processingTime = Date.now() - startTime;
    
    assessment.results = results;
    assessment.mlPredictions = mlPredictions;
    assessment.status = 'completed';
    assessment.metadata.processingTime = processingTime;

    await assessment.save();

    console.log(`✅ Assessment processing completed: ${assessmentId} (${processingTime}ms)`);

  } catch (error) {
    console.error(`❌ Assessment processing failed: ${assessmentId}`, error);
    
    // Update assessment with error
    try {
      await Assessment.findByIdAndUpdate(assessmentId, {
        status: 'failed',
        error: {
          message: error.message,
          code: error.code || 'PROCESSING_ERROR',
          timestamp: new Date()
        }
      });
    } catch (updateError) {
      console.error('Failed to update assessment error status:', updateError);
    }
  }
}

// Helper functions
function generateMonthlyCollection(annualCollection) {
  // Simplified monthly distribution (India rainfall pattern)
  const monsoonDistribution = [0.02, 0.03, 0.05, 0.08, 0.25, 0.35, 0.15, 0.05, 0.01, 0.01, 0.00, 0.00];
  
  return monsoonDistribution.map((factor, index) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
    volume: Math.round(annualCollection * factor),
    efficiency: Math.round((factor * 100) * 10) / 10 // Round to 1 decimal
  }));
}

function generateSystemRecommendations(annualCollection, buildingDetails) {
  const tankSize = Math.min(Math.max(annualCollection * 0.1, 5000), 50000); // 10% of annual, min 5000L, max 50000L
  
  return {
    tankSize: Math.round(tankSize),
    pipeSize: buildingDetails.roofArea > 2000 ? '6 inch' : '4 inch',
    filterType: 'First Flush Diverter + Sand Filter',
    estimatedCost: Math.round((tankSize * 15) + (buildingDetails.roofArea * 10)), // Rough estimate
    paybackPeriod: Math.round(((tankSize * 15) + (buildingDetails.roofArea * 10)) / (annualCollection * 0.02)) // Months
  };
}

function generateInfiltrationAnalysis(ksatValue) {
  let soilSuitability, infiltrationCategory;
  
  if (ksatValue > 100) {
    soilSuitability = 'Excellent for recharge';
    infiltrationCategory = 'High';
  } else if (ksatValue > 50) {
    soilSuitability = 'Good for recharge';
    infiltrationCategory = 'Moderate';
  } else if (ksatValue > 20) {
    soilSuitability = 'Fair for recharge';
    infiltrationCategory = 'Low';
  } else {
    soilSuitability = 'Poor for recharge';
    infiltrationCategory = 'Very Low';
  }

  return {
    infiltrationRate: ksatValue,
    soilSuitability,
    rechargeRecommendations: [
      'Install recharge pits near building',
      'Consider permeable paving',
      'Regular maintenance of infiltration structures'
    ]
  };
}

function calculateEnvironmentalImpact(annualCollection) {
  const waterSaved = annualCollection; // liters/year
  const carbonFootprintReduction = waterSaved * 0.002; // Rough estimate: 2g CO2 per liter
  const costSavings = waterSaved * 0.02; // ₹0.02 per liter

  return {
    waterSaved: Math.round(waterSaved),
    carbonFootprintReduction: Math.round(carbonFootprintReduction * 100) / 100,
    costSavings: Math.round(costSavings)
  };
}

function calculateAssessmentScore(assessment, ksatValue) {
  let score = 0;
  
  // Roof area factor (0-25 points)
  const roofArea = assessment.buildingDetails.roofArea;
  score += Math.min((roofArea / 2000) * 25, 25);
  
  // Rainfall factor (0-25 points)
  const rainfall = assessment.environmentalData.annualRainfall;
  score += Math.min((rainfall / 1500) * 25, 25);
  
  // Roof material factor (0-20 points)
  const materialScores = { metal: 20, concrete: 18, tiles: 15, asphalt: 12, other: 10 };
  score += materialScores[assessment.buildingDetails.roofMaterial] || 10;
  
  // Soil infiltration factor (0-30 points)
  score += Math.min((ksatValue / 150) * 30, 30);
  
  return Math.min(Math.round(score), 100);
}

module.exports = router;