/**
 * Location Utilities
 * 
 * Contains functions for handling geolocation, address parsing,
 * location-based services, and coordinate operations.
 */

import { ERROR_CODES, INDIAN_CITIES } from './constants.js';

/**
 * Geolocation options
 */
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000 // 5 minutes
};

/**
 * Get user's current location using geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location coordinates and timestamp
 */
export const getCurrentLocation = (options = GEOLOCATION_OPTIONS) => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      const error = new Error('❌ Geolocation is not supported by this browser. Please use manual input or try a modern browser.');
      error.code = 'GEOLOCATION_NOT_SUPPORTED';
      reject(error);
      return;
    }

    // Check if HTTPS or localhost (geolocation requires secure context)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      console.warn('Geolocation requires HTTPS in production');
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
          source: 'browser-geolocation'
        };
        
        console.log('✅ Location detected successfully:', {
          coords: `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`,
          accuracy: `±${Math.round(locationData.accuracy)}m`
        });
        
        resolve(locationData);
      },
      (error) => {
        let errorMessage = 'Location access failed';
        let errorCode = 'GEOLOCATION_UNAVAILABLE';
        let userFriendlyMessage = '';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            errorCode = 'GEOLOCATION_DENIED';
            userFriendlyMessage = '🚫 Location access denied. To enable: Click the location icon in your browser address bar and select "Allow". Or use manual input below.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            errorCode = 'GEOLOCATION_UNAVAILABLE';
            userFriendlyMessage = '📡 Location unavailable. Your device GPS might be disabled. Try connecting to WiFi or use manual input.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            errorCode = 'TIMEOUT_ERROR';
            userFriendlyMessage = '⏰ Location detection timed out. Please try again or use manual input.';
            break;
          default:
            userFriendlyMessage = '❌ Location detection failed. Please use manual input or try again.';
        }

        const locationError = new Error(userFriendlyMessage || errorMessage);
        locationError.code = errorCode;
        locationError.originalError = error;
        
        console.warn('Location detection failed:', {
          code: errorCode,
          message: errorMessage,
          originalError: error
        });
        
        reject(locationError);
      },
      {
        ...options,
        // Increased timeout for better reliability
        timeout: 15000, // 15 seconds
        // High accuracy for precise location
        enableHighAccuracy: true,
        // Cache for 5 minutes
        maximumAge: 300000
      }
    );
  });
};

/**
 * Watch user's location for continuous updates
 * @param {Function} onLocationUpdate - Callback for location updates
 * @param {Function} onError - Error callback
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID for clearing the watch
 */
export const watchLocation = (onLocationUpdate, onError, options = GEOLOCATION_OPTIONS) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by this browser'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString(),
        source: 'geolocation'
      });
    },
    (error) => {
      let errorMessage = 'Location tracking failed';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timeout';
          break;
      }
      onError(new Error(errorMessage));
    },
    options
  );
};

/**
 * Clear location watch
 * @param {number} watchId - Watch ID returned from watchLocation
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find nearest Indian city from coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Nearest city information
 */
export const findNearestCity = (lat, lon) => {
  let nearestCity = null;
  let minDistance = Infinity;

  Object.values(INDIAN_CITIES).forEach(city => {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = { ...city, distance };
    }
  });

  return nearestCity;
};

/**
 * Get city-specific information including rainfall data
 * @param {string} cityName - City name
 * @returns {Object|null} City information or null if not found
 */
export const getCityInfo = (cityName) => {
  const cityKey = cityName.toUpperCase().replace(/\s+/g, '_');
  return INDIAN_CITIES[cityKey] || null;
};

/**
 * Parse and normalize address string
 * @param {string} address - Raw address string
 * @returns {Object} Parsed address components
 */
