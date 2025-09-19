/**
 * Application Constants
 * 
 * Centralizes all application constants, configuration values,
 * and enums used throughout the Drop2Smart application.
 */

/**
 * Application metadata
 */
export const APP_INFO = {
  NAME: 'Drop2Smart',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered rainwater harvesting assessment platform',
  DEVELOPER: 'Drop2Smart Team',
  CONTACT_EMAIL: 'contact@drop2smart.com',
  WEBSITE: 'https://drop2smart.com',
  GITHUB: 'https://github.com/drop2smart/app'
};

/**
 * Roof material types and their properties
 */
export const ROOF_MATERIALS = {
  CONCRETE: {
    id: 'concrete',
    name: 'Concrete',
    runoffCoefficient: 0.95,
    description: 'Reinforced concrete or flat concrete roof',
    efficiency: 'Excellent',
    durability: 'High',
    cost: 'Medium'
  },
  TILES: {
    id: 'tiles',
    name: 'Clay Tiles',
    runoffCoefficient: 0.85,
    description: 'Traditional clay or ceramic tiles',
    efficiency: 'Good',
    durability: 'High',
    cost: 'Medium'
  },
  METAL: {
    id: 'metal',
    name: 'Metal Sheet',
    runoffCoefficient: 0.90,
    description: 'Galvanized iron or aluminum sheets',
    efficiency: 'Very Good',
    durability: 'Medium',
    cost: 'Low'
  },
  ASPHALT: {
    id: 'asphalt',
    name: 'Asphalt Shingles',
    runoffCoefficient: 0.85,
    description: 'Asphalt-based roofing shingles',
    efficiency: 'Good',
    durability: 'Medium',
    cost: 'Low'
  },
  OTHER: {
    id: 'other',
    name: 'Other Material',
    runoffCoefficient: 0.80,
    description: 'Other roofing materials',
    efficiency: 'Fair',
    durability: 'Variable',
    cost: 'Variable'
  }
};

/**
 * Roof slope categories
 */
export const ROOF_SLOPES = {
  FLAT: {
    id: 'flat',
    name: 'Flat Roof',
    range: '0° - 5°',
    minDegrees: 0,
    maxDegrees: 5,
    efficiency: 0.85,
    description: 'Nearly flat or low-slope roof'
  },
  GENTLE: {
    id: 'gentle',
    name: 'Gentle Slope',
    range: '6° - 15°',
    minDegrees: 6,
    maxDegrees: 15,
    efficiency: 0.90,
    description: 'Gentle sloping roof'
  },
  MODERATE: {
    id: 'moderate',
    name: 'Moderate Slope',
    range: '16° - 30°',
    minDegrees: 16,
    maxDegrees: 30,
    efficiency: 0.95,
    description: 'Moderate sloping roof'
  },
  STEEP: {
    id: 'steep',
    name: 'Steep Slope',
    range: '31° - 45°',
    minDegrees: 31,
    maxDegrees: 45,
    efficiency: 0.90,
    description: 'Steep sloping roof'
  },
  VERY_STEEP: {
    id: 'very_steep',
    name: 'Very Steep',
    range: '> 45°',
    minDegrees: 46,
    maxDegrees: 90,
    efficiency: 0.85,
    description: 'Very steep roof (may reduce efficiency)'
  }
};

/**
 * Efficiency score ranges and their meanings
 */
export const EFFICIENCY_LEVELS = {
  EXCELLENT: {
    id: 'excellent',
    name: 'Excellent',
    minScore: 90,
    maxScore: 100,
    color: '#10b981', // green-500
    description: 'Optimal conditions for rainwater harvesting',
    recommendations: ['Proceed with installation', 'Consider premium filtration']
  },
  GOOD: {
    id: 'good',
    name: 'Good',
    minScore: 75,
    maxScore: 89,
    color: '#3b82f6', // blue-500
    description: 'Very suitable for rainwater harvesting',
    recommendations: ['Good for installation', 'Standard filtration adequate']
  },
  FAIR: {
    id: 'fair',
    name: 'Fair',
    minScore: 60,
    maxScore: 74,
    color: '#f59e0b', // amber-500
    description: 'Suitable with some considerations',
    recommendations: ['Consider roof improvements', 'Ensure proper maintenance']
  },
  POOR: {
    id: 'poor',
    name: 'Poor',
    minScore: 40,
    maxScore: 59,
    color: '#f97316', // orange-500
    description: 'Limited suitability',
    recommendations: ['Roof modifications needed', 'Consider alternatives']
  },
  VERY_POOR: {
    id: 'very_poor',
    name: 'Very Poor',
    minScore: 0,
    maxScore: 39,
    color: '#ef4444', // red-500
    description: 'Not recommended without major changes',
    recommendations: ['Major roof changes required', 'Seek professional consultation']
  }
};

/**
 * Compliance score ranges
 */
export const COMPLIANCE_LEVELS = {
  FULLY_COMPLIANT: {
    id: 'fully_compliant',
    name: 'Fully Compliant',
    minScore: 90,
    maxScore: 100,
    color: '#10b981',
    description: 'Meets all regulatory requirements'
  },
  MOSTLY_COMPLIANT: {
    id: 'mostly_compliant',
    name: 'Mostly Compliant',
    minScore: 75,
    maxScore: 89,
    color: '#3b82f6',
    description: 'Meets most regulatory requirements'
  },
  PARTIALLY_COMPLIANT: {
    id: 'partially_compliant',
    name: 'Partially Compliant',
    minScore: 60,
    maxScore: 74,
    color: '#f59e0b',
    description: 'Some regulatory requirements not met'
  },
  NON_COMPLIANT: {
    id: 'non_compliant',
    name: 'Non-Compliant',
    minScore: 0,
    maxScore: 59,
    color: '#ef4444',
    description: 'Does not meet regulatory requirements'
  }
};

/**
 * System component types and costs
 */
export const SYSTEM_COMPONENTS = {
  TANK: {
    id: 'tank',
    name: 'Storage Tank',
    costPerLiter: 2.5,
    description: 'Water storage tank with capacity',
    materials: ['Plastic', 'Concrete', 'Fiberglass'],
    lifespan: '15-25 years'
  },
  FILTRATION: {
    id: 'filtration',
    name: 'Filtration System',
    baseCost: 25000,
    description: 'Multi-stage water filtration',
    components: ['Pre-filter', 'Sand filter', 'Carbon filter'],
    lifespan: '10-15 years'
  },
  RECHARGE: {
    id: 'recharge',
    name: 'Recharge Structure',
    baseCost: 15000,
    description: 'Groundwater recharge system',
    components: ['Recharge pit', 'Filter media', 'Distribution system'],
    lifespan: '20-30 years'
  },
  DISTRIBUTION: {
    id: 'distribution',
    name: 'Distribution System',
    costPerSqFt: 5,
    description: 'Piping and pump system',
    components: ['Pipes', 'Pump', 'Valves', 'Controls'],
    lifespan: '15-20 years'
  }
};

/**
 * Indian cities with rainfall data
 */
export const INDIAN_CITIES = {
  MUMBAI: { name: 'Mumbai', state: 'Maharashtra', avgRainfall: 2400, lat: 19.0760, lon: 72.8777 },
  DELHI: { name: 'Delhi', state: 'Delhi', avgRainfall: 800, lat: 28.7041, lon: 77.1025 },
  BANGALORE: { name: 'Bangalore', state: 'Karnataka', avgRainfall: 1000, lat: 12.9716, lon: 77.5946 },
  HYDERABAD: { name: 'Hyderabad', state: 'Telangana', avgRainfall: 800, lat: 17.3850, lon: 78.4867 },
  CHENNAI: { name: 'Chennai', state: 'Tamil Nadu', avgRainfall: 1200, lat: 13.0827, lon: 80.2707 },
  KOLKATA: { name: 'Kolkata', state: 'West Bengal', avgRainfall: 1400, lat: 22.5726, lon: 88.3639 },
  PUNE: { name: 'Pune', state: 'Maharashtra', avgRainfall: 600, lat: 18.5204, lon: 73.8567 },
  AHMEDABAD: { name: 'Ahmedabad', state: 'Gujarat', avgRainfall: 800, lat: 23.0225, lon: 72.5714 },
  JAIPUR: { name: 'Jaipur', state: 'Rajasthan', avgRainfall: 650, lat: 26.9124, lon: 75.7873 },
  SURAT: { name: 'Surat', state: 'Gujarat', avgRainfall: 1200, lat: 21.1702, lon: 72.8311 }
};

/**
 * Water cost estimates by city/region
 */
export const WATER_COSTS = {
  MUMBAI: { costPerLiter: 0.8, currency: 'INR' },
  DELHI: { costPerLiter: 0.4, currency: 'INR' },
  BANGALORE: { costPerLiter: 0.6, currency: 'INR' },
  HYDERABAD: { costPerLiter: 0.5, currency: 'INR' },
  CHENNAI: { costPerLiter: 0.7, currency: 'INR' },
  KOLKATA: { costPerLiter: 0.3, currency: 'INR' },
  PUNE: { costPerLiter: 0.5, currency: 'INR' },
  AHMEDABAD: { costPerLiter: 0.4, currency: 'INR' },
  DEFAULT: { costPerLiter: 0.5, currency: 'INR' }
};

