/**
 * Error Handling Utilities
 * 
 * Contains functions for centralized error handling, logging,
 * user-friendly error messages, and error reporting.
 */

import { ERROR_CODES, APP_INFO } from './constants.js';
import { setStorageItem, getStorageItem } from './localStorageUtils.js';

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error categories
 */
export const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  API: 'api',
  FILE: 'file',
  LOCATION: 'location',
  STORAGE: 'storage',
  CALCULATION: 'calculation',
  RENDERING: 'rendering',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

/**
 * Enhanced Error class with additional properties
 */
export class AppError extends Error {
  constructor(message, code = ERROR_CODES.UNKNOWN_ERROR, category = ERROR_CATEGORIES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    this.url = typeof window !== 'undefined' ? window.location.href : 'Unknown';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert error to JSON for logging/reporting
   * @returns {Object} JSON representation of error
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack?.split('\n').slice(0, 10).join('\n') // Limit stack trace
    };
  }
}

/**
 * Error message mappings for user-friendly display
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required.',
  [ERROR_CODES.INVALID_FORMAT]: 'Please enter a valid format.',
  [ERROR_CODES.OUT_OF_RANGE]: 'Value is outside the allowed range.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ERROR_CODES.FORBIDDEN]: 'Access denied.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large. Please choose a smaller file.',
  [ERROR_CODES.INVALID_FILE_TYPE]: 'Invalid file type. Please choose a supported file format.',
  [ERROR_CODES.UPLOAD_FAILED]: 'File upload failed. Please try again.',
  
  [ERROR_CODES.STORAGE_FULL]: 'Storage is full. Please clear some data and try again.',
  [ERROR_CODES.STORAGE_UNAVAILABLE]: 'Storage is not available in this browser.',
  
  [ERROR_CODES.GEOLOCATION_DENIED]: 'Location access was denied. Please enable location services.',
  [ERROR_CODES.GEOLOCATION_UNAVAILABLE]: 'Location services are not available.',
  [ERROR_CODES.GEOCODING_FAILED]: 'Failed to find location. Please try a different address.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.CALCULATION_ERROR]: 'Calculation failed. Please check your input values.',
  [ERROR_CODES.RENDERING_ERROR]: 'Display error occurred. Please refresh the page.'
};

/**
 * Error logging configuration
 */
export const ERROR_CONFIG = {
  LOG_TO_CONSOLE: true,
  LOG_TO_STORAGE: true,
  MAX_STORED_ERRORS: 50,
  STORAGE_KEY: 'error_logs',
  REPORT_CRITICAL_ERRORS: true,
  ENABLE_ERROR_BOUNDARY: true
};

/**
 * Log error to console with formatted output
 * @param {Error} error - Error to log
 * @param {Object} context - Additional context
 */
const logToConsole = (error, context = {}) => {
  if (!ERROR_CONFIG.LOG_TO_CONSOLE) return;

  const errorInfo = {
    message: error.message,
    code: error.code,
    category: error.category,
    severity: error.severity,
    context: { ...error.context, ...context },
    timestamp: error.timestamp || new Date().toISOString(),
    stack: error.stack
  };

  // Use appropriate console method based on severity
  switch (error.severity) {
    case ERROR_SEVERITY.CRITICAL:
      console.error('🔥 CRITICAL ERROR:', errorInfo);
      break;
    case ERROR_SEVERITY.HIGH:
      console.error('❌ HIGH SEVERITY ERROR:', errorInfo);
      break;
    case ERROR_SEVERITY.MEDIUM:
      console.warn('⚠️ MEDIUM SEVERITY ERROR:', errorInfo);
      break;
    case ERROR_SEVERITY.LOW:
      console.info('ℹ️ LOW SEVERITY ERROR:', errorInfo);
      break;
    default:
      console.error('❌ ERROR:', errorInfo);
  }
};

/**
 * Store error in localStorage for later analysis
 * @param {Error} error - Error to store
 * @param {Object} context - Additional context
 */