export const parseAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return {
      raw: '',
      normalized: '',
      components: {}
    };
  }

  const normalized = address.trim().replace(/\s+/g, ' ');
  const components = {
    pincode: null,
    state: null,
    city: null,
    area: null
  };

  // Extract pincode (6 digits)
  const pincodeMatch = normalized.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    components.pincode = pincodeMatch[1];
  }

  // Extract state (common Indian state names)
  const statePatterns = [
    /\b(maharashtra|gujarat|rajasthan|punjab|haryana|himachal pradesh|jammu and kashmir|ladakh)\b/i,
    /\b(uttar pradesh|uttarakhand|madhya pradesh|chhattisgarh|bihar|jharkhand|west bengal)\b/i,
    /\b(odisha|telangana|andhra pradesh|karnataka|kerala|tamil nadu|goa)\b/i,
    /\b(assam|meghalaya|manipur|mizoram|nagaland|tripura|arunachal pradesh|sikkim)\b/i,
    /\b(delhi|chandigarh|puducherry|andaman and nicobar|lakshadweep|dadra and nagar haveli|daman and diu)\b/i
  ];

  statePatterns.forEach(pattern => {
    const match = normalized.match(pattern);
    if (match && !components.state) {
      components.state = match[1];
    }
  });

  // Extract city (look for known cities)
  Object.values(INDIAN_CITIES).forEach(city => {
    const cityPattern = new RegExp(`\\b${city.name.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (cityPattern.test(normalized) && !components.city) {
      components.city = city.name;
      if (!components.state) {
        components.state = city.state;
      }
    }
  });

  return {
    raw: address,
    normalized,
    components
  };
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} precision - Decimal places
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lon, precision = 4) => {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return 'Invalid coordinates';
  }

  const latFormatted = lat.toFixed(precision);
  const lonFormatted = lon.toFixed(precision);
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  return `${Math.abs(latFormatted)}°${latDir}, ${Math.abs(lonFormatted)}°${lonDir}`;
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} Whether coordinates are valid
 */
export const areValidCoordinates = (lat, lon) => {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180 &&
    !isNaN(lat) && !isNaN(lon)
  );
};

/**
 * Check if coordinates are within India bounds (approximate)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} Whether coordinates are within India
 */
export const areCoordinatesInIndia = (lat, lon) => {
  if (!areValidCoordinates(lat, lon)) return false;

  // Approximate bounds of India
  const INDIA_BOUNDS = {
    north: 37.6,
    south: 6.4,
    east: 97.25,
    west: 68.0
  };

  return (
    lat >= INDIA_BOUNDS.south &&
    lat <= INDIA_BOUNDS.north &&
    lon >= INDIA_BOUNDS.west &&
    lon <= INDIA_BOUNDS.east
  );
};

/**
 * Get coordinates from address using Google Maps Geocoding API
 * @param {string} address - Address string
 * @returns {Promise<Object>} Location data with coordinates
 */
export const getCoordinatesFromAddress = async (address) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      // Fallback to IP-based detection or manual input
      reject(new Error('Google Maps API not available. Please use manual coordinate input.'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode(
      {
        address: address,
        componentRestrictions: { country: 'IN' }, // Restrict to India
        region: 'IN'
      },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const result = results[0];
          const location = result.geometry.location;
          
          // Extract address components
          const addressComponents = result.address_components;
          let city, state, pincode;
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            } else if (types.includes('postal_code')) {
              pincode = component.long_name;
            }
          });

          resolve({
            coordinates: {
              lat: location.lat(),
              lng: location.lng()
            },
            address: result.formatted_address,
            city,
            state,
            country: 'India',
            pincode
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      }
    );
  });
};

/**
 * Get address from coordinates using Google Maps Reverse Geocoding API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Location data with address
 */
export const getLocationFromCoordinates = async (lat, lng) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      // Fallback: Try to get nearest city from our constants
      const nearestCity = findNearestCity(lat, lng);
      if (nearestCity) {
        resolve({
          address: `${nearestCity.name}, ${nearestCity.state}, India`,
          city: nearestCity.name,
          state: nearestCity.state,
          country: 'India',
          coordinates: { lat, lng },
          suggestedRainfall: nearestCity.avgRainfall
        });
      } else {
        reject(new Error('Google Maps API not available and no nearby city found.'));
      }
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: lat, lng: lng };
    
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const result = results[0];
          const addressComponents = result.address_components;
          
          let city, state, pincode;
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            } else if (types.includes('postal_code')) {
              pincode = component.long_name;
            }
          });

          // Try to get rainfall data for the city
          let suggestedRainfall = null;
          if (city) {
            const cityData = getCityInfo(city);
            suggestedRainfall = cityData?.avgRainfall;
          }

          resolve({
            address: result.formatted_address,
            city,
            state,
            country: 'India',
            pincode,
            coordinates: { lat, lng },
            suggestedRainfall
          });
        } else {
          reject(new Error('No results found for these coordinates'));
        }
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
};

/**
 * Get location using IP-based geolocation service
 * @returns {Promise<Object>} Location data from IP
 */
export const getLocationFromIP = async () => {
  try {
    // Try multiple IP geolocation services for better reliability
    const services = [
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'http://ip-api.com/json/'
    ];

    for (const serviceUrl of services) {
      try {
        const response = await fetch(serviceUrl);
        const data = await response.json();
        
        // Handle different API response formats
        let lat, lng, city, region, country;
        
        if (serviceUrl.includes('ipapi.co')) {
          lat = data.latitude;
          lng = data.longitude;
          city = data.city;
          region = data.region;
          country = data.country_name;
        } else if (serviceUrl.includes('ipinfo.io')) {
          const [latitude, longitude] = (data.loc || '').split(',');
          lat = parseFloat(latitude);
          lng = parseFloat(longitude);
          city = data.city;
          region = data.region;
          country = data.country;
        } else if (serviceUrl.includes('ip-api.com')) {
          lat = data.lat;
          lng = data.lon;
          city = data.city;
          region = data.regionName;
          country = data.country;
        }

        if (lat && lng) {
          // Check if location is in India
          const isInIndia = areCoordinatesInIndia(lat, lng);
          
          // Get suggested rainfall data
          let suggestedRainfall = null;
          if (isInIndia && city) {
            const cityData = getCityInfo(city);
            suggestedRainfall = cityData?.avgRainfall || 800; // Default for India
          }

          return {
            coordinates: { lat, lng },
            address: `${city}, ${region}, ${country}`,
            city,
            state: region,
            country,
            source: 'ip',
            accuracy: 'city-level',
            isInIndia,
            suggestedRainfall,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn(`IP service ${serviceUrl} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All IP geolocation services failed');
  } catch (error) {
    throw new Error(`IP-based location detection failed: ${error.message}`);
  }
};

/**
 * Enhanced automatic location detection with multiple fallbacks
 * @returns {Promise<Object>} Location data
 */
export const getAutomaticLocation = async () => {
  // Try browser geolocation first
  try {
    const geoLocation = await getCurrentLocation();
    const { latitude, longitude } = geoLocation;
    
    try {
      // Try Google Maps reverse geocoding
      const locationData = await getLocationFromCoordinates(latitude, longitude);
      return {
        ...locationData,
        accuracy: geoLocation.accuracy,
        source: 'geolocation+maps',
        timestamp: geoLocation.timestamp
      };
    } catch (error) {
      // Fallback to nearest city from constants
      const nearestCity = findNearestCity(latitude, longitude);
      if (nearestCity) {
        return {
          coordinates: { lat: latitude, lng: longitude },
          address: `${nearestCity.name}, ${nearestCity.state}, India`,
          city: nearestCity.name,
          state: nearestCity.state,
          country: 'India',
          suggestedRainfall: nearestCity.avgRainfall,
          accuracy: geoLocation.accuracy,
          source: 'geolocation+database',
          timestamp: geoLocation.timestamp
        };
      }
    }
  } catch (geoError) {
    console.warn('Browser geolocation failed:', geoError);
  }
  
  // Fallback to IP-based location
  try {
    return await getLocationFromIP();
  } catch (ipError) {
    console.warn('IP-based location failed:', ipError);
  }
  
  // Final fallback: Default to Delhi
  const defaultLocation = {
    coordinates: { lat: 28.7041, lng: 77.1025 },
    address: 'New Delhi, Delhi, India',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    suggestedRainfall: 800,
    source: 'default',
    timestamp: new Date().toISOString()
  };
  
  return defaultLocation;
};

/**
 * Get location data from user input (address or coordinates)
 * @param {string} input - User input (address or coordinates)
 * @returns {Promise<Object>} Location data with coordinates and address
 */
export const getLocationFromInput = async (input) => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }

  const trimmedInput = input.trim();

  // Check if input looks like coordinates (lat,lon or lat lon)
  const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
  const coordMatch = trimmedInput.match(coordPattern);

  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);

    if (areValidCoordinates(lat, lon)) {
      try {
        const locationData = await getLocationFromCoordinates(lat, lon);
        return {
          ...locationData,
          source: 'coordinates',
          isInIndia: areCoordinatesInIndia(lat, lon)
        };
      } catch (error) {
        // If reverse geocoding fails, return basic coordinate info
        return {
          coordinates: { lat, lon },
          address: formatCoordinates(lat, lon),
          source: 'coordinates',
          isInIndia: areCoordinatesInIndia(lat, lon)
        };
      }
    } else {
      throw new Error('Invalid coordinates provided');
    }
  }

  // Treat as address and geocode
  try {
    const locationData = await getCoordinatesFromAddress(trimmedInput);
    return {
      ...locationData,
      source: 'address',
      isInIndia: areCoordinatesInIndia(locationData.coordinates.lat, locationData.coordinates.lng)
    };
  } catch (error) {
    throw new Error(`Failed to find location: ${error.message}`);
  }
};