/**
 * Environmental impact constants
 */
export const ENVIRONMENTAL_IMPACT = {
  CO2_PER_LITER: 0.002, // kg CO2 saved per liter of rainwater harvested
  ENERGY_SAVED_PER_LITER: 0.003, // kWh saved per liter
  WATER_TABLE_IMPACT: 0.1, // Percentage improvement per 1000L recharged
  POLLUTION_REDUCTION: 0.05 // Percentage reduction in runoff pollution
};

/**
 * Form validation constants
 */
export const VALIDATION_LIMITS = {
  ROOF_AREA: {
    min: 100,
    max: 50000,
    unit: 'sq ft'
  },
  ROOF_SLOPE: {
    min: 0,
    max: 90,
    unit: 'degrees'
  },
  BUILDING_HEIGHT: {
    min: 8,
    max: 1000,
    unit: 'feet'
  },
  ANNUAL_RAINFALL: {
    min: 0,
    max: 5000,
    unit: 'mm'
  },
  LOCATION: {
    minLength: 5,
    maxLength: 200
  },
  IMAGE_FILE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    minSize: 1024, // 1KB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  }
};

/**
 * UI theme colors
 */
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  SECONDARY: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main secondary
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

/**
 * Storage limits and quotas
 */
export const STORAGE_LIMITS = {
  MAX_HISTORY_ITEMS: 10,
  MAX_DRAFT_AGE_HOURS: 24,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_TOTAL_STORAGE_MB: 50
};

/**
 * API configuration constants
 */
export const API_CONSTANTS = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_DELAY: 2000,
  MAX_BATCH_SIZE: 5
};

/**
 * File type mappings
 */
export const FILE_TYPES = {
  IMAGES: {
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    PNG: 'image/png',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml'
  },
  DOCUMENTS: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
};

/**
 * Error codes used throughout the application
 */
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  
  // API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Storage errors
  STORAGE_FULL: 'STORAGE_FULL',
  STORAGE_UNAVAILABLE: 'STORAGE_UNAVAILABLE',
  
  // Location errors
  GEOLOCATION_DENIED: 'GEOLOCATION_DENIED',
  GEOLOCATION_UNAVAILABLE: 'GEOLOCATION_UNAVAILABLE',
  GEOCODING_FAILED: 'GEOCODING_FAILED',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  RENDERING_ERROR: 'RENDERING_ERROR'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  ASSESSMENT_COMPLETED: 'Assessment completed successfully!',
  DATA_SAVED: 'Data saved successfully!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  SETTINGS_UPDATED: 'Settings updated successfully!',
  DRAFT_SAVED: 'Draft saved automatically!',
  RESULTS_SAVED: 'Results saved to history!'
};

/**
 * Units and conversions
 */
export const UNITS = {
  AREA: {
    SQ_FT: { name: 'Square Feet', symbol: 'sq ft', toSqM: 0.092903 },
    SQ_M: { name: 'Square Meters', symbol: 'sq m', toSqFt: 10.7639 }
  },
  VOLUME: {
    LITERS: { name: 'Liters', symbol: 'L', toGallons: 0.264172 },
    GALLONS: { name: 'Gallons', symbol: 'gal', toLiters: 3.78541 },
    KILOLITERS: { name: 'Kiloliters', symbol: 'KL', toLiters: 1000 }
  },
  LENGTH: {
    FEET: { name: 'Feet', symbol: 'ft', toMeters: 0.3048 },
    METERS: { name: 'Meters', symbol: 'm', toFeet: 3.28084 }
  },
  RAINFALL: {
    MM: { name: 'Millimeters', symbol: 'mm', toInches: 0.0393701 },
    INCHES: { name: 'Inches', symbol: 'in', toMM: 25.4 }
  }
};

/**
 * Regular expressions for validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_INDIAN: /^[6-9]\d{9}$/,
  PINCODE_INDIAN: /^[1-9][0-9]{5}$/,
  NUMERIC: /^\d*\.?\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  COORDINATES: /^-?\d{1,3}\.\d+$/
};

/**
 * Default values for form fields
 */
export const DEFAULT_VALUES = {
  ROOF_AREA: '',
  ROOF_SLOPE: '15',
  ROOF_MATERIAL: 'concrete',
  BUILDING_HEIGHT: '',
  LOCATION: '',
  ANNUAL_RAINFALL: '',
  WATER_COST_PER_LITER: 0.5,
  CURRENCY: 'INR',
  UNITS: 'metric',
  LANGUAGE: 'en'
};