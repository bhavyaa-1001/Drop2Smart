/**
 * Form Validation Utilities
 * 
 * Contains validation functions for the assessment form fields
 * and general form validation helpers.
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the value is valid
 * @property {string} error - Error message if invalid
 */

/**
 * Validate roof area input
 * @param {string|number} value - Roof area value
 * @returns {ValidationResult} Validation result
 */
export const validateRoofArea = (value) => {
  const numValue = Number(value);
  
  if (!value || value === '') {
    return { isValid: false, error: 'Roof area is required' };
  }
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Roof area must be a number' };
  }
  
  if (numValue <= 0) {
    return { isValid: false, error: 'Roof area must be greater than 0' };
  }
  
  if (numValue < 100) {
    return { isValid: false, error: 'Roof area must be at least 100 sq ft for effective harvesting' };
  }
  
  if (numValue > 50000) {
    return { isValid: false, error: 'Roof area seems unusually large. Please verify the measurement' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate roof slope input
 * @param {string|number} value - Roof slope value
 * @returns {ValidationResult} Validation result
 */
export const validateRoofSlope = (value) => {
  const numValue = Number(value);
  
  if (!value || value === '') {
    return { isValid: false, error: 'Roof slope is required' };
  }
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Roof slope must be a number' };
  }
  
  if (numValue < 0) {
    return { isValid: false, error: 'Roof slope cannot be negative' };
  }
  
  if (numValue > 90) {
    return { isValid: false, error: 'Roof slope cannot exceed 90 degrees' };
  }
  
  if (numValue > 45) {
    return { 
      isValid: true, 
      error: '', 
      warning: 'Very steep roof may have reduced water collection efficiency' 
    };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate roof material selection
 * @param {string} value - Selected roof material
 * @returns {ValidationResult} Validation result
 */
export const validateRoofMaterial = (value) => {
  const validMaterials = ['concrete', 'tiles', 'metal', 'asphalt', 'other'];
  
  if (!value || value === '') {
    return { isValid: false, error: 'Roof material selection is required' };
  }
  
  if (!validMaterials.includes(value)) {
    return { isValid: false, error: 'Please select a valid roof material' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate building height input
 * @param {string|number} value - Building height value
 * @returns {ValidationResult} Validation result
 */
export const validateBuildingHeight = (value) => {
  const numValue = Number(value);
  
  if (!value || value === '') {
    return { isValid: false, error: 'Building height is required' };
  }
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Building height must be a number' };
  }
  
  if (numValue <= 0) {
    return { isValid: false, error: 'Building height must be greater than 0' };
  }
  
  if (numValue < 8) {
    return { isValid: false, error: 'Building height must be at least 8 feet' };
  }
  
  if (numValue > 1000) {
    return { isValid: false, error: 'Building height seems unusually tall. Please verify the measurement' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate location/address input
 * @param {string} value - Location string
 * @returns {ValidationResult} Validation result
 */
export const validateLocation = (value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Location is required' };
  }
  
  if (value.trim().length < 5) {
    return { isValid: false, error: 'Please provide a more detailed location' };
  }
  
  if (value.length > 200) {
    return { isValid: false, error: 'Location description is too long' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate annual rainfall input
 * @param {string|number} value - Annual rainfall value
 * @returns {ValidationResult} Validation result
 */
export const validateAnnualRainfall = (value) => {
  const numValue = Number(value);
  
  if (!value || value === '') {
    return { isValid: false, error: 'Annual rainfall is required' };
  }
  
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Annual rainfall must be a number' };
  }
  
  if (numValue <= 0) {
    return { isValid: false, error: 'Annual rainfall must be greater than 0' };
  }
  
  if (numValue < 200) {
    return { 
      isValid: true, 
      error: '', 
      warning: 'Very low rainfall may limit harvesting effectiveness' 
    };
  }
  
  if (numValue > 5000) {
    return { isValid: false, error: 'Annual rainfall seems unusually high. Please verify the amount' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate uploaded image file
 * @param {File} file - Uploaded file
 * @returns {ValidationResult} Validation result
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Please upload a rooftop image' };
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Please upload a valid image file (JPG, PNG, or WebP)' 
    };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Image file is too large. Please upload a file smaller than 10MB' 
    };
  }
  
  // Check minimum file size (to avoid empty/corrupted files)
  const minSize = 1024; // 1KB
  if (file.size < minSize) {
    return { 
      isValid: false, 
      error: 'Image file seems too small. Please upload a valid image' 
    };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate email address format
 * @param {string} email - Email address
 * @returns {ValidationResult} Validation result
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {ValidationResult} Validation result
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces, hyphens, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for Indian phone number format (10 digits)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid 10-digit phone number' 
    };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validate entire form data
 * @param {Object} formData - Complete form data object
 * @param {File|null} imageFile - Uploaded image file
 * @returns {Object} Validation results for all fields
 */
export const validateFormData = (formData, imageFile) => {
  const results = {
    roofArea: validateRoofArea(formData.roofArea),
    roofSlope: validateRoofSlope(formData.roofSlope),
    roofMaterial: validateRoofMaterial(formData.roofMaterial),
    buildingHeight: validateBuildingHeight(formData.buildingHeight),
    location: validateLocation(formData.location),
    annualRainfall: validateAnnualRainfall(formData.annualRainfall),
    image: validateImageFile(imageFile)
  };
  
  // Add overall form validity
  results.isFormValid = Object.values(results).every(result => 
    typeof result === 'object' && result.isValid
  );
  
  // Collect all errors
  results.errors = Object.entries(results)
    .filter(([key, result]) => 
      key !== 'isFormValid' && 
      typeof result === 'object' && 
      !result.isValid
    )
    .map(([key, result]) => ({ field: key, message: result.error }));
  
  // Collect all warnings
  results.warnings = Object.entries(results)
    .filter(([key, result]) => 
      key !== 'isFormValid' && 
      typeof result === 'object' && 
      result.warning
    )
    .map(([key, result]) => ({ field: key, message: result.warning }));
  
  return results;
};

/**
 * Get field-specific validation function
 * @param {string} fieldName - Name of the field to validate
 * @returns {Function} Validation function for the field
 */
export const getValidationFunction = (fieldName) => {
  const validationMap = {
    roofArea: validateRoofArea,
    roofSlope: validateRoofSlope,
    roofMaterial: validateRoofMaterial,
    buildingHeight: validateBuildingHeight,
    location: validateLocation,
    annualRainfall: validateAnnualRainfall,
    email: validateEmail,
    phone: validatePhone,
    image: validateImageFile
  };
  
  return validationMap[fieldName] || (() => ({ isValid: true, error: '' }));
};

/**
 * Create a validation hook for React components
 * @param {Object} initialData - Initial form data
 * @returns {Object} Validation state and functions
 */
export const createValidationState = (initialData = {}) => {
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  
  const validateField = (fieldName, value, file = null) => {
    const validator = getValidationFunction(fieldName);
    const result = fieldName === 'image' ? validator(file) : validator(value);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? '' : result.error
    }));
    
    setWarnings(prev => ({
      ...prev,
      [fieldName]: result.warning || ''
    }));
    
    return result;
  };
  
  const validateAll = (formData, imageFile) => {
    const results = validateFormData(formData, imageFile);
    
    const newErrors = {};
    const newWarnings = {};
    
    results.errors.forEach(({ field, message }) => {
      newErrors[field] = message;
    });
    
    results.warnings.forEach(({ field, message }) => {
      newWarnings[field] = message;
    });
    
    setErrors(newErrors);
    setWarnings(newWarnings);
    
    return results.isFormValid;
  };
  
  const clearValidation = (fieldName = null) => {
    if (fieldName) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
      setWarnings(prev => ({ ...prev, [fieldName]: '' }));
    } else {
      setErrors({});
      setWarnings({});
    }
  };
  
  return {
    errors,
    warnings,
    validateField,
    validateAll,
    clearValidation,
    hasErrors: Object.values(errors).some(error => error !== ''),
    hasWarnings: Object.values(warnings).some(warning => warning !== '')
  };
};