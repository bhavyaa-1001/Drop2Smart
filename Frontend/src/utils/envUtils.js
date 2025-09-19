/**
 * Environment variable utilities for React frontend
 * Handles differences between Vite and Create React App environments
 */

/**
 * Get environment variable value
 * Works with both Vite (import.meta.env) and CRA (process.env) environments
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Environment variable value or default
 */
export const getEnvVar = (key, defaultValue = undefined) => {
  // Check for Vite environment variables (import.meta.env)
  try {
    if (import.meta?.env) {
      const value = import.meta.env[key] || import.meta.env[`VITE_${key}`];
      if (value !== undefined) return value;
    }
  } catch (e) {
    // import.meta not available in this environment
  }

  // Fallback for Create React App or Node.js environments (process.env)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key] || process.env[`REACT_APP_${key}`];
      if (value !== undefined) return value;
    }
  } catch (e) {
    // process not available in browser environment
  }

  return defaultValue;
};

/**
 * Check if we're in development mode
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  // Vite
  try {
    if (import.meta?.env) {
      return import.meta.env.MODE === 'development' || import.meta.env.DEV === true;
    }
  } catch (e) {
    // import.meta not available
  }
  
  // Create React App / Node.js
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
  } catch (e) {
    // process not available in browser
  }
  
  return false;
};

/**
 * Check if we're in production mode
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  // Vite
  try {
    if (import.meta?.env) {
      return import.meta.env.MODE === 'production' || import.meta.env.PROD === true;
    }
  } catch (e) {
    // import.meta not available
  }
  
  // Create React App / Node.js
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'production';
    }
  } catch (e) {
    // process not available in browser
  }
  
  return false;
};

/**
 * Get Google Maps API key from environment
 * @returns {string|null} API key or null if not found
 */
export const getGoogleMapsApiKey = () => {
  return getEnvVar('GOOGLE_MAPS_API_KEY') || 
         getEnvVar('REACT_APP_GOOGLE_MAPS_API_KEY') || 
         getEnvVar('VITE_GOOGLE_MAPS_API_KEY') ||
         null;
};

/**
 * Check if Google Maps API key is available
 * @returns {boolean} True if API key is available
 */
export const hasGoogleMapsApiKey = () => {
  return Boolean(getGoogleMapsApiKey());
};

/**
 * Get all environment variables for debugging (development only)
 * @returns {Object} Environment variables object
 */
export const getEnvDebugInfo = () => {
  if (!isDevelopment()) {
    return { message: 'Debug info only available in development mode' };
  }

  const envInfo = {
    environment: 'unknown',
    variables: {}
  };

  // Check Vite environment
  try {
    if (import.meta?.env) {
      envInfo.environment = 'Vite';
      envInfo.variables = { ...import.meta.env };
      return envInfo;
    }
  } catch (e) {
    // import.meta not available
  }
  
  // Check Create React App environment
  try {
    if (typeof process !== 'undefined' && process.env) {
      envInfo.environment = 'Create React App / Node.js';
      // Only include REACT_APP_ prefixed variables for security
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('REACT_APP_') || key === 'NODE_ENV') {
          envInfo.variables[key] = process.env[key];
        }
      });
    }
  } catch (e) {
    // process not available in browser
  }

  return envInfo;
};