const storeError = (error, context = {}) => {
  if (!ERROR_CONFIG.LOG_TO_STORAGE) return;

  try {
    const errorLogs = getStorageItem(ERROR_CONFIG.STORAGE_KEY, []);
    
    const errorEntry = {
      id: generateErrorId(),
      timestamp: new Date().toISOString(),
      error: error instanceof AppError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 10).join('\n'),
        code: error.code || ERROR_CODES.UNKNOWN_ERROR,
        category: ERROR_CATEGORIES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM
      },
      context,
      appVersion: APP_INFO.VERSION,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to beginning of array and limit size
    errorLogs.unshift(errorEntry);
    const limitedLogs = errorLogs.slice(0, ERROR_CONFIG.MAX_STORED_ERRORS);
    
    setStorageItem(ERROR_CONFIG.STORAGE_KEY, limitedLogs);
  } catch (storageError) {
    console.warn('Failed to store error log:', storageError);
  }
};

/**
 * Generate unique error ID
 * @returns {string} Error ID
 */
const generateErrorId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

/**
 * Main error handler function
 * @param {Error} error - Error to handle
 * @param {Object} context - Additional context information
 * @param {boolean} reportToUser - Whether to show user-friendly message
 * @returns {Object} Error handling result
 */
export const handleError = (error, context = {}, reportToUser = true) => {
  // Convert to AppError if it's not already
  let appError;
  if (error instanceof AppError) {
    appError = error;
  } else {
    appError = createAppError(error);
  }

  // Log error
  logToConsole(appError, context);
  storeError(appError, context);

  // Report critical errors
  if (appError.severity === ERROR_SEVERITY.CRITICAL && ERROR_CONFIG.REPORT_CRITICAL_ERRORS) {
    reportCriticalError(appError, context);
  }

  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(appError);

  return {
    error: appError,
    userMessage: reportToUser ? userMessage : null,
    shouldDisplay: reportToUser,
    context
  };
};

/**
 * Create AppError from generic Error
 * @param {Error} error - Generic error
 * @returns {AppError} AppError instance
 */
const createAppError = (error) => {
  // Determine category and code based on error type/message
  let category = ERROR_CATEGORIES.UNKNOWN;
  let code = ERROR_CODES.UNKNOWN_ERROR;
  let severity = ERROR_SEVERITY.MEDIUM;

  // Network errors
  if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
    category = ERROR_CATEGORIES.NETWORK;
    code = ERROR_CODES.NETWORK_ERROR;
  }

  // API errors
  if (error.name === 'APIError' || error.message.toLowerCase().includes('api')) {
    category = ERROR_CATEGORIES.API;
    code = error.code || ERROR_CODES.SERVER_ERROR;
  }

  // File errors
  if (error.message.toLowerCase().includes('file') || error.message.toLowerCase().includes('upload')) {
    category = ERROR_CATEGORIES.FILE;
    code = ERROR_CODES.UPLOAD_FAILED;
  }

  // Location errors
  if (error.message.toLowerCase().includes('location') || error.message.toLowerCase().includes('geolocation')) {
    category = ERROR_CATEGORIES.LOCATION;
    code = ERROR_CODES.GEOLOCATION_UNAVAILABLE;
  }

  // Storage errors
  if (error.message.toLowerCase().includes('storage') || error.message.toLowerCase().includes('quota')) {
    category = ERROR_CATEGORIES.STORAGE;
    code = ERROR_CODES.STORAGE_FULL;
  }

  return new AppError(error.message, code, category, severity);
};

/**
 * Get user-friendly error message
 * @param {AppError} error - AppError instance
 * @returns {string} User-friendly message
 */
export const getUserFriendlyMessage = (error) => {
  const code = error.code || ERROR_CODES.UNKNOWN_ERROR;
  return ERROR_MESSAGES[code] || error.message || 'An unexpected error occurred.';
};

/**
 * Report critical errors (could be sent to error reporting service)
 * @param {AppError} error - Critical error
 * @param {Object} context - Error context
 */
const reportCriticalError = async (error, context) => {
  try {
    // In a real application, this would send to an error reporting service
    console.error('CRITICAL ERROR REPORTED:', {
      error: error.toJSON(),
      context,
      timestamp: new Date().toISOString()
    });

    // Example: Send to error reporting service
    // await sendToErrorReportingService(error, context);
  } catch (reportError) {
    console.error('Failed to report critical error:', reportError);
  }
};

/**
 * Create error boundary handler for React components
 * @param {string} componentName - Name of the component
 * @returns {Function} Error boundary handler
 */
