"""
Drop2Smart ML Service - FastAPI Application
Ksat Prediction Service using XGBoost Model and SoilGrids Data
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
import xgboost as xgb
import requests
import pickle
import logging
import asyncio
from datetime import datetime
import os
import sys

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from soil_predictor import SoilPredictor, SoilData, PredictionRequest
from utils import setup_logging, get_soil_properties, classify_soil_texture
from groundwater_service import GroundwaterService
from rainfall_service import RainfallService

# Setup logging
logger = setup_logging()

# FastAPI app instance
app = FastAPI(
    title="Drop2Smart ML Service",
    description="Machine Learning service for Ksat (Saturated Hydraulic Conductivity) prediction using soil data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global service instances
predictor: Optional[SoilPredictor] = None
groundwater_service: Optional[GroundwaterService] = None
rainfall_service: Optional[RainfallService] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the ML model and services on startup"""
    global predictor, groundwater_service, rainfall_service
    try:
        logger.info("🚀 Initializing ML Service...")
        
        # Initialize Ksat predictor
        predictor = SoilPredictor()
        await predictor.initialize()
        logger.info("✅ Ksat Predictor initialized")
        
        # Initialize groundwater service
        groundwater_service = GroundwaterService()
        logger.info("✅ Groundwater Service initialized")
        
        # Initialize rainfall service
        rainfall_service = RainfallService(cache_expire_days=7)
        logger.info("✅ Rainfall Service initialized")
        
        logger.info("✅ ML Service initialized successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to initialize ML service: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint - service information"""
    return {
        "service": "Drop2Smart ML Service",
        "version": "1.0.0",
        "status": "running",
        "description": "Ksat prediction service using XGBoost and SoilGrids data",
        "endpoints": {
            "health": "/health",
            "predict": "/predict-ksat",
            "batch_predict": "/batch-predict-ksat",
            "soil_data": "/soil-data",
            "model_info": "/model-info",
            "groundwater": "/groundwater",
            "groundwater_analysis": "/groundwater-analysis",
            "locations_search": "/locations-search",
            "rainfall": "/rainfall",
            "rainfall_average": "/rainfall-average",
            "rainfall_analysis": "/rainfall-analysis"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global predictor
    
    model_status = "loaded" if predictor and predictor.is_ready() else "not_loaded"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_status": model_status,
        "version": "1.0.0",
        "uptime": "running"
    }

@app.post("/predict-ksat")
async def predict_ksat(request: PredictionRequest):
    """
    Predict Ksat value for given coordinates
    
    Args:
        request: PredictionRequest containing latitude and longitude
        
    Returns:
        dict: Prediction results including Ksat value and soil properties
    """
    global predictor
    
    if not predictor or not predictor.is_ready():
        raise HTTPException(
            status_code=503, 
            detail="ML model is not ready. Please try again later."
        )
    
    try:
        logger.info(f"🔄 Predicting Ksat for coordinates: {request.latitude}, {request.longitude}")
        
        # Get prediction from the model
        result = await predictor.predict(request.latitude, request.longitude)
        
        logger.info(f"✅ Ksat prediction completed: {result['ksat']:.2f}")
        
        return {
            "ksat": result['ksat'],
            "confidence": result['confidence'],
            "soil_properties": result['soil_properties'],
            "soil_analysis": result['soil_analysis'],
            "model_info": result['model_info'],
            "coordinates": {
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/batch-predict-ksat")
async def batch_predict_ksat(coordinates: List[PredictionRequest]):
    """
    Predict Ksat values for multiple coordinates
    
    Args:
        coordinates: List of PredictionRequest objects
        
    Returns:
        dict: Batch prediction results
    """
    global predictor
    
    if not predictor or not predictor.is_ready():
        raise HTTPException(
            status_code=503, 
            detail="ML model is not ready. Please try again later."
        )
    
    if len(coordinates) > 100:
        raise HTTPException(
            status_code=400, 
            detail="Maximum 100 coordinates allowed per batch"
        )
    
    try:
        logger.info(f"🔄 Batch predicting Ksat for {len(coordinates)} coordinates")
        
        predictions = []
        failed_predictions = []
        
        for i, coord in enumerate(coordinates):
            try:
                result = await predictor.predict(coord.latitude, coord.longitude)
                predictions.append({
                    "index": i,
                    "coordinates": {
                        "latitude": coord.latitude,
                        "longitude": coord.longitude
                    },
                    "ksat": result['ksat'],
                    "confidence": result['confidence'],
                    "soil_properties": result['soil_properties'],
                    "soil_analysis": result['soil_analysis']
                })
            except Exception as e:
                failed_predictions.append({
                    "index": i,
                    "coordinates": {
                        "latitude": coord.latitude,
                        "longitude": coord.longitude
                    },
                    "error": str(e)
                })
        
        # Calculate summary statistics
        if predictions:
            ksat_values = [p['ksat'] for p in predictions]
            summary = {
                "total_requested": len(coordinates),
                "successful_predictions": len(predictions),
                "failed_predictions": len(failed_predictions),
                "ksat_statistics": {
                    "mean": np.mean(ksat_values),
                    "median": np.median(ksat_values),
                    "min": np.min(ksat_values),
                    "max": np.max(ksat_values),
                    "std": np.std(ksat_values)
                }
            }
        else:
            summary = {
                "total_requested": len(coordinates),
                "successful_predictions": 0,
                "failed_predictions": len(failed_predictions),
                "message": "All predictions failed"
            }
        
        logger.info(f"✅ Batch prediction completed: {len(predictions)}/{len(coordinates)} successful")
        
        return {
            "predictions": predictions,
            "failed_predictions": failed_predictions,
            "summary": summary,
            "model_info": predictor.get_model_info(),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Batch prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.get("/soil-data")
async def get_soil_data(latitude: float, longitude: float):
    """
    Get raw soil data from SoilGrids for given coordinates
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        
    Returns:
        dict: Raw soil properties from SoilGrids
    """
    try:
        logger.info(f"🔄 Fetching soil data for coordinates: {latitude}, {longitude}")
        
        soil_data = await get_soil_properties(latitude, longitude)
        
        logger.info("✅ Soil data retrieved successfully")
        
        return {
            "coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "soil_properties": soil_data,
            "source": "SoilGrids v2.0",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get soil data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get soil data: {str(e)}")

@app.get("/model-info")
async def get_model_info():
    """
    Get information about the loaded ML model
    
    Returns:
        dict: Model information and statistics
    """
    global predictor
    
    if not predictor:
        raise HTTPException(status_code=503, detail="ML model is not loaded")
    
    try:
        model_info = predictor.get_model_info()
        
        return {
            "model_info": model_info,
            "service_info": {
                "version": "1.0.0",
                "framework": "XGBoost",
                "data_source": "SoilGrids v2.0",
                "prediction_type": "Saturated Hydraulic Conductivity (Ksat)"
            },
            "status": "ready" if predictor.is_ready() else "not_ready",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get model info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")

@app.get("/texture-classification")
async def classify_texture(sand: float, silt: float, clay: float):
    """
    Classify soil texture based on sand, silt, and clay percentages
    
    Args:
        sand: Sand percentage
        silt: Silt percentage  
        clay: Clay percentage
        
    Returns:
        dict: Soil texture classification
    """
    try:
        if not (0 <= sand <= 100 and 0 <= silt <= 100 and 0 <= clay <= 100):
            raise HTTPException(
                status_code=400, 
                detail="Sand, silt, and clay percentages must be between 0 and 100"
            )
        
        total = sand + silt + clay
        if abs(total - 100) > 1:
            raise HTTPException(
                status_code=400,
                detail=f"Sand, silt, and clay percentages must sum to approximately 100% (got {total}%)"
            )
        
        texture_name, texture_encoded = classify_soil_texture(sand, silt, clay)
        
        return {
            "input": {
                "sand": sand,
                "silt": silt,
                "clay": clay
            },
            "texture_classification": {
                "texture_class": texture_name,
                "texture_encoded": texture_encoded
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Texture classification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.get("/groundwater")
async def get_groundwater_data(state: str, district: str, location: str):
    """
    Get groundwater data for a specific location
    
    Args:
        state: State name (e.g., "Delhi", "Haryana")
        district: District name (e.g., "North Delhi", "Jhajjar")
        location: Location name (e.g., "Narela", "Bahadurgarh")
        
    Returns:
        dict: Groundwater level data
    """
    global groundwater_service
    
    if not groundwater_service:
        raise HTTPException(status_code=503, detail="Groundwater service not initialized")
    
    try:
        data = groundwater_service.get_location_data(state, district, location)
        
        if not data:
            raise HTTPException(
                status_code=404, 
                detail=f"Location not found: {state} > {district} > {location}"
            )
        
        return {
            "location": {
                "state": data.state,
                "district": data.district,
                "location": data.location
            },
            "groundwater_data": {
                "annual_replenishable_gw": data.annual_replenishable_gw,
                "net_availability": data.net_availability,
                "total_draft": data.total_draft,
                "stage_percent": data.stage_percent,
                "category": data.category
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get groundwater data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data: {str(e)}")

@app.get("/groundwater-analysis")
async def analyze_groundwater(state: str, district: str, location: str):
    """
    Get comprehensive groundwater risk analysis for a location
    
    Args:
        state: State name
        district: District name
        location: Location name
        
    Returns:
        dict: Comprehensive groundwater analysis
    """
    global groundwater_service
    
    if not groundwater_service:
        raise HTTPException(status_code=503, detail="Groundwater service not initialized")
    
    try:
        analysis = groundwater_service.analyze_location_risk(state, district, location)
        
        if analysis.get('status') == 'error':
            raise HTTPException(status_code=404, detail=analysis.get('message'))
        
        return {
            **analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Groundwater analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/locations-search")
async def search_locations(query: str):
    """
    Search for locations matching a query
    
    Args:
        query: Search query string
        
    Returns:
        dict: List of matching locations
    """
    global groundwater_service
    
    if not groundwater_service:
        raise HTTPException(status_code=503, detail="Groundwater service not initialized")
    
    try:
        results = groundwater_service.search_locations(query)
        
        return {
            "query": query,
            "results": results,
            "count": len(results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Location search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/groundwater-stats")
async def get_groundwater_statistics():
    """
    Get overall groundwater category statistics
    
    Returns:
        dict: Statistics about groundwater categories
    """
    global groundwater_service
    
    if not groundwater_service:
        raise HTTPException(status_code=503, detail="Groundwater service not initialized")
    
    try:
        stats = groundwater_service.get_category_statistics()
        states = groundwater_service.get_all_states()
        
        return {
            "category_statistics": stats,
            "available_states": states,
            "total_locations": sum(stats.values()),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to get statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")

@app.get("/rainfall")
async def get_rainfall_data(
    latitude: float,
    longitude: float,
    years: int = 30,
    include_monthly: bool = True,
    include_peak: bool = True
):
    """
    Get rainfall data for a specific location
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        years: Number of years to analyze (default: 30, max: 50)
        include_monthly: Include monthly breakdown (default: True)
        include_peak: Include peak rainfall day (default: True)
        
    Returns:
        dict: Rainfall data including total, average annual, and optional breakdowns
    """
    global rainfall_service
    
    if not rainfall_service:
        raise HTTPException(status_code=503, detail="Rainfall service not initialized")
    
    # Validate inputs
    if not (-90 <= latitude <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    
    if not (-180 <= longitude <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    if not (1 <= years <= 50):
        raise HTTPException(status_code=400, detail="Years must be between 1 and 50")
    
    try:
        data = await rainfall_service.get_rainfall_data(
            latitude,
            longitude,
            years=years,
            include_monthly=include_monthly,
            include_peak=include_peak
        )
        
        return {
            **data,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get rainfall data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve rainfall data: {str(e)}")

@app.get("/rainfall-average")
async def get_average_annual_rainfall(
    latitude: float,
    longitude: float,
    years: int = 30
):
    """
    Get average annual rainfall for a specific location (simplified endpoint)
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        years: Number of years to analyze (default: 30, max: 50)
        
    Returns:
        dict: Average annual rainfall in millimeters
    """
    global rainfall_service
    
    if not rainfall_service:
        raise HTTPException(status_code=503, detail="Rainfall service not initialized")
    
    # Validate inputs
    if not (-90 <= latitude <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    
    if not (-180 <= longitude <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    if not (1 <= years <= 50):
        raise HTTPException(status_code=400, detail="Years must be between 1 and 50")
    
    try:
        average_rainfall = await rainfall_service.get_average_annual_rainfall(
            latitude,
            longitude,
            years=years
        )
        
        return {
            "coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "average_annual_rainfall_mm": average_rainfall,
            "years_analyzed": years,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get average rainfall: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve average rainfall: {str(e)}")

@app.get("/rainfall-analysis")
async def analyze_rainfall_pattern(
    latitude: float,
    longitude: float,
    years: int = 30
):
    """
    Get comprehensive rainfall pattern analysis
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        years: Number of years to analyze (default: 30, max: 50)
        
    Returns:
        dict: Detailed rainfall analysis including statistics and categorization
    """
    global rainfall_service
    
    if not rainfall_service:
        raise HTTPException(status_code=503, detail="Rainfall service not initialized")
    
    # Validate inputs
    if not (-90 <= latitude <= 90):
        raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
    
    if not (-180 <= longitude <= 180):
        raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
    
    if not (1 <= years <= 50):
        raise HTTPException(status_code=400, detail="Years must be between 1 and 50")
    
    try:
        analysis = await rainfall_service.analyze_rainfall_pattern(
            latitude,
            longitude,
            years=years
        )
        
        return {
            **analysis,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to analyze rainfall: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze rainfall: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "True").lower() == "true"
    
    logger.info(f"🚀 Starting Drop2Smart ML Service on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )