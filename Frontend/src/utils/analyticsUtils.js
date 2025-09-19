/**
 * Analytics Utilities
 * 
 * Contains functions for tracking user interactions, generating usage analytics,
 * and collecting performance metrics for the Drop2Smart application.
 */

import { getStorageItem, setStorageItem } from './localStorageUtils.js';
import { APP_INFO } from './constants.js';
import { isDevelopment } from './envUtils';

/**
 * Analytics event types
 */
export const EVENT_TYPES = {
  // Page views
  PAGE_VIEW: 'page_view',
  PAGE_LEAVE: 'page_leave',
  
  // User interactions
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  INPUT_FOCUS: 'input_focus',
  INPUT_BLUR: 'input_blur',
  
  // Assessment specific
  ASSESSMENT_START: 'assessment_start',
  ASSESSMENT_COMPLETE: 'assessment_complete',
  ASSESSMENT_ABANDON: 'assessment_abandon',
  DRAFT_SAVE: 'draft_save',
  DRAFT_LOAD: 'draft_load',
  
  // File operations
  FILE_UPLOAD: 'file_upload',
  FILE_UPLOAD_ERROR: 'file_upload_error',
  IMAGE_PROCESS: 'image_process',
  
  // Location services
  LOCATION_REQUEST: 'location_request',
  LOCATION_SUCCESS: 'location_success',
  LOCATION_ERROR: 'location_error',
  
  // API calls
  API_CALL: 'api_call',
  API_SUCCESS: 'api_success',
  API_ERROR: 'api_error',
  
  // User preferences
  THEME_CHANGE: 'theme_change',
  SETTINGS_UPDATE: 'settings_update',
  
  // Results and sharing
  RESULTS_VIEW: 'results_view',
  RESULTS_SAVE: 'results_save',
  RESULTS_SHARE: 'results_share',
  RESULTS_DOWNLOAD: 'results_download',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_ISSUE: 'performance_issue'
};

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  ENABLED: true,
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000, // 30 seconds
  MAX_QUEUE_SIZE: 100,
  STORAGE_KEY: 'analytics_data',
  SESSION_DURATION: 30 * 60 * 1000, // 30 minutes
  SAMPLING_RATE: 1.0 // Track 100% of events
};

/**
 * Session management
 */
let currentSession = null;
let eventQueue = [];
let flushTimer = null;

/**
 * Initialize analytics session
 */
export const initializeAnalytics = () => {
  if (!ANALYTICS_CONFIG.ENABLED) return;

  // Generate or retrieve session
  currentSession = generateSession();
  
  // Load queued events from storage
  loadQueuedEvents();
  
  // Set up automatic flushing
  setupAutoFlush();
  
  // Track page load
  trackEvent(EVENT_TYPES.PAGE_VIEW, {
    page: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });

  // Track page unload
  window.addEventListener('beforeunload', () => {
    trackEvent(EVENT_TYPES.PAGE_LEAVE, {
      page: window.location.pathname,
      sessionDuration: getSessionDuration()
    });
    flushEvents(true); // Synchronous flush on unload
  });
};

/**
 * Generate or retrieve session information
 * @returns {Object} Session object
 */
const generateSession = () => {
  const existingSession = getStorageItem('analytics_session');
  const now = Date.now();

  // Check if existing session is still valid
  if (existingSession && (now - existingSession.startTime) < ANALYTICS_CONFIG.SESSION_DURATION) {
    existingSession.lastActivity = now;
    setStorageItem('analytics_session', existingSession);
    return existingSession;
  }

  // Create new session
  const newSession = {
    id: generateSessionId(),
    startTime: now,
    lastActivity: now,
    userAgent: navigator.userAgent,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    appVersion: APP_INFO.VERSION
  };

  setStorageItem('analytics_session', newSession);
  return newSession;
};

/**
 * Generate unique session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Get current session duration in milliseconds
 * @returns {number} Session duration
 */
const getSessionDuration = () => {
  if (!currentSession) return 0;
  return Date.now() - currentSession.startTime;
};

/**
 * Track an analytics event
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @param {Object} options - Tracking options
 */
export const trackEvent = (eventType, eventData = {}, options = {}) => {
  if (!ANALYTICS_CONFIG.ENABLED) return;
  if (Math.random() > ANALYTICS_CONFIG.SAMPLING_RATE) return;

  const event = {
    id: generateEventId(),
    type: eventType,
    data: eventData,
    timestamp: new Date().toISOString(),
    sessionId: currentSession?.id,
    sessionDuration: getSessionDuration(),
    url: window.location.href,
    pathname: window.location.pathname,
    ...options
  };

  // Add to queue
  eventQueue.push(event);

  // Update session activity
  if (currentSession) {
    currentSession.lastActivity = Date.now();
    setStorageItem('analytics_session', currentSession);
  }

  // Flush if queue is full
  if (eventQueue.length >= ANALYTICS_CONFIG.MAX_QUEUE_SIZE) {
    flushEvents();
  }
};

/**
 * Generate unique event ID
 * @returns {string} Event ID
 */
const generateEventId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
};

/**
 * Track page view
 * @param {string} pagePath - Page path
 * @param {Object} additionalData - Additional page data
 */
export const trackPageView = (pagePath, additionalData = {}) => {
  trackEvent(EVENT_TYPES.PAGE_VIEW, {
    page: pagePath,
    title: document.title,
    referrer: document.referrer,
    loadTime: performance.now(),
    ...additionalData
  });
};

/**
 * Track user interaction
 * @param {string} element - Element identifier
 * @param {string} action - Action performed
 * @param {Object} additionalData - Additional interaction data
 */
export const trackInteraction = (element, action, additionalData = {}) => {
  trackEvent(EVENT_TYPES.BUTTON_CLICK, {
    element,
    action,
    ...additionalData
  });
};

/**
 * Track form submission
 * @param {string} formName - Form identifier
 * @param {Object} formData - Form data (sanitized)
 * @param {boolean} success - Whether submission was successful
 */
export const trackFormSubmission = (formName, formData = {}, success = true) => {
  const eventType = success ? EVENT_TYPES.FORM_SUBMIT : EVENT_TYPES.FORM_ERROR;
  
  // Sanitize form data (remove sensitive information)
  const sanitizedData = sanitizeFormData(formData);
  
  trackEvent(eventType, {
    form: formName,
    data: sanitizedData,
    success,
    timestamp: new Date().toISOString()
  });
};

/**
 * Sanitize form data for analytics
 * @param {Object} formData - Raw form data
 * @returns {Object} Sanitized form data
 */
const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  Object.keys(formData).forEach(key => {
    // Don't track sensitive fields
    const sensitiveFields = ['email', 'phone', 'password', 'token', 'key'];
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = typeof formData[key] === 'object' ? '[OBJECT]' : String(formData[key]).substring(0, 100);
    }
  });
  
  return sanitized;
};

/**
 * Track assessment-specific events
 * @param {string} stage - Assessment stage
 * @param {Object} data - Assessment data
 */
export const trackAssessment = (stage, data = {}) => {
  const eventMap = {
    start: EVENT_TYPES.ASSESSMENT_START,
    complete: EVENT_TYPES.ASSESSMENT_COMPLETE,
    abandon: EVENT_TYPES.ASSESSMENT_ABANDON
  };

  trackEvent(eventMap[stage] || EVENT_TYPES.ASSESSMENT_START, {
    stage,
    ...data
  });
};

/**
 * Track API call performance
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {number} duration - Request duration in ms
 * @param {boolean} success - Whether call was successful
 * @param {number} statusCode - HTTP status code
 */