export const createErrorBoundary = (componentName) => {
  return (error, errorInfo) => {
    const appError = new AppError(
      `Error in ${componentName}: ${error.message}`,
      ERROR_CODES.RENDERING_ERROR,
      ERROR_CATEGORIES.RENDERING,
      ERROR_SEVERITY.HIGH,
      {
        component: componentName,
        errorInfo: errorInfo?.componentStack?.split('\n').slice(0, 5).join('\n')
      }
    );

    handleError(appError, { componentName }, false);
  };
};

/**
 * Wrap async functions with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export const withErrorHandling = (asyncFn, options = {}) => {
  const { 
    category = ERROR_CATEGORIES.UNKNOWN,
    severity = ERROR_SEVERITY.MEDIUM,
    reportToUser = true,
    fallbackValue = null
  } = options;

  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        error.message,
        error.code || ERROR_CODES.UNKNOWN_ERROR,
        category,
        severity,
        { functionName: asyncFn.name }
      );

      const result = handleError(appError, { args }, reportToUser);
      
      // Return fallback value or re-throw based on options
      if (fallbackValue !== null) {
        return fallbackValue;
      }
      
      throw result.error;
    }
  };
};

/**
 * Create validation error
 * @param {string} field - Field name
 * @param {string} message - Validation message
 * @param {*} value - Invalid value
 * @returns {AppError} Validation error
 */
export const createValidationError = (field, message, value = null) => {
  return new AppError(
    message,
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_CATEGORIES.VALIDATION,
    ERROR_SEVERITY.LOW,
    { field, value }
  );
};

/**
 * Create network error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} endpoint - API endpoint
 * @returns {AppError} Network error
 */
export const createNetworkError = (message, status = 0, endpoint = '') => {
  const severity = status >= 500 ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM;
  
  return new AppError(
    message,
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CATEGORIES.NETWORK,
    severity,
    { status, endpoint }
  );
};

/**
 * Get error logs from storage
 * @param {number} limit - Maximum number of logs to return
 * @returns {Array} Array of error logs
 */
export const getErrorLogs = (limit = 50) => {
  const errorLogs = getStorageItem(ERROR_CONFIG.STORAGE_KEY, []);
  return errorLogs.slice(0, limit);
};

/**
 * Clear error logs from storage
 * @returns {boolean} Success status
 */
export const clearErrorLogs = () => {
  return setStorageItem(ERROR_CONFIG.STORAGE_KEY, []);
};

/**
 * Get error statistics
 * @returns {Object} Error statistics
 */
export const getErrorStatistics = () => {
  const errorLogs = getStorageItem(ERROR_CONFIG.STORAGE_KEY, []);
  
  const stats = {
    total: errorLogs.length,
    bySeverity: {},
    byCategory: {},
    recent: errorLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return logTime > oneDayAgo;
    }).length
  };

  // Count by severity
  Object.values(ERROR_SEVERITY).forEach(severity => {
    stats.bySeverity[severity] = errorLogs.filter(log => 
      log.error.severity === severity
    ).length;
  });

  // Count by category
  Object.values(ERROR_CATEGORIES).forEach(category => {
    stats.byCategory[category] = errorLogs.filter(log => 
      log.error.category === category
    ).length;
  });

  return stats;
};

/**
 * Export error logs for analysis
 * @returns {Object} Exportable error data
 */
export const exportErrorLogs = () => {
  const errorLogs = getStorageItem(ERROR_CONFIG.STORAGE_KEY, []);
  const stats = getErrorStatistics();
  
  return {
    appInfo: APP_INFO,
    exportDate: new Date().toISOString(),
    statistics: stats,
    logs: errorLogs
  };
};

/**
 * Global error handler for unhandled errors
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new AppError(
      event.reason?.message || 'Unhandled promise rejection',
      ERROR_CODES.UNKNOWN_ERROR,
      ERROR_CATEGORIES.UNKNOWN,
      ERROR_SEVERITY.HIGH,
      { reason: event.reason }
    );

    handleError(error, { type: 'unhandledrejection' }, false);
    event.preventDefault(); // Prevent console logging
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    const error = new AppError(
      event.message || 'Global JavaScript error',
      ERROR_CODES.UNKNOWN_ERROR,
      ERROR_CATEGORIES.UNKNOWN,
      ERROR_SEVERITY.HIGH,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );

    handleError(error, { type: 'javascript' }, false);
  });
};

// Auto-setup global error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}