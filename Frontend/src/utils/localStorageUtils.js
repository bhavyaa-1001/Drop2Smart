/**
 * LocalStorage Utilities
 * 
 * Contains functions for managing browser storage operations,
 * saving assessment data, user preferences, and results history.
 */

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER_PREFERENCES: 'userPreferences',
  ASSESSMENT_DATA: 'assessmentData',
  RESULTS_HISTORY: 'resultsHistory',
  DRAFT_ASSESSMENT: 'draftAssessment',
  USER_PROFILE: 'userProfile',
  APP_SETTINGS: 'appSettings'
};

/**
 * Safely get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {*} Parsed value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      console.warn('localStorage is not available');
      return defaultValue;
    }

    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    // Try to parse as JSON, fallback to string if parsing fails
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error(`Error getting storage item "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value) => {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      console.warn('localStorage is not available');
      return false;
    }

    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error(`Error setting storage item "${key}":`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeStorageItem = (key) => {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      console.warn('localStorage is not available');
      return false;
    }

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing storage item "${key}":`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 * @returns {boolean} Success status
 */
export const clearAllStorage = () => {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      console.warn('localStorage is not available');
      return false;
    }

    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Get available storage space (approximate)
 * @returns {Object} Storage usage information
 */
export const getStorageUsage = () => {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      return { available: false, used: 0, total: 0, percentage: 0 };
    }

    let totalUsed = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalUsed += localStorage.getItem(key).length;
      }
    }

    // Most browsers allow ~5MB for localStorage
    const estimatedTotal = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = Math.round((totalUsed / estimatedTotal) * 100);

    return {
      available: true,
      used: totalUsed,
      total: estimatedTotal,
      percentage: Math.min(percentage, 100)
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { available: false, used: 0, total: 0, percentage: 0 };
  }
};

/**
 * Save assessment draft data
 * @param {Object} draftData - Assessment form data
 * @param {File|null} imageFile - Uploaded image file (converted to base64)
 * @returns {boolean} Success status
 */
export const saveDraftAssessment = async (draftData, imageFile = null) => {
  try {
    const draft = {
      ...draftData,
      timestamp: new Date().toISOString(),
      hasImage: !!imageFile
    };

    // Convert image to base64 if provided
    if (imageFile) {
      const { fileToBase64 } = await import('./fileUtils.js');
      draft.imageData = await fileToBase64(imageFile);
    }

    return setStorageItem(STORAGE_KEYS.DRAFT_ASSESSMENT, draft);
  } catch (error) {
    console.error('Error saving draft assessment:', error);
    return false;
  }
};

/**
 * Load assessment draft data
 * @returns {Object|null} Draft data or null if not found
 */
export const loadDraftAssessment = () => {
  const draft = getStorageItem(STORAGE_KEYS.DRAFT_ASSESSMENT);
  
  if (!draft || !draft.timestamp) {
    return null;
  }

  // Check if draft is older than 24 hours
  const draftTime = new Date(draft.timestamp);
  const now = new Date();
  const hoursDiff = (now - draftTime) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    removeStorageItem(STORAGE_KEYS.DRAFT_ASSESSMENT);
    return null;
  }

  return draft;
};

/**
 * Clear assessment draft
 * @returns {boolean} Success status
 */
export const clearDraftAssessment = () => {
  return removeStorageItem(STORAGE_KEYS.DRAFT_ASSESSMENT);
};

/**
 * Save assessment results to history
 * @param {Object} results - Assessment results
 * @param {Object} inputData - Original input data
 * @returns {boolean} Success status
 */
export const saveAssessmentResults = (results, inputData) => {
  try {
    const history = getStorageItem(STORAGE_KEYS.RESULTS_HISTORY, []);
    
    const newResult = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      results,
      inputData: {
        ...inputData,
        // Don't save the actual image data to save space
        imageData: inputData.imageData ? '[Image Data]' : null
      }
    };

    // Keep only the last 10 results
    const updatedHistory = [newResult, ...history].slice(0, 10);
    
    return setStorageItem(STORAGE_KEYS.RESULTS_HISTORY, updatedHistory);
  } catch (error) {
    console.error('Error saving assessment results:', error);
    return false;
  }
};

