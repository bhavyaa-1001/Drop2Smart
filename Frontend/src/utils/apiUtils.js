/**
 * API Utilities
 * 
 * Contains functions for handling HTTP requests, error handling,
 * and API communication with external services like weather APIs,
 * location services, etc.
 */

/**
 * API endpoints and configuration
 */
export const API_CONFIG = {
  BASE_URL: 'https://api.drop2smart.com',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // External API endpoints
  WEATHER: {
    OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
    WEATHERAPI: 'https://api.weatherapi.com/v1'
  },
  
  LOCATION: {
    GEOCODING: 'https://api.mapbox.com/geocoding/v5',
    NOMINATIM: 'https://nominatim.openstreetmap.org'
  }
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Create standardized API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @param {*} data - Additional error data
 * @returns {Error} Standardized API error
 */
export class APIError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make HTTP request with retry logic and error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Current retry count
 * @returns {Promise<Object>} Response data
 */
export const makeRequest = async (url, options = {}, retryCount = 0) => {
  const {
    timeout = API_CONFIG.TIMEOUT,
    retryAttempts = API_CONFIG.RETRY_ATTEMPTS,
    retryDelay = API_CONFIG.RETRY_DELAY,
    ...fetchOptions
  } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...fetchOptions.headers
    };

    // Make the request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        // Response might not be JSON
      }

      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new APIError(errorMessage, response.status, 'HTTP_ERROR', errorData);
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT_ERROR');
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Network error', 0, 'NETWORK_ERROR', error.message);
    }

    // If it's already an APIError, re-throw it
    if (error instanceof APIError) {
      // Retry logic for retryable errors
      if (shouldRetry(error.status, retryCount, retryAttempts)) {
        await sleep(retryDelay * (retryCount + 1)); // Exponential backoff
        return makeRequest(url, options, retryCount + 1);
      }
      throw error;
    }

    // Wrap other errors
    throw new APIError(error.message, 500, 'UNKNOWN_ERROR', error);
  }
};

/**
 * Determine if request should be retried
 * @param {number} status - HTTP status code
 * @param {number} retryCount - Current retry count
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {boolean} Whether to retry
 */
const shouldRetry = (status, retryCount, maxRetries) => {
  if (retryCount >= maxRetries) return false;
  
  // Retry on server errors and rate limiting
  return status === 429 || status >= 500;
};

/**
 * GET request
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export const get = async (url, params = {}, options = {}) => {
  // Add query parameters to URL
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, value);
    }
  });

  return makeRequest(urlObj.toString(), {
    ...options,
    method: 'GET'
  });
};

/**
 * POST request
 * @param {string} url - Request URL
 * @param {Object} data - Request body data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export const post = async (url, data = {}, options = {}) => {
  return makeRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * PUT request
 * @param {string} url - Request URL
 * @param {Object} data - Request body data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export const put = async (url, data = {}, options = {}) => {
  return makeRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

/**
 * DELETE request
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Response data
 */
export const del = async (url, options = {}) => {
  return makeRequest(url, {
    ...options,
    method: 'DELETE'
  });
};

/**
 * Upload file with progress tracking
 * @param {string} url - Upload URL
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Upload response
 */
export const uploadFile = async (url, file, onProgress = null, options = {}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress(percentage, event.loaded, event.total);
        }
      });
    }

    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new APIError(`Upload failed: ${xhr.statusText}`, xhr.status, 'UPLOAD_ERROR'));
      }
    });

    // Error handler
    xhr.addEventListener('error', () => {
      reject(new APIError('Upload failed', 0, 'NETWORK_ERROR'));
    });

    // Timeout handler
    xhr.addEventListener('timeout', () => {
      reject(new APIError('Upload timeout', 408, 'TIMEOUT_ERROR'));
    });

    // Configure request
    xhr.open('POST', url);
    xhr.timeout = options.timeout || API_CONFIG.TIMEOUT;

    // Add custom headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.send(formData);
  });
};

/**
 * Fetch rainfall data from weather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} apiKey - Weather API key
 * @returns {Promise<Object>} Rainfall data
 */
