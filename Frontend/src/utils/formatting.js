/**
 * Formatting Utilities
 * 
 * Contains functions for formatting numbers, currency, dates, and other
 * display values used throughout the application.
 */

/**
 * Format number with Indian numbering system (lakhs, crores)
 * @param {number} num - Number to format
 * @param {boolean} useShort - Use short format (1.2L instead of 1,20,000)
 * @returns {string} Formatted number string
 */
export const formatIndianNumber = (num, useShort = false) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
  if (useShort) {
    if (num >= 10000000) { // 1 crore
      return (num / 10000000).toFixed(1) + 'Cr';
    }
    if (num >= 100000) { // 1 lakh
      return (num / 100000).toFixed(1) + 'L';
    }
    if (num >= 1000) { // 1 thousand
      return (num / 1000).toFixed(1) + 'K';
    }
  }
  
  // Indian number formatting with commas
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount to format
 * @param {boolean} useShort - Use short format (₹1.2L instead of ₹1,20,000)
 * @param {boolean} showDecimals - Show decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, useShort = false, showDecimals = false) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  
  const formatter = showDecimals ? 
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) :
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  
  if (useShort && amount >= 1000) {
    const shortNum = formatIndianNumber(amount, true);
    return '₹' + shortNum;
  }
  
  return formatter.format(amount);
};

/**
 * Format water volume with appropriate units
 * @param {number} liters - Volume in liters
 * @param {boolean} useShort - Use short format
 * @returns {string} Formatted volume string
 */
export const formatWaterVolume = (liters, useShort = false) => {
  if (typeof liters !== 'number' || isNaN(liters)) return '0L';
  
  // Convert to appropriate units
  if (liters >= 1000000) {
    const megaliters = liters / 1000000;
    return megaliters.toFixed(1) + (useShort ? 'ML' : ' Megaliters');
  }
  
  if (liters >= 1000) {
    const kiloliters = liters / 1000;
    return kiloliters.toFixed(1) + (useShort ? 'KL' : ' Kiloliters');
  }
  
  return formatIndianNumber(liters, useShort) + (useShort ? 'L' : ' Liters');
};

/**
 * Format area with appropriate units
 * @param {number} sqft - Area in square feet
 * @param {string} unit - Target unit ('sqft', 'sqm', 'auto')
 * @returns {string} Formatted area string
 */
export const formatArea = (sqft, unit = 'auto') => {
  if (typeof sqft !== 'number' || isNaN(sqft)) return '0 sq ft';
  
  switch (unit) {
    case 'sqm':
      const sqm = sqft * 0.092903;
      return sqm.toFixed(1) + ' sq m';
    
    case 'sqft':
      return formatIndianNumber(sqft) + ' sq ft';
    
    case 'auto':
    default:
      // Use sq m for larger areas, sq ft for smaller
      if (sqft > 10000) {
        const sqm = sqft * 0.092903;
        return sqm.toFixed(1) + ' sq m';
      }
      return formatIndianNumber(sqft) + ' sq ft';
  }
};

/**
 * Format percentage with specified decimal places
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 0) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return value.toFixed(decimals) + '%';
};

/**
 * Format CO2 reduction with appropriate units
 * @param {number} tonnes - CO2 reduction in tonnes
 * @returns {string} Formatted CO2 string
 */
export const formatCO2Reduction = (tonnes) => {
  if (typeof tonnes !== 'number' || isNaN(tonnes)) return '0 kg';
  
  if (tonnes >= 1) {
    return tonnes.toFixed(1) + ' tonnes';
  }
  
  const kg = tonnes * 1000;
  return kg.toFixed(0) + ' kg';
};

/**
 * Format time duration (e.g., ROI period)
 * @param {number} years - Duration in years
 * @param {boolean} showMonths - Show months for values less than 1 year
 * @returns {string} Formatted duration string
 */
export const formatDuration = (years, showMonths = true) => {
  if (typeof years !== 'number' || isNaN(years)) return '0 years';
  
  if (years === Infinity) return 'Never';
  
  if (years < 1 && showMonths) {
    const months = Math.round(years * 12);
    return months + (months === 1 ? ' month' : ' months');
  }
  
  if (years < 2) {
    return years.toFixed(1) + ' year';
  }
  
  return years.toFixed(1) + ' years';
};