/**
 * Create a location-based context for the assessment
 * @param {Object} coordinates - Latitude and longitude
 * @param {string} address - Address string
 * @returns {Object} Location context with relevant data
 */
export const createLocationContext = async (coordinates, address) => {
  try {
    const { lat, lon } = coordinates;
    const nearestCity = findNearestCity(lat, lon);
    const isInIndia = areCoordinatesInIndia(lat, lon);
    const parsedAddress = parseAddress(address);

    // Get city-specific data if in India
    let cityData = null;
    if (isInIndia && nearestCity) {
      cityData = getCityInfo(nearestCity.name);
    }

    return {
      coordinates: { lat, lon },
      address,
      parsedAddress,
      nearestCity,
      cityData,
      isInIndia,
      formattedCoordinates: formatCoordinates(lat, lon),
      timestamp: new Date().toISOString(),
      // Suggested values based on location
      suggestedRainfall: cityData?.avgRainfall || (isInIndia ? 800 : null),
      suggestedWaterCost: isInIndia ? 0.5 : null
    };
  } catch (error) {
    throw new Error(`Failed to create location context: ${error.message}`);
  }
};

/**
 * Check if browser supports geolocation
 * @returns {boolean} Whether geolocation is supported
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Get location permissions status
 * @returns {Promise<string>} Permission status
 */
export const getLocationPermissionStatus = async () => {
  if (!navigator.permissions) {
    return 'unknown';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Request location permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestLocationPermission = async () => {
  try {
    const location = await getCurrentLocation({ timeout: 1000 });
    return true;
  } catch (error) {
    return error.code !== ERROR_CODES.GEOLOCATION_DENIED;
  }
};