export const trackAPICall = (endpoint, method, duration, success, statusCode = null) => {
  const eventType = success ? EVENT_TYPES.API_SUCCESS : EVENT_TYPES.API_ERROR;
  
  trackEvent(eventType, {
    endpoint,
    method,
    duration,
    success,
    statusCode,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track error occurrences
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {Object} additionalData - Additional error context
 */
export const trackError = (error, context = 'unknown', additionalData = {}) => {
  trackEvent(EVENT_TYPES.ERROR_OCCURRED, {
    message: error.message,
    stack: error.stack?.substring(0, 500), // Limit stack trace length
    name: error.name,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
};

/**
 * Track performance metrics
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {string} unit - Unit of measurement
 */
export const trackPerformance = (metric, value, unit = 'ms') => {
  trackEvent(EVENT_TYPES.PERFORMANCE_ISSUE, {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track file upload events
 * @param {string} fileName - Name of uploaded file
 * @param {number} fileSize - File size in bytes
 * @param {string} fileType - MIME type
 * @param {boolean} success - Upload success status
 */
export const trackFileUpload = (fileName, fileSize, fileType, success = true) => {
  const eventType = success ? EVENT_TYPES.FILE_UPLOAD : EVENT_TYPES.FILE_UPLOAD_ERROR;
  
  trackEvent(eventType, {
    fileName: fileName.substring(0, 50), // Limit filename length
    fileSize,
    fileType,
    success,
    timestamp: new Date().toISOString()
  });
};

/**
 * Set up automatic event flushing
 */
const setupAutoFlush = () => {
  if (flushTimer) clearInterval(flushTimer);
  
  flushTimer = setInterval(() => {
    if (eventQueue.length > 0) {
      flushEvents();
    }
  }, ANALYTICS_CONFIG.FLUSH_INTERVAL);
};

/**
 * Load queued events from storage
 */
const loadQueuedEvents = () => {
  const queuedEvents = getStorageItem(ANALYTICS_CONFIG.STORAGE_KEY, []);
  eventQueue = Array.isArray(queuedEvents) ? queuedEvents : [];
};

/**
 * Save queued events to storage
 */
const saveQueuedEvents = () => {
  setStorageItem(ANALYTICS_CONFIG.STORAGE_KEY, eventQueue.slice(0, ANALYTICS_CONFIG.MAX_QUEUE_SIZE));
};

/**
 * Flush events to analytics endpoint or storage
 * @param {boolean} sync - Whether to flush synchronously
 */
export const flushEvents = async (sync = false) => {
  if (eventQueue.length === 0) return;

  const eventsToFlush = eventQueue.splice(0, ANALYTICS_CONFIG.BATCH_SIZE);
  
  try {
    // In a real implementation, this would send to an analytics service
    // For now, we'll just log to console in development
    if (isDevelopment()) {
      console.groupCollapsed('Analytics Events');
      eventsToFlush.forEach(event => {
        console.log(`[${event.type}]`, event);
      });
      console.groupEnd();
    }
    
    // Save remaining events
    saveQueuedEvents();
    
    // In production, you would send to your analytics service:
    // await sendToAnalyticsService(eventsToFlush);
    
  } catch (error) {
    console.error('Failed to flush analytics events:', error);
    
    // Put events back in queue on failure
    eventQueue.unshift(...eventsToFlush);
    saveQueuedEvents();
  }
};

/**
 * Get analytics summary
 * @returns {Object} Analytics summary
 */
export const getAnalyticsSummary = () => {
  const session = getStorageItem('analytics_session');
  const queuedEvents = getStorageItem(ANALYTICS_CONFIG.STORAGE_KEY, []);
  
  return {
    session: session ? {
      id: session.id,
      duration: Date.now() - session.startTime,
      lastActivity: session.lastActivity
    } : null,
    queuedEventsCount: queuedEvents.length,
    currentQueueSize: eventQueue.length,
    isEnabled: ANALYTICS_CONFIG.ENABLED
  };
};

/**
 * Clear all analytics data
 */
export const clearAnalyticsData = () => {
  eventQueue = [];
  setStorageItem(ANALYTICS_CONFIG.STORAGE_KEY, []);
  setStorageItem('analytics_session', null);
  currentSession = null;
  
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
};

/**
 * Enable or disable analytics
 * @param {boolean} enabled - Whether to enable analytics
 */
export const setAnalyticsEnabled = (enabled) => {
  ANALYTICS_CONFIG.ENABLED = enabled;
  
  if (enabled && !flushTimer) {
    setupAutoFlush();
  } else if (!enabled && flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
};

/**
 * Create custom event tracker for specific components
 * @param {string} componentName - Name of the component
 * @returns {Object} Component-specific tracking functions
 */
export const createComponentTracker = (componentName) => {
  return {
    trackMount: (props = {}) => {
      trackEvent('component_mount', {
        component: componentName,
        props: sanitizeFormData(props)
      });
    },
    
    trackUnmount: () => {
      trackEvent('component_unmount', {
        component: componentName
      });
    },
    
    trackInteraction: (action, data = {}) => {
      trackInteraction(`${componentName}.${action}`, action, data);
    },
    
    trackError: (error, context = '') => {
      trackError(error, `${componentName}.${context}`);
    }
  };
};

/**
 * Track custom business metrics
 * @param {string} metric - Metric name
 * @param {number|string} value - Metric value
 * @param {Object} metadata - Additional metric metadata
 */
export const trackBusinessMetric = (metric, value, metadata = {}) => {
  trackEvent('business_metric', {
    metric,
    value,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Auto-initialize analytics when module is loaded
if (typeof window !== 'undefined') {
  // Add a small delay to ensure DOM is ready
  setTimeout(initializeAnalytics, 100);
}