export const getRainfallData = async (lat, lon, apiKey) => {
  try {
    const url = `${API_CONFIG.WEATHER.OPENWEATHER}/onecall/timemachine`;
    
    // Get rainfall data for the past year
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (365 * 24 * 60 * 60); // 1 year ago
    
    const response = await get(url, {
      lat,
      lon,
      dt: startDate,
      appid: apiKey,
      units: 'metric'
    });

    // Process rainfall data
    const rainfall = response.hourly?.reduce((total, hour) => {
      return total + (hour.rain?.['1h'] || 0);
    }, 0) || 0;

    return {
      annualRainfall: Math.round(rainfall),
      location: { lat, lon },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    throw new APIError('Failed to fetch rainfall data', 500, 'WEATHER_API_ERROR', error.message);
  }
};

/**
 * Get location from coordinates (reverse geocoding)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Location data
 */
export const getLocationFromCoordinates = async (lat, lon) => {
  try {
    const url = `${API_CONFIG.LOCATION.NOMINATIM}/reverse`;
    
    const response = await get(url, {
      lat,
      lon,
      format: 'json',
      addressdetails: 1
    }, {
      headers: {
        'User-Agent': 'Drop2Smart-App/1.0'
      }
    });

    return {
      address: response.display_name,
      city: response.address?.city || response.address?.town || response.address?.village,
      state: response.address?.state,
      country: response.address?.country,
      pincode: response.address?.postcode,
      coordinates: { lat, lon }
    };

  } catch (error) {
    throw new APIError('Failed to get location data', 500, 'GEOCODING_ERROR', error.message);
  }
};

/**
 * Get coordinates from address (geocoding)
 * @param {string} address - Address string
 * @returns {Promise<Object>} Coordinates and location data
 */
export const getCoordinatesFromAddress = async (address) => {
  try {
    const url = `${API_CONFIG.LOCATION.NOMINATIM}/search`;
    
    const response = await get(url, {
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: 1
    }, {
      headers: {
        'User-Agent': 'Drop2Smart-App/1.0'
      }
    });

    if (!response || response.length === 0) {
      throw new APIError('Location not found', 404, 'LOCATION_NOT_FOUND');
    }

    const result = response[0];
    return {
      coordinates: {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      },
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      state: result.address?.state,
      country: result.address?.country,
      pincode: result.address?.postcode
    };

  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Failed to geocode address', 500, 'GEOCODING_ERROR', error.message);
  }
};

/**
 * Check API health/connectivity
 * @param {string} url - API base URL
 * @returns {Promise<Object>} Health check result
 */
export const checkAPIHealth = async (url = API_CONFIG.BASE_URL) => {
  try {
    const startTime = Date.now();
    await get(`${url}/health`, {}, { timeout: 5000 });
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Batch API requests with rate limiting
 * @param {Array} requests - Array of request configurations
 * @param {number} batchSize - Number of concurrent requests
 * @param {number} delayBetweenBatches - Delay between batches in ms
 * @returns {Promise<Array>} Array of results
 */
export const batchRequests = async (requests, batchSize = 3, delayBetweenBatches = 1000) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (request, index) => {
      try {
        const { url, method = 'GET', data = {}, options = {} } = request;
        
        switch (method.toLowerCase()) {
          case 'post':
            return await post(url, data, options);
          case 'put':
            return await put(url, data, options);
          case 'delete':
            return await del(url, options);
          default:
            return await get(url, data, options);
        }
      } catch (error) {
        return { error: error.message, request: request };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches (except for the last batch)
    if (i + batchSize < requests.length) {
      await sleep(delayBetweenBatches);
    }
  }
  
  return results;
};

/**
 * Create API request interceptor
 * @param {Function} requestInterceptor - Function to modify request before sending
 * @param {Function} responseInterceptor - Function to process response after receiving
 * @returns {Object} Modified API functions
 */
export const createInterceptedAPI = (requestInterceptor, responseInterceptor) => {
  const interceptedRequest = async (originalFn, ...args) => {
    // Apply request interceptor
    const modifiedArgs = requestInterceptor ? await requestInterceptor(...args) : args;
    
    try {
      // Make the request
      const response = await originalFn(...modifiedArgs);
      
      // Apply response interceptor
      return responseInterceptor ? await responseInterceptor(response) : response;
    } catch (error) {
      // Apply response interceptor to errors too
      if (responseInterceptor) {
        const processedError = await responseInterceptor(null, error);
        if (processedError) throw processedError;
      }
      throw error;
    }
  };

  return {
    get: (...args) => interceptedRequest(get, ...args),
    post: (...args) => interceptedRequest(post, ...args),
    put: (...args) => interceptedRequest(put, ...args),
    del: (...args) => interceptedRequest(del, ...args),
    uploadFile: (...args) => interceptedRequest(uploadFile, ...args)
  };
};