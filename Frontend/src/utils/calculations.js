/**
 * Rainwater Harvesting Calculation Utilities
 * 
 * Contains functions for calculating rainwater potential, cost savings,
 * environmental impact, and system recommendations.
 */

// Standard runoff coefficients for different roof materials
export const RUNOFF_COEFFICIENTS = {
  concrete: 0.95,
  tiles: 0.85,
  metal: 0.90,
  asphalt: 0.85,
  other: 0.80
};

// Water efficiency factors based on roof slope
export const SLOPE_EFFICIENCY_FACTORS = {
  flat: 0.85,      // 0-5 degrees
  gentle: 0.90,    // 6-15 degrees  
  moderate: 0.95,  // 16-30 degrees
  steep: 0.90      // >30 degrees
};

/**
 * Calculate annual rainwater potential in liters
 * @param {number} roofArea - Roof area in square feet
 * @param {string} roofMaterial - Material type (concrete, tiles, metal, asphalt, other)
 * @param {number} roofSlope - Roof slope in degrees
 * @param {number} annualRainfall - Annual rainfall in mm
 * @returns {number} Annual rainwater potential in liters
 */
export const calculateRainwaterPotential = (roofArea, roofMaterial, roofSlope, annualRainfall) => {
  if (!roofArea || !roofMaterial || !annualRainfall) {
    throw new Error('Missing required parameters for rainwater calculation');
  }

  // Convert square feet to square meters
  const roofAreaM2 = roofArea * 0.092903;
  
  // Get runoff coefficient for material
  const runoffCoeff = RUNOFF_COEFFICIENTS[roofMaterial] || RUNOFF_COEFFICIENTS.other;
  
  // Get slope efficiency factor
  const slopeEfficiency = getSlopeEfficiency(roofSlope);
  
  // Formula: Area (m²) × Rainfall (mm) × Runoff Coefficient × Slope Efficiency
  // Result in liters (1 m² × 1 mm = 1 liter)
  const potentialLiters = roofAreaM2 * annualRainfall * runoffCoeff * slopeEfficiency;
  
  return Math.round(potentialLiters);
};

/**
 * Get slope efficiency factor based on roof slope
 * @param {number} slope - Roof slope in degrees
 * @returns {number} Efficiency factor
 */
export const getSlopeEfficiency = (slope) => {
  if (slope <= 5) return SLOPE_EFFICIENCY_FACTORS.flat;
  if (slope <= 15) return SLOPE_EFFICIENCY_FACTORS.gentle;
  if (slope <= 30) return SLOPE_EFFICIENCY_FACTORS.moderate;
  return SLOPE_EFFICIENCY_FACTORS.steep;
};

/**
 * Calculate monthly average rainwater collection
 * @param {number} annualPotential - Annual potential in liters
 * @returns {number} Monthly average in liters
 */
export const calculateMonthlyAverage = (annualPotential) => {
  return Math.round(annualPotential / 12);
};

/**
 * Calculate annual cost savings based on water collection
 * @param {number} annualPotential - Annual potential in liters
 * @param {number} waterCostPerLiter - Cost per liter (default: ₹0.5)
 * @returns {number} Annual cost savings in rupees
 */
export const calculateCostSavings = (annualPotential, waterCostPerLiter = 0.5) => {
  return Math.round(annualPotential * waterCostPerLiter);
};

/**
 * Calculate CO2 reduction based on water collection
 * @param {number} annualPotential - Annual potential in liters
 * @param {number} co2PerLiter - CO2 saved per liter (default: 0.002 kg)
 * @returns {number} Annual CO2 reduction in tonnes
 */
export const calculateCO2Reduction = (annualPotential, co2PerLiter = 0.002) => {
  const co2Kg = annualPotential * co2PerLiter;
  return Math.round((co2Kg / 1000) * 10) / 10; // Convert to tonnes, round to 1 decimal
};

/**
 * Calculate roof efficiency score based on multiple factors
 * @param {string} roofMaterial - Material type
 * @param {number} roofSlope - Roof slope in degrees
 * @param {number} roofArea - Roof area in square feet
 * @returns {number} Efficiency score (0-100)
 */