/**
 * Get assessment results history
 * @returns {Array} Array of previous assessment results
 */
export const getAssessmentHistory = () => {
  return getStorageItem(STORAGE_KEYS.RESULTS_HISTORY, []);
};

/**
 * Delete specific assessment from history
 * @param {string} resultId - ID of the result to delete
 * @returns {boolean} Success status
 */
export const deleteAssessmentResult = (resultId) => {
  try {
    const history = getStorageItem(STORAGE_KEYS.RESULTS_HISTORY, []);
    const updatedHistory = history.filter(result => result.id !== resultId);
    return setStorageItem(STORAGE_KEYS.RESULTS_HISTORY, updatedHistory);
  } catch (error) {
    console.error('Error deleting assessment result:', error);
    return false;
  }
};

/**
 * Save user preferences
 * @param {Object} preferences - User preferences object
 * @returns {boolean} Success status
 */
export const saveUserPreferences = (preferences) => {
  const currentPrefs = getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {});
  const updatedPrefs = { ...currentPrefs, ...preferences };
  return setStorageItem(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
};

/**
 * Get user preferences
 * @returns {Object} User preferences object
 */
export const getUserPreferences = () => {
  return getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {
    units: 'metric', // 'metric' or 'imperial'
    currency: 'INR',
    language: 'en',
    notifications: true,
    autoSave: true,
    theme: 'light'
  });
};

/**
 * Save user profile data
 * @param {Object} profile - User profile data
 * @returns {boolean} Success status
 */
export const saveUserProfile = (profile) => {
  const profileData = {
    ...profile,
    lastUpdated: new Date().toISOString()
  };
  return setStorageItem(STORAGE_KEYS.USER_PROFILE, profileData);
};

/**
 * Get user profile data
 * @returns {Object|null} User profile data or null
 */
export const getUserProfile = () => {
  return getStorageItem(STORAGE_KEYS.USER_PROFILE);
};

/**
 * Save application settings
 * @param {Object} settings - Application settings
 * @returns {boolean} Success status
 */
export const saveAppSettings = (settings) => {
  const currentSettings = getStorageItem(STORAGE_KEYS.APP_SETTINGS, {});
  const updatedSettings = { ...currentSettings, ...settings };
  return setStorageItem(STORAGE_KEYS.APP_SETTINGS, updatedSettings);
};

/**
 * Get application settings
 * @returns {Object} Application settings
 */
export const getAppSettings = () => {
  return getStorageItem(STORAGE_KEYS.APP_SETTINGS, {
    version: '1.0.0',
    firstVisit: true,
    onboardingCompleted: false,
    analyticsEnabled: true,
    debugMode: false
  });
};

/**
 * Mark first visit as completed
 * @returns {boolean} Success status
 */
export const markFirstVisitCompleted = () => {
  return saveAppSettings({ firstVisit: false });
};

/**
 * Mark onboarding as completed
 * @returns {boolean} Success status
 */
export const markOnboardingCompleted = () => {
  return saveAppSettings({ onboardingCompleted: true });
};

/**
 * Check if localStorage is available and working
 * @returns {boolean} Whether localStorage is available
 */
export const isStorageAvailable = () => {
  try {
    if (typeof Storage === 'undefined' || !localStorage) {
      return false;
    }

    // Test if we can actually write to localStorage
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Export all data for backup purposes
 * @returns {Object} All localStorage data
 */
export const exportAllData = () => {
  try {
    const data = {};
    for (const key of Object.values(STORAGE_KEYS)) {
      data[key] = getStorageItem(key);
    }
    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    return {};
  }
};

/**
 * Import data from backup
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
export const importAllData = (data) => {
  try {
    let success = true;
    for (const [key, value] of Object.entries(data)) {
      if (Object.values(STORAGE_KEYS).includes(key)) {
        success = setStorageItem(key, value) && success;
      }
    }
    return success;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};