/**
 * Format rainfall amount with units
 * @param {number} mm - Rainfall in millimeters
 * @param {boolean} showUnit - Show unit in output
 * @returns {string} Formatted rainfall string
 */
export const formatRainfall = (mm, showUnit = true) => {
  if (typeof mm !== 'number' || isNaN(mm)) return showUnit ? '0 mm' : '0';
  
  const formatted = formatIndianNumber(mm);
  return showUnit ? formatted + ' mm' : formatted;
};

/**
 * Format roof slope with units
 * @param {number} degrees - Slope in degrees
 * @returns {string} Formatted slope string
 */
export const formatSlope = (degrees) => {
  if (typeof degrees !== 'number' || isNaN(degrees)) return '0°';
  return degrees.toFixed(1) + '°';
};

/**
 * Format building height with units
 * @param {number} feet - Height in feet
 * @param {string} unit - Target unit ('ft', 'm', 'auto')
 * @returns {string} Formatted height string
 */
export const formatHeight = (feet, unit = 'ft') => {
  if (typeof feet !== 'number' || isNaN(feet)) return '0 ft';
  
  switch (unit) {
    case 'm':
      const meters = feet * 0.3048;
      return meters.toFixed(1) + ' m';
    
    case 'ft':
    default:
      return feet.toFixed(0) + ' ft';
  }
};

/**
 * Format efficiency score with color coding information
 * @param {number} score - Efficiency score (0-100)
 * @returns {Object} Formatted score with color information
 */
export const formatEfficiencyScore = (score) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return { value: '0%', color: 'gray', level: 'unknown' };
  }
  
  const percentage = formatPercentage(score);
  
  let color, level;
  if (score >= 90) {
    color = 'green';
    level = 'excellent';
  } else if (score >= 75) {
    color = 'blue';
    level = 'good';
  } else if (score >= 60) {
    color = 'yellow';
    level = 'fair';
  } else if (score >= 40) {
    color = 'orange';
    level = 'poor';
  } else {
    color = 'red';
    level = 'very poor';
  }
  
  return { value: percentage, color, level };
};

/**
 * Format compliance score with status
 * @param {number} score - Compliance score (0-100)
 * @returns {Object} Formatted compliance with status information
 */
export const formatComplianceScore = (score) => {
  if (typeof score !== 'number' || isNaN(score)) {
    return { value: '0%', status: 'unknown', color: 'gray' };
  }
  
  const percentage = formatPercentage(score);
  
  let status, color;
  if (score >= 90) {
    status = 'fully compliant';
    color = 'green';
  } else if (score >= 75) {
    status = 'mostly compliant';
    color = 'blue';
  } else if (score >= 60) {
    status = 'partially compliant';
    color = 'yellow';
  } else {
    status = 'non-compliant';
    color = 'red';
  }
  
  return { value: percentage, status, color };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || isNaN(bytes)) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return size.toFixed(1) + ' ' + units[unitIndex];
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    medium: { day: 'numeric', month: 'long', year: 'numeric' },
    long: { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
  };
  
  return dateObj.toLocaleDateString('en-IN', options[format] || options.medium);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format Indian mobile number (10 digits)
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  
  // Return as-is if not standard format
  return phone;
};

/**
 * Format material name for display
 * @param {string} material - Material code
 * @returns {string} Display-friendly material name
 */
export const formatMaterialName = (material) => {
  const materialNames = {
    concrete: 'Concrete',
    tiles: 'Clay Tiles',
    metal: 'Metal Sheet',
    asphalt: 'Asphalt Shingles',
    other: 'Other Material'
  };
  
  return materialNames[material] || material;
};

/**
 * Create summary text for assessment results
 * @param {Object} results - Assessment results object
 * @returns {string} Summary text
 */
export const createResultSummary = (results) => {
  if (!results) return '';
  
  const potential = formatWaterVolume(results.annualRainwaterPotential, true);
  const savings = formatCurrency(results.costSavings, true);
  const efficiency = formatPercentage(results.roofEfficiency);
  
  return `This rooftop can harvest ${potential} of rainwater annually, saving ${savings} in water costs with ${efficiency} efficiency.`;
};