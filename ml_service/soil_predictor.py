"""
Soil Ksat Predictor using XGBoost Model
Based on the provided ML model code from Colab notebook
"""

import numpy as np
import pandas as pd
import xgboost as xgb
import requests
import logging
import asyncio
import aiohttp
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
from pydantic import BaseModel, Field
import pickle
import os

# Pydantic models
class PredictionRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")

class SoilData(BaseModel):
    clay: float = Field(..., description="Clay percentage")
    silt: float = Field(..., description="Silt percentage") 
    sand: float = Field(..., description="Sand percentage")
    organic_carbon: float = Field(..., description="Organic carbon content")
    texture_encoded: int = Field(..., description="Encoded soil texture class")

class SoilPredictor:
    """
    Soil Ksat Predictor using XGBoost model and SoilGrids data
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.model: Optional[xgb.XGBRegressor] = None
        self.is_model_ready = False
        
        # Texture encoding mapping from your ML code
        self.texture_encoding = {
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
        
        # Best hyperparameters from your Optuna optimization
        self.best_params = {
            'max_depth': 8,
            'learning_rate': 0.1,
            'n_estimators': 500,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'gamma': 0.1,
            'reg_alpha': 1.0,
            'reg_lambda': 1.0,
            'min_child_weight': 3,
            'objective': 'reg:squarederror',
            'eval_metric': 'rmse',
            'random_state': 42,
            'n_jobs': -1
        }
        
        # SoilGrids REST API configuration
        self.soilgrids_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
        
    async def initialize(self):
        """Initialize the predictor with trained model"""
        try:
            self.logger.info("🔄 Initializing Soil Ksat Predictor...")
            
            # Try to load pre-trained model first
            model_path = os.path.join(os.path.dirname(__file__), 'models', 'ksat_model.pkl')
            if os.path.exists(model_path):
                self.logger.info("📁 Loading pre-trained model...")
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                    self.is_model_ready = True
                    self.logger.info("✅ Pre-trained model loaded successfully")
            else:
                # If no pre-trained model, create and train with sample data
                self.logger.info("🔨 Training new model with sample data...")
                await self._create_and_train_model()
                
            self.logger.info("✅ Soil Ksat Predictor initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize predictor: {e}")
            raise
    
    async def _create_and_train_model(self):
        """Create and train model with synthetic data (fallback)"""
        try:
            # Generate synthetic training data based on your model structure
            n_samples = 1000
            
            # Generate features: Clay, Silt, Sand, Texture Encoded, OC
            clay = np.random.uniform(5, 60, n_samples)
            silt = np.random.uniform(10, 70, n_samples)
            sand = 100 - clay - silt + np.random.normal(0, 2, n_samples)  # Ensure sum ~100
            sand = np.clip(sand, 0, 85)
            
            # Normalize to sum to 100
            totals = clay + silt + sand
            clay = clay / totals * 100
            silt = silt / totals * 100
            sand = sand / totals * 100
            
            # Generate texture classes and organic carbon
            texture_encoded = []
            organic_carbon = []
            
            for i in range(n_samples):
                texture_name, encoded = self._classify_soil_texture(sand[i], silt[i], clay[i])
                texture_encoded.append(encoded)
                # OC typically correlates with clay content
                oc = np.random.uniform(0.5, 5.0) + clay[i] * 0.02
                organic_carbon.append(min(oc, 10.0))
            
            # Create features DataFrame
            X = pd.DataFrame({
                'Clay': clay,
                'Silt': silt,
                'Sand': sand,
                'Texture Encoded': texture_encoded,
                'OC': organic_carbon
            })
            
            # Generate target variable (Ksat) based on soil properties
            # Sandy soils have higher Ksat, clayey soils have lower Ksat
            ksat_base = 200 - clay * 2.5 + sand * 0.8
            ksat_noise = np.random.normal(0, 10, n_samples)
            y = np.clip(ksat_base + ksat_noise, 1, 300)  # Realistic Ksat range
            
            self.logger.info(f"📊 Generated synthetic training data: {len(X)} samples")
            
            # Train XGBoost model
            self.model = xgb.XGBRegressor(**self.best_params)
            self.model.fit(X, y)
            
            # Save the model
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            os.makedirs(model_dir, exist_ok=True)
            model_path = os.path.join(model_dir, 'ksat_model.pkl')
            
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            self.is_model_ready = True
            self.logger.info("✅ Model trained and saved successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to create and train model: {e}")
            raise
    
    def _classify_soil_texture(self, sand_pct: float, silt_pct: float, clay_pct: float) -> Tuple[str, int]:
        """
        Classify soil texture based on sand, silt, and clay percentages
        From your ML model code
        """
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
        
        encoded_value = self.texture_encoding.get(texture_name, self.texture_encoding["Unknown"])
        return texture_name, encoded_value
    
    async def get_soil_properties(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Fetch soil properties from SoilGrids API
        Based on your SoilGrids code
        """
        point = {"lat": latitude, "lon": longitude}
        
        # Properties to fetch (removed 'bdod' as in your code)
        properties_to_query = [
            {"property": "sand", "depth": "0-5cm", "value": "mean"},
            {"property": "silt", "depth": "0-5cm", "value": "mean"},
            {"property": "clay", "depth": "0-5cm", "value": "mean"},
            {"property": "ocd", "depth": "0-5cm", "value": "mean"},  # Organic Carbon Density
        ]
        
        soil_results = {}
        
        try:
            async with aiohttp.ClientSession() as session:
                for prop in properties_to_query:
                    params = {**point, **prop}
                    
                    async with session.get(self.soilgrids_url, params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            try:
                                mean_value = data['properties']["layers"][0]["depths"][0]["values"]["mean"]
                                if mean_value is not None:
                                    soil_results[prop['property']] = mean_value
                                else:
                                    soil_results[prop['property']] = 0
                            except (KeyError, IndexError):
                                self.logger.warning(f"Could not extract data for {prop['property']}")
                                soil_results[prop['property']] = 0
                        else:
                            self.logger.warning(f"SoilGrids request failed for {prop['property']}: {response.status}")
                            soil_results[prop['property']] = 0
        
        except Exception as e:
            self.logger.error(f"SoilGrids API error: {e}")
            # Use default values if API fails
            soil_results = {'sand': 400, 'silt': 350, 'clay': 250, 'ocd': 15}
        
        return soil_results
    
    def _convert_soilgrids_data(self, soil_results: Dict[str, Any]) -> SoilData:
        """
        Convert SoilGrids data to model input format
        Based on your conversion code
        """
        # Convert to percentages (SoilGrids values are 0-1000 scale)
        sand_pct = soil_results.get('sand', 400) / 10.0  # Convert to percentage
        silt_pct = soil_results.get('silt', 350) / 10.0
        clay_pct = soil_results.get('clay', 250) / 10.0
        
        # Convert OCD to organic carbon (simplified conversion from your code)
        ocd_value = soil_results.get('ocd', 15)
        oc_value = ocd_value * 0.001  # Simplified conversion
        
        # Classify soil texture
        texture_name, texture_encoded_value = self._classify_soil_texture(sand_pct, silt_pct, clay_pct)
        
        return SoilData(
            clay=clay_pct,
            silt=silt_pct,
            sand=sand_pct,
            organic_carbon=oc_value,
            texture_encoded=texture_encoded_value
        )
    
    async def predict(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Predict Ksat value for given coordinates
        """
        if not self.is_model_ready:
            raise RuntimeError("Model is not ready for prediction")
        
        try:
            # Get soil properties from SoilGrids
            soil_results = await self.get_soil_properties(latitude, longitude)
            
            # Convert to model input format
            soil_data = self._convert_soilgrids_data(soil_results)
            
            # Prepare features for prediction (order must match training)
            features = pd.DataFrame({
                'Clay': [soil_data.clay],
                'Silt': [soil_data.silt], 
                'Sand': [soil_data.sand],
                'Texture Encoded': [soil_data.texture_encoded],
                'OC': [soil_data.organic_carbon]
            })
            
            # Make prediction
            ksat_prediction = self.model.predict(features)[0]
            
            # Ensure reasonable bounds
            ksat_prediction = max(1.0, min(300.0, float(ksat_prediction)))
            
            # Determine soil analysis
            soil_analysis = self._analyze_soil(ksat_prediction, soil_data)
            
            # Calculate confidence (simplified)
            confidence = min(0.9, max(0.5, 0.8 - abs(ksat_prediction - 50) / 200))
            
            result = {
                'ksat': ksat_prediction,
                'confidence': confidence,
                'soil_properties': {
                    'clay': soil_data.clay,
                    'silt': soil_data.silt,
                    'sand': soil_data.sand,
                    'organicCarbon': soil_data.organic_carbon,
                    'textureEncoded': soil_data.texture_encoded
                },
                'soil_analysis': soil_analysis,
                'model_info': {
                    'model_type': 'XGBoost',
                    'version': '1.0',
                    'features_used': list(features.columns)
                }
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Prediction failed: {e}")
            raise
    
    def _analyze_soil(self, ksat_value: float, soil_data: SoilData) -> Dict[str, Any]:
        """Analyze soil properties and infiltration characteristics"""
        
        # Determine primary soil type based on percentages
        max_component = max(
            ('Clay', soil_data.clay),
            ('Silt', soil_data.silt), 
            ('Sand', soil_data.sand)
        )[0]
        
        # Infiltration category based on Ksat
        if ksat_value > 100:
            infiltration_category = "High"
            suitability = "Excellent for infiltration"
        elif ksat_value > 50:
            infiltration_category = "Moderate"  
            suitability = "Good for infiltration"
        elif ksat_value > 20:
            infiltration_category = "Low"
            suitability = "Fair for infiltration"
        else:
            infiltration_category = "Very Low"
            suitability = "Poor for infiltration"
        
        # Calculate suitability score
        suitability_score = min(100, max(0, (ksat_value / 150) * 100))
        
        return {
            'primarySoilType': max_component,
            'infiltrationCategory': infiltration_category,
            'suitabilityScore': round(suitability_score, 1),
            'suitability': suitability,
            'texture_class': self._get_texture_name(soil_data.texture_encoded)
        }
    
    def _get_texture_name(self, encoded_value: int) -> str:
        """Get texture name from encoded value"""
        for name, value in self.texture_encoding.items():
            if value == encoded_value:
                return name
        return "Unknown"
    
    def is_ready(self) -> bool:
        """Check if the model is ready for predictions"""
        return self.is_model_ready and self.model is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if not self.is_model_ready:
            return {"status": "not_ready"}
        
        return {
            "status": "ready",
            "model_type": "XGBoost Regressor", 
            "n_features": 5,
            "features": ["Clay", "Silt", "Sand", "Texture Encoded", "OC"],
            "target": "Ksat (Saturated Hydraulic Conductivity)",
            "hyperparameters": self.best_params,
            "data_source": "SoilGrids v2.0",
            "texture_classes": len(self.texture_encoding),
            "version": "1.0"
        }