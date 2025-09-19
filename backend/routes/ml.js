const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/ml/predict-ksat
// @desc    Get Ksat prediction from ML service
// @access  Public
router.post('/predict-ksat', [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
], async (req, res) => {
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

    const { latitude, longitude } = req.body;
    const startTime = Date.now();

    // Call ML service
    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
      
      const response = await axios.post(
        `${mlServiceUrl}/predict-ksat`,
        { latitude, longitude },
        { 
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        message: 'Ksat prediction successful',
        data: {
          ksat: response.data.ksat,
          soil_properties: response.data.soil_properties,
          soil_analysis: response.data.soil_analysis,
          confidence: response.data.confidence,
          coordinates: { latitude, longitude },
          model_info: response.data.model_info
        },
        processingTime: `${processingTime}ms`
      });

    } catch (mlError) {
      console.error('ML service error:', mlError.response?.data || mlError.message);
      
      // Return fallback values if ML service fails
      const fallbackKsat = 50; // Default Ksat value
      
      res.json({
        success: true,
        message: 'Using fallback Ksat prediction (ML service unavailable)',
        data: {
          ksat: fallbackKsat,
          soil_properties: {
            clay: 25,
            silt: 35,
            sand: 40,
            organicCarbon: 1.5,
            textureEncoded: 2
          },
          soil_analysis: {
            primarySoilType: 'LOAM',
            infiltrationCategory: 'Moderate',
            suitabilityScore: 70
          },
          confidence: 0.5,
          coordinates: { latitude, longitude },
          model_info: {
            model_type: 'fallback',
            version: '1.0',
            note: 'ML service unavailable, using default values'
          }
        },
        warning: 'ML service is currently unavailable. Using default soil properties.'
      });
    }

  } catch (error) {
    console.error('Error in ML prediction route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Ksat prediction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/ml/service-status
// @desc    Check ML service status
// @access  Public
router.get('/service-status', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    const startTime = Date.now();
    const response = await axios.get(`${mlServiceUrl}/health`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      status: 'available',
      service: {
        url: mlServiceUrl,
        status: response.data.status,
        version: response.data.version || '1.0',
        responseTime: `${responseTime}ms`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unavailable',
      service: {
        url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
        error: error.response?.data?.message || error.message || 'Service unreachable'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// @route   POST /api/ml/batch-predict
// @desc    Get Ksat predictions for multiple coordinates
// @access  Public
router.post('/batch-predict', [
  body('coordinates')
    .isArray({ min: 1, max: 100 })
    .withMessage('Coordinates array must contain 1-100 items'),
  body('coordinates.*.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('All latitudes must be between -90 and 90'),
  body('coordinates.*.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('All longitudes must be between -180 and 180')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { coordinates } = req.body;
    const startTime = Date.now();

    try {
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
      
      const response = await axios.post(
        `${mlServiceUrl}/batch-predict-ksat`,
        { coordinates },
        { 
          timeout: 60000, // 60 second timeout for batch processing
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        message: `Batch prediction completed for ${coordinates.length} locations`,
        data: {
          predictions: response.data.predictions,
          summary: response.data.summary,
          model_info: response.data.model_info
        },
        processingTime: `${processingTime}ms`
      });

    } catch (mlError) {
      console.error('ML batch service error:', mlError.response?.data || mlError.message);
      
      // Return error for batch processing as fallback values aren't practical
      res.status(503).json({
        success: false,
        message: 'ML service is currently unavailable for batch processing',
        error: mlError.response?.data?.message || mlError.message
      });
    }

  } catch (error) {
    console.error('Error in ML batch prediction route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process batch Ksat predictions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/ml/soil-info
// @desc    Get soil information for coordinates without ML prediction
// @access  Public
router.get('/soil-info', [
  body('latitude').optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude').optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
], async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // If coordinates are provided, try to get SoilGrids data
    if (latitude && longitude) {
      try {
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        
        const response = await axios.get(
          `${mlServiceUrl}/soil-data`,
          { 
            params: { latitude, longitude },
            timeout: 15000
          }
        );

        return res.json({
          success: true,
          message: 'Soil information retrieved successfully',
          data: response.data,
          source: 'soilgrids'
        });

      } catch (error) {
        console.warn('SoilGrids API error:', error.message);
      }
    }

    // Return general soil information
    res.json({
      success: true,
      message: 'General soil information',
      data: {
        info: 'Soil properties vary greatly by location. For accurate Ksat predictions, please provide coordinates.',
        generalRanges: {
          ksat: {
            sandy_soils: '100-300 mm/hr',
            loamy_soils: '20-100 mm/hr',
            clay_soils: '1-20 mm/hr'
          },
          soil_composition: {
            sand: '0-100%',
            silt: '0-100%',
            clay: '0-100%',
            organic_carbon: '0-10%'
          }
        },
        recommendation: 'Use the prediction endpoint with coordinates for site-specific analysis'
      }
    });

  } catch (error) {
    console.error('Error in soil info route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get soil information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;