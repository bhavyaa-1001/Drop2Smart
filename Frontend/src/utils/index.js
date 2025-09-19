/**
 * Utils Index
 * 
 * Central export file for all utility functions in the Drop2Smart application.
 * Provides a clean, organized way to import utilities throughout the app.
 */

// Calculation utilities
export {
  RUNOFF_COEFFICIENTS,
  SLOPE_EFFICIENCY_FACTORS,
  calculateRainwaterPotential,
  getSlopeEfficiency,
  calculateMonthlyAverage,
  calculateCostSavings,
  calculateCO2Reduction,
  calculateRoofEfficiency,
  calculateComplianceScore,
  calculateTankCapacity,
  estimateSystemCost,
  generateMonthlyEstimates,
  calculateROI
} from './calculations.js';

// File handling utilities
export {
  fileToBase64,
  resizeImage,
  compressImage,
  getImageInfo,
  createThumbnail,
  isValidFileType,
  isValidFileSize,
  generateUniqueFilename,
  downloadFile,
  copyToClipboard,
  dataUrlToFile,
  batchProcessFiles,
  createDragDropHandlers,
  checkFileAPISupport
} from './fileUtils.js';

// Formatting utilities
export {
  formatIndianNumber,
  formatCurrency,
  formatWaterVolume,
  formatArea,
  formatPercentage,
  formatCO2Reduction,
  formatDuration,
  formatRainfall,
  formatSlope,
  formatHeight,
  formatEfficiencyScore,
  formatComplianceScore,
  formatFileSize,
  formatDate,
  truncateText,
  formatPhoneNumber,
  formatMaterialName,
  createResultSummary
} from './formatting.js';

// Form validation utilities
export {
  validateRoofArea,
  validateRoofSlope,
  validateRoofMaterial,
  validateBuildingHeight,
  validateLocation,
  validateAnnualRainfall,
  validateImageFile,
  validateEmail,
  validatePhone,
  validateFormData,
  getValidationFunction,
  createValidationState
} from './validation.js';

// Local storage utilities
export {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAllStorage,
  getStorageUsage,
  saveDraftAssessment,
  loadDraftAssessment,
  clearDraftAssessment,
  saveAssessmentResults,
  getAssessmentHistory,
  deleteAssessmentResult,
  saveUserPreferences,
  getUserPreferences,
  saveUserProfile,
  getUserProfile,
  saveAppSettings,
  getAppSettings,
  markFirstVisitCompleted,
  markOnboardingCompleted,
  isStorageAvailable,
  exportAllData,
  importAllData
} from './localStorageUtils.js';

// API utilities
export {
  API_CONFIG,
  HTTP_STATUS,
  APIError,
  makeRequest,
  get,
  post,
  put,
  del,
  uploadFile,
  getRainfallData,
  getLocationFromCoordinates,
  getCoordinatesFromAddress,
  checkAPIHealth,
  batchRequests,
  createInterceptedAPI
} from './apiUtils.js';

// Location utilities
export {
  GEOLOCATION_OPTIONS,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  calculateDistance,
  findNearestCity,
  getCityInfo,
  parseAddress,
  formatCoordinates,
  areValidCoordinates,
  areCoordinatesInIndia,
  getLocationFromInput,
  getAutomaticLocation,
  createLocationContext,
  isGeolocationSupported,
  getLocationPermissionStatus,
  requestLocationPermission
} from './locationUtils.js';

// Analytics utilities
export {
  EVENT_TYPES,
  ANALYTICS_CONFIG,
  initializeAnalytics,
  trackEvent,
  trackPageView,
  trackInteraction,
  trackFormSubmission,
  trackAssessment,
  trackAPICall,
  trackError as trackAnalyticsError,
  trackPerformance,
  trackFileUpload,
  flushEvents,
  getAnalyticsSummary,
  clearAnalyticsData,
  setAnalyticsEnabled,
  createComponentTracker,
  trackBusinessMetric
} from './analyticsUtils.js';

// Error handling utilities
export {
  ERROR_SEVERITY,
  ERROR_CATEGORIES,
  AppError,
  ERROR_MESSAGES,
  ERROR_CONFIG,
  handleError,
  getUserFriendlyMessage,
  createErrorBoundary,
  withErrorHandling,
  createValidationError,
  createNetworkError,
  getErrorLogs,
  clearErrorLogs,
  getErrorStatistics,
  exportErrorLogs,
  setupGlobalErrorHandling
} from './errorUtils.js';

// Constants (re-exported for convenience)
export {
  APP_INFO,
  ROOF_MATERIALS,
  ROOF_SLOPES,
  EFFICIENCY_LEVELS,
  COMPLIANCE_LEVELS,
  SYSTEM_COMPONENTS,
  INDIAN_CITIES,
  WATER_COSTS,
  ENVIRONMENTAL_IMPACT,
  VALIDATION_LIMITS,
  THEME_COLORS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  STORAGE_LIMITS,
  API_CONSTANTS,
  FILE_TYPES,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  UNITS,
  REGEX_PATTERNS,
  DEFAULT_VALUES
} from './constants.js';

/**
 * Utility collections for easier importing
 */

// All calculation-related functions
export const calculations = {
  RUNOFF_COEFFICIENTS,
  SLOPE_EFFICIENCY_FACTORS,
  calculateRainwaterPotential,
  getSlopeEfficiency,
  calculateMonthlyAverage,
  calculateCostSavings,
  calculateCO2Reduction,
  calculateRoofEfficiency,
  calculateComplianceScore,
  calculateTankCapacity,
  estimateSystemCost,
  generateMonthlyEstimates,
  calculateROI
};

