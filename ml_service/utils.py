"""
Utility functions for the ML service
"""

import logging
import aiohttp
import asyncio
from typing import Dict, Any, Tuple
import sys
import os

def setup_logging() -> logging.Logger:
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('ml_service.log') if os.path.exists('.') else logging.StreamHandler()
        ]
    )
    
    # Reduce noise from other libraries
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('aiohttp').setLevel(logging.WARNING)
    
    return logging.getLogger(__name__)

async def get_soil_properties(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch soil properties from SoilGrids API
    """
    soilgrids_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    point = {"lat": latitude, "lon": longitude}
    
    # Properties to fetch
    properties_to_query = [
        {"property": "sand", "depth": "0-5cm", "value": "mean"},
        {"property": "silt", "depth": "0-5cm", "value": "mean"},
        {"property": "clay", "depth": "0-5cm", "value": "mean"},
        {"property": "ocd", "depth": "0-5cm", "value": "mean"},
    ]
    
    soil_results = {}
    
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
            for prop in properties_to_query:
                params = {**point, **prop}
                
                async with session.get(soilgrids_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        try:
                            mean_value = data['properties']["layers"][0]["depths"][0]["values"]["mean"]
                            if mean_value is not None:
                                soil_results[prop['property']] = mean_value
                            else:
                                soil_results[prop['property']] = get_default_value(prop['property'])
                        except (KeyError, IndexError):
                            soil_results[prop['property']] = get_default_value(prop['property'])
                    else:
                        soil_results[prop['property']] = get_default_value(prop['property'])
    
    except Exception as e:
        # Use default values if API fails
        soil_results = {
            'sand': 400,
            'silt': 350, 
            'clay': 250,
            'ocd': 15
        }
    
    return soil_results

def get_default_value(property_name: str) -> int:
    """Get default values for soil properties"""
    defaults = {
        'sand': 400,  # 40%
        'silt': 350,  # 35%
        'clay': 250,  # 25%
        'ocd': 15     # Default organic carbon density
    }
    return defaults.get(property_name, 0)

def classify_soil_texture(sand_pct: float, silt_pct: float, clay_pct: float) -> Tuple[str, int]:
    """
    Classify soil texture based on sand, silt, and clay percentages
    Using USDA soil texture triangle classification
    """
    # Texture encoding mapping
    texture_encoding = {
        "SANDY LOAMY": 6,
        "SANDY CLAY": 5,
        "LOAM": 2,
        "CLAY LOAM": 1,
        "CLAY": 0,
        "SILTY LOAM": 9,
        "LOAMY SAND": 3,
        "SILTY CLAY LOAM": 8,
        "SILTY CLAY": 7,
        "SAND": 4,
        "SANDY LOAM": 10,
        "SANDY CLAY LOAM": 11,
        "Unknown": -1
    }
    
    # Classification rules based on USDA standards
    if silt_pct + clay_pct < 20:
        texture_name = "SAND"
    elif sand_pct > 52 and silt_pct < 50 and clay_pct < 20:
        texture_name = "LOAMY SAND"
    elif sand_pct > 52 and (silt_pct >= 50 or (silt_pct < 50 and clay_pct >= 20)):
        texture_name = "SANDY LOAM"
    elif silt_pct >= 80 and clay_pct < 12:
        texture_name = "SILT"
    elif silt_pct >= 50 and (clay_pct >= 12 and clay_pct < 27):
        texture_name = "SILT LOAM"
    elif clay_pct >= 27 and sand_pct <= 45:
        texture_name = "CLAY LOAM"
    elif clay_pct >= 20 and clay_pct < 27 and silt_pct >= 28 and silt_pct < 50 and sand_pct <= 52:
        texture_name = "LOAM"
    elif clay_pct >= 35 and sand_pct > 45:
        texture_name = "SANDY CLAY"
    elif clay_pct >= 35 and silt_pct > 40:
        texture_name = "SILTY CLAY"
    elif clay_pct >= 27 and clay_pct < 40 and sand_pct > 45:
        texture_name = "SANDY CLAY LOAM"
    elif clay_pct >= 27 and clay_pct < 40 and silt_pct > 28 and sand_pct <= 45:
        texture_name = "SILTY CLAY LOAM"
    else:
        texture_name = "Unknown"
    
    encoded_value = texture_encoding.get(texture_name, texture_encoding["Unknown"])
    return texture_name, encoded_value

def validate_coordinates(latitude: float, longitude: float) -> bool:
    """Validate latitude and longitude coordinates"""
    return -90 <= latitude <= 90 and -180 <= longitude <= 180

def estimate_ksat_from_texture(sand_pct: float, silt_pct: float, clay_pct: float) -> float:
    """
    Estimate Ksat value based on soil texture (fallback method)
    """
    # Rough estimation based on soil texture
    # Sandy soils have higher Ksat, clayey soils have lower Ksat
    if sand_pct > 70:
        return 150.0  # High permeability
    elif sand_pct > 50:
        return 80.0   # Moderate-high permeability
    elif clay_pct > 50:
        return 5.0    # Low permeability
    elif clay_pct > 30:
        return 20.0   # Moderate-low permeability
    else:
        return 50.0   # Medium permeability

def calculate_confidence_score(ksat: float, soil_data: Dict[str, float]) -> float:
    """
    Calculate confidence score for prediction
    """
    # Basic confidence calculation
    # Higher confidence for values in typical ranges
    base_confidence = 0.8
    
    # Adjust based on Ksat value (typical range 1-300)
    if 10 <= ksat <= 150:
        range_adjustment = 0.1
    elif 5 <= ksat <= 200:
        range_adjustment = 0.05
    else:
        range_adjustment = -0.1
    
    # Adjust based on soil composition consistency
    total = soil_data.get('sand', 0) + soil_data.get('silt', 0) + soil_data.get('clay', 0)
    composition_adjustment = 0.05 if 95 <= total <= 105 else -0.05
    
    confidence = base_confidence + range_adjustment + composition_adjustment
    return max(0.5, min(0.95, confidence))

def format_soil_analysis(ksat: float, texture_class: str) -> Dict[str, Any]:
    """
    Format soil analysis results
    """
    # Infiltration categories based on Ksat value
    if ksat > 100:
        infiltration_rate = "High"
        suitability = "Excellent for rainwater infiltration"
        recommendation = "Ideal for recharge pits and infiltration basins"
    elif ksat > 50:
        infiltration_rate = "Moderate"
        suitability = "Good for rainwater infiltration" 
        recommendation = "Suitable for most infiltration structures"
    elif ksat > 20:
        infiltration_rate = "Low"
        suitability = "Fair for rainwater infiltration"
        recommendation = "May require enhanced infiltration methods"
    else:
        infiltration_rate = "Very Low"
        suitability = "Poor for rainwater infiltration"
        recommendation = "Consider alternative drainage solutions"
    
    return {
        "infiltration_rate": infiltration_rate,
        "suitability": suitability,
        "recommendation": recommendation,
        "texture_class": texture_class,
        "ksat_category": get_ksat_category(ksat)
    }

def get_ksat_category(ksat: float) -> str:
    """Get Ksat category based on value"""
    if ksat < 5:
        return "Very Slow"
    elif ksat < 20:
        return "Slow"
    elif ksat < 60:
        return "Moderate"
    elif ksat < 150:
        return "Fast"
    else:
        return "Very Fast"

def convert_soilgrids_units(value: float, property_name: str) -> float:
    """
    Convert SoilGrids units to standard units
    """
    # SoilGrids uses different scales for different properties
    if property_name in ['sand', 'silt', 'clay']:
        # Convert from 0-1000 scale to percentage
        return value / 10.0
    elif property_name == 'ocd':
        # Organic carbon density conversion
        return value * 0.001
    else:
        return value

async def health_check_external_apis() -> Dict[str, Any]:
    """
    Check health of external APIs
    """
    status = {
        "soilgrids": {"status": "unknown", "response_time": None}
    }
    
    try:
        start_time = asyncio.get_event_loop().time()
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            # Test SoilGrids API
            test_params = {
                "lat": 28.7041,
                "lon": 77.1025, 
                "property": "sand",
                "depth": "0-5cm",
                "value": "mean"
            }
            
            async with session.get(
                "https://rest.isric.org/soilgrids/v2.0/properties/query", 
                params=test_params
            ) as response:
                end_time = asyncio.get_event_loop().time()
                response_time = (end_time - start_time) * 1000  # Convert to ms
                
                if response.status == 200:
                    status["soilgrids"] = {
                        "status": "healthy",
                        "response_time": f"{response_time:.2f}ms"
                    }
                else:
                    status["soilgrids"] = {
                        "status": "error",
                        "response_time": f"{response_time:.2f}ms",
                        "error": f"HTTP {response.status}"
                    }
    
    except Exception as e:
        status["soilgrids"] = {
            "status": "error",
            "error": str(e)
        }
    
    return status