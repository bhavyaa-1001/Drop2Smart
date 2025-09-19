const express = require('express');
const { body, query, validationResult } = require('express-validator');

const router = express.Router();

// Sample Indian cities database (can be extended)
const INDIAN_CITIES = {
  'MUMBAI': { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, avgRainfall: 2400 },
  'DELHI': { name: 'New Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, avgRainfall: 800 },
  'BANGALORE': { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, avgRainfall: 900 },
  'HYDERABAD': { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, avgRainfall: 800 },
  'AHMEDABAD': { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, avgRainfall: 550 },
  'CHENNAI': { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, avgRainfall: 1400 },
  'KOLKATA': { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, avgRainfall: 1600 },
  'PUNE': { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, avgRainfall: 650 },
  'JAIPUR': { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, avgRainfall: 600 },
  'LUCKNOW': { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, avgRainfall: 1000 }
};

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @route   GET /api/locations/cities
// @desc    Get list of Indian cities with rainfall data
// @access  Public
router.get('/cities', async (req, res) => {
  try {
    const { state, search, limit = 50 } = req.query;
    
    let cities = Object.values(INDIAN_CITIES);
    
    // Filter by state
    if (state) {
      cities = cities.filter(city => 
        city.state.toLowerCase().includes(state.toLowerCase())
      );
    }
    
    // Search by city name
    if (search) {
      cities = cities.filter(city => 
        city.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Limit results
    cities = cities.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      message: `Found ${cities.length} cities`,
      data: {
        cities,
        total: cities.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/locations/nearest-city
// @desc    Find nearest city to given coordinates
// @access  Public
router.get('/nearest-city', [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
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

    const { latitude, longitude } = req.query;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    let nearestCity = null;
    let minDistance = Infinity;
    
    // Find nearest city
    Object.values(INDIAN_CITIES).forEach(city => {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = { ...city, distance: Math.round(distance * 100) / 100 };
      }
    });
    
    if (nearestCity) {
      res.json({
        success: true,
        message: 'Nearest city found',
        data: {
          city: nearestCity,
          coordinates: { latitude: lat, longitude: lng }
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No nearby city found'
      });
    }
    
  } catch (error) {
    console.error('Error finding nearest city:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearest city',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/locations/rainfall/:cityName
// @desc    Get rainfall data for specific city
// @access  Public
router.get('/rainfall/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    const cityKey = cityName.toUpperCase().replace(/\s+/g, '_');
    
    const city = INDIAN_CITIES[cityKey];
    
    if (!city) {
      return res.status(404).json({
        success: false,
        message: 'City not found in database',
        suggestion: 'Try searching in the cities endpoint'
      });
    }
    
    // Generate monthly rainfall distribution (approximate for India)
    const monthlyDistribution = [0.02, 0.03, 0.05, 0.08, 0.25, 0.35, 0.15, 0.05, 0.01, 0.01, 0.00, 0.00];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = monthlyDistribution.map((factor, index) => ({
      month: months[index],
      rainfall: Math.round(city.avgRainfall * factor),
      percentage: Math.round(factor * 100)
    }));
    
    res.json({
      success: true,
      message: 'Rainfall data retrieved successfully',
      data: {
        city: {
          name: city.name,
          state: city.state,
          coordinates: { latitude: city.lat, longitude: city.lng }
        },
        rainfall: {
          annual: city.avgRainfall,
          unit: 'mm',
          monthly: monthlyData,
          monsoonMonths: ['June', 'July', 'August', 'September'],
          peakMonth: monthlyData.reduce((max, current) => 
            current.rainfall > max.rainfall ? current : max
          )
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching rainfall data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rainfall data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/locations/validate-coordinates
// @desc    Validate and get location info for coordinates
// @access  Public
router.post('/validate-coordinates', [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
        errors: errors.array()
      });
    }

    const { latitude, longitude } = req.body;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Check if coordinates are within India bounds (approximate)
    const INDIA_BOUNDS = {
      north: 37.6,
      south: 6.4,
      east: 97.25,
      west: 68.0
    };
    
    const isInIndia = (
      lat >= INDIA_BOUNDS.south &&
      lat <= INDIA_BOUNDS.north &&
      lng >= INDIA_BOUNDS.west &&
      lng <= INDIA_BOUNDS.east
    );
    
    // Find nearest city
    let nearestCity = null;
    let minDistance = Infinity;
    
    Object.values(INDIAN_CITIES).forEach(city => {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = { ...city, distance: Math.round(distance * 100) / 100 };
      }
    });
    
    // Format coordinates for display
    const formattedCoords = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
    
    res.json({
      success: true,
      message: 'Coordinates validated successfully',
      data: {
        coordinates: {
          latitude: lat,
          longitude: lng,
          formatted: formattedCoords
        },
        location: {
          isInIndia,
          nearestCity,
          suggestedRainfall: nearestCity?.avgRainfall || (isInIndia ? 800 : null)
        },
        validation: {
          isValid: true,
          precision: 'high',
          timezone: isInIndia ? 'Asia/Kolkata' : 'unknown'
        }
      }
    });
    
  } catch (error) {
    console.error('Error validating coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coordinates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/locations/states
// @desc    Get list of Indian states
// @access  Public
router.get('/states', async (req, res) => {
  try {
    const states = [...new Set(Object.values(INDIAN_CITIES).map(city => city.state))].sort();
    
    const statesWithCities = states.map(state => {
      const cities = Object.values(INDIAN_CITIES).filter(city => city.state === state);
      return {
        state,
        cityCount: cities.length,
        avgRainfall: Math.round(cities.reduce((sum, city) => sum + city.avgRainfall, 0) / cities.length)
      };
    });
    
    res.json({
      success: true,
      message: `Found ${states.length} states`,
      data: {
        states: statesWithCities,
        total: states.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch states',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;