// All file-related functions
export const fileOperations = {
  fileToBase64,
  resizeImage,
  compressImage,
  getImageInfo,
  createThumbnail,
  isValidFileType,
  isValidFileSize,
  generateUniqueFilename,
  downloadFile,
  copyToClipboard,
  dataUrlToFile,
  batchProcessFiles,
  createDragDropHandlers,
  checkFileAPISupport
};

// All formatting functions
export const formatting = {
  formatIndianNumber,
  formatCurrency,
  formatWaterVolume,
  formatArea,
  formatPercentage,
  formatCO2Reduction,
  formatDuration,
  formatRainfall,
  formatSlope,
  formatHeight,
  formatEfficiencyScore,
  formatComplianceScore,
  formatFileSize,
  formatDate,
  truncateText,
  formatPhoneNumber,
  formatMaterialName,
  createResultSummary
};

// All validation functions
export const validation = {
  validateRoofArea,
  validateRoofSlope,
  validateRoofMaterial,
  validateBuildingHeight,
  validateLocation,
  validateAnnualRainfall,
  validateImageFile,
  validateEmail,
  validatePhone,
  validateFormData,
  getValidationFunction,
  createValidationState
};

// All storage functions
export const storage = {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAllStorage,
  getStorageUsage,
  saveDraftAssessment,
  loadDraftAssessment,
  clearDraftAssessment,
  saveAssessmentResults,
  getAssessmentHistory,
  deleteAssessmentResult,
  saveUserPreferences,
  getUserPreferences,
  saveUserProfile,
  getUserProfile,
  saveAppSettings,
  getAppSettings,
  markFirstVisitCompleted,
  markOnboardingCompleted,
  isStorageAvailable,
  exportAllData,
  importAllData
};

// All API functions
export const api = {
  API_CONFIG,
  HTTP_STATUS,
  APIError,
  makeRequest,
  get,
  post,
  put,
  del,
  uploadFile,
  getRainfallData,
  getLocationFromCoordinates,
  getCoordinatesFromAddress,
  checkAPIHealth,
  batchRequests,
  createInterceptedAPI
};

// All location functions
export const location = {
  GEOLOCATION_OPTIONS,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  calculateDistance,
  findNearestCity,
  getCityInfo,
  parseAddress,
  formatCoordinates,
  areValidCoordinates,
  areCoordinatesInIndia,
  getLocationFromInput,
  getAutomaticLocation,
  createLocationContext,
  isGeolocationSupported,
  getLocationPermissionStatus,
  requestLocationPermission
};

// All analytics functions
export const analytics = {
  EVENT_TYPES,
  ANALYTICS_CONFIG,
  initializeAnalytics,
  trackEvent,
  trackPageView,
  trackInteraction,
  trackFormSubmission,
  trackAssessment,
  trackAPICall,
  trackError: trackAnalyticsError,
  trackPerformance,
  trackFileUpload,
  flushEvents,
  getAnalyticsSummary,
  clearAnalyticsData,
  setAnalyticsEnabled,
  createComponentTracker,
  trackBusinessMetric
};

// All error handling functions
export const errors = {
  ERROR_SEVERITY,
  ERROR_CATEGORIES,
  AppError,
  ERROR_MESSAGES,
  ERROR_CONFIG,
  handleError,
  getUserFriendlyMessage,
  createErrorBoundary,
  withErrorHandling,
  createValidationError,
  createNetworkError,
  getErrorLogs,
  clearErrorLogs,
  getErrorStatistics,
  exportErrorLogs,
  setupGlobalErrorHandling
};

/**
 * Commonly used utility combinations
 */

// Assessment workflow utilities
export const assessment = {
  // Calculations
  calculateRainwaterPotential,
  calculateCostSavings,
  calculateCO2Reduction,
  calculateRoofEfficiency,
  calculateComplianceScore,
  estimateSystemCost,
  
  // Validation
  validateFormData,
  
  // Formatting
  formatWaterVolume,
  formatCurrency,
  formatPercentage,
  formatEfficiencyScore,
  
  // Storage
  saveDraftAssessment,
  loadDraftAssessment,
  saveAssessmentResults,
  
  // Analytics
  trackAssessment
};

// User interface utilities
export const ui = {
  // Formatting
  formatIndianNumber,
  formatCurrency,
  formatDate,
  truncateText,
  
  // Theme and styling
  THEME_COLORS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  
  // File operations
  createDragDropHandlers,
  formatFileSize,
  
  // Error handling
  getUserFriendlyMessage,
  createErrorBoundary
};

// Developer utilities
export const dev = {
  // Error handling
  handleError,
  getErrorLogs,
  clearErrorLogs,
  getErrorStatistics,
  
  // Analytics
  getAnalyticsSummary,
  clearAnalyticsData,
  
  // Storage
  getStorageUsage,
  exportAllData,
  
  // API
  checkAPIHealth
};

/**
 * Version information
 */
export const VERSION = '1.0.0';
export const UTILS_VERSION = '1.0.0';

/**
 * Initialize all utilities (call this once in your app startup)
 */
export const initializeUtils = () => {
  // Set up global error handling
  setupGlobalErrorHandling();
  
  // Initialize analytics
  initializeAnalytics();
  
  console.log(`Drop2Smart Utils v${UTILS_VERSION} initialized successfully`);
};