export const calculateRoofEfficiency = (roofMaterial, roofSlope, roofArea) => {
  let score = 60; // Base score
  
  // Material efficiency bonus
  const materialBonus = {
    concrete: 25,
    metal: 20,
    tiles: 15,
    asphalt: 10,
    other: 5
  };
  score += materialBonus[roofMaterial] || 0;
  
  // Slope efficiency bonus
  const slopeEfficiency = getSlopeEfficiency(roofSlope);
  score += Math.round((slopeEfficiency - 0.8) * 50); // Scale to 0-10 range
  
  // Area bonus (larger areas are more efficient)
  if (roofArea > 2000) score += 5;
  else if (roofArea > 1000) score += 3;
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate compliance score based on local regulations and best practices
 * @param {number} roofArea - Roof area in square feet
 * @param {number} annualRainfall - Annual rainfall in mm
 * @param {string} location - Building location
 * @returns {number} Compliance score (0-100)
 */
export const calculateComplianceScore = (roofArea, annualRainfall, location) => {
  let score = 70; // Base compliance score
  
  // Minimum area requirement compliance
  if (roofArea >= 1000) score += 15;
  else if (roofArea >= 500) score += 10;
  else score -= 10;
  
  // Rainfall adequacy
  if (annualRainfall >= 1000) score += 10;
  else if (annualRainfall >= 600) score += 5;
  else score -= 5;
  
  // Location-based regulations (simplified)
  if (location && location.toLowerCase().includes('bangalore')) score += 5;
  if (location && location.toLowerCase().includes('chennai')) score += 5;
  if (location && location.toLowerCase().includes('mumbai')) score += 3;
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate recommended storage tank capacity
 * @param {number} annualPotential - Annual potential in liters
 * @param {number} storageRatio - Storage ratio (default: 15% of annual potential)
 * @returns {number} Recommended tank capacity in liters
 */
export const calculateTankCapacity = (annualPotential, storageRatio = 0.15) => {
  return Math.round(annualPotential * storageRatio);
};

/**
 * Estimate system installation cost
 * @param {number} tankCapacity - Tank capacity in liters
 * @param {boolean} includeFiltration - Include filtration system
 * @param {boolean} includeRecharge - Include recharge structure
 * @returns {object} Cost breakdown
 */
export const estimateSystemCost = (tankCapacity, includeFiltration = true, includeRecharge = true) => {
  const costs = {
    tank: Math.round(tankCapacity * 2.5), // ₹2.5 per liter capacity
    filtration: includeFiltration ? 25000 : 0,
    recharge: includeRecharge ? 15000 : 0,
    installation: Math.round(tankCapacity * 0.5), // Installation cost
  };
  
  costs.total = costs.tank + costs.filtration + costs.recharge + costs.installation;
  
  return costs;
};

/**
 * Generate monthly collection estimates based on seasonal patterns
 * @param {number} annualPotential - Annual potential in liters
 * @param {string} location - Location for seasonal adjustment
 * @returns {Array} Monthly collection estimates
 */
export const generateMonthlyEstimates = (annualPotential, location = '') => {
  // Seasonal distribution factors (India-specific)
  const seasonalFactors = [
    0.05, // Jan
    0.04, // Feb
    0.06, // Mar
    0.03, // Apr
    0.02, // May
    0.11, // Jun (monsoon starts)
    0.15, // Jul (peak monsoon)
    0.16, // Aug (peak monsoon)
    0.10, // Sep (monsoon continues)
    0.08, // Oct
    0.05, // Nov
    0.06  // Dec
  ];
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return monthNames.map((month, index) => ({
    month,
    collection: Math.round(annualPotential * seasonalFactors[index]),
    usage: Math.round(annualPotential * seasonalFactors[index] * 0.9) // 90% usage efficiency
  }));
};

/**
 * Calculate return on investment period
 * @param {number} systemCost - Total system cost
 * @param {number} annualSavings - Annual cost savings
 * @returns {number} ROI period in years
 */
export const calculateROI = (systemCost, annualSavings) => {
  if (annualSavings <= 0) return Infinity;
  return Math.round((systemCost / annualSavings) * 10) / 10; // Round to 1 decimal
};