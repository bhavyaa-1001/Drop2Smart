"""
Ksat Model Trainer - XGBoost Model Training Module
Trains the saturated hydraulic conductivity prediction model using Optuna optimization
"""

import optuna
import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler
import pickle
import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import json


class KsatModelTrainer:
    """
    XGBoost model trainer for Ksat prediction with Optuna hyperparameter optimization
    """
    
    def __init__(self, data_path: Optional[str] = None):
        """
        Initialize the trainer
        
        Args:
            data_path: Path to training data Excel file (optional)
        """
        self.logger = logging.getLogger(__name__)
        self.data_path = data_path
        self.model = None
        self.best_params = None
        self.training_stats = {}
        
        # Texture encoding mapping
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
            "SILT": 12,
            "Unknown": -1
        }
        
        # Feature columns expected by the model
        self.feature_columns = ['Clay', 'Silt', 'Sand', 'Texture Encoded', 'OC']
        self.target_column = 'Ksat'
    
    def load_and_prepare_data(self, data_path: Optional[str] = None) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load and prepare training data
        
        Args:
            data_path: Path to Excel file with training data
            
        Returns:
            Tuple of (features DataFrame, target Series)
        """
        if data_path is None:
            data_path = self.data_path
        
        if data_path and os.path.exists(data_path):
            self.logger.info(f"📁 Loading data from {data_path}")
            data = pd.read_excel(data_path)
        else:
            self.logger.info("🔨 Generating synthetic training data")
            data = self._generate_synthetic_data()
        
        # Prepare data
        data = self._clean_and_encode_data(data)
        
        # Separate features and target
        X = data[self.feature_columns]
        y = data[self.target_column]
        
        self.logger.info(f"✅ Data prepared: {len(X)} samples, {len(X.columns)} features")
        self.logger.info(f"📊 Target range: min={y.min():.2f}, max={y.max():.2f}, mean={y.mean():.2f}")
        
        return X, y
    
    def _generate_synthetic_data(self, n_samples: int = 5000) -> pd.DataFrame:
        """
        Generate synthetic training data based on realistic soil properties
        
        Args:
            n_samples: Number of samples to generate
            
        Returns:
            DataFrame with synthetic soil data
        """
        self.logger.info(f"🔨 Generating {n_samples} synthetic samples")
        
        # Generate realistic soil composition
        clay = np.random.beta(2, 5, n_samples) * 60  # 0-60% clay
        sand = np.random.beta(2, 2, n_samples) * 85  # 0-85% sand
        silt = 100 - clay - sand
        
        # Ensure valid percentages
        total = clay + sand + silt
        clay = clay / total * 100
        silt = silt / total * 100
        sand = sand / total * 100
        
        # Generate texture classification
        texture_encoded = []
        texture_names = []
        for i in range(n_samples):
            texture_name, encoded = self._classify_soil_texture(sand[i], silt[i], clay[i])
            texture_encoded.append(encoded)
            texture_names.append(texture_name)
        
        # Generate organic carbon (typically 0.5-10%)
        organic_carbon = np.random.lognormal(0.5, 0.8, n_samples)
        organic_carbon = np.clip(organic_carbon, 0.1, 15.0)
        
        # Generate realistic Ksat based on soil properties
        # Sandy soils: higher Ksat (50-300 mm/hr)
        # Clay soils: lower Ksat (1-20 mm/hr)
        # Loam soils: moderate Ksat (20-50 mm/hr)
        
        ksat = np.zeros(n_samples)
        for i in range(n_samples):
            # Base Ksat calculation
            sand_effect = sand[i] * 2.5  # Sand increases permeability
            clay_effect = clay[i] * (-2.0)  # Clay decreases permeability
            oc_effect = organic_carbon[i] * (-0.5)  # OC slightly decreases permeability
            
            base_ksat = 100 + sand_effect + clay_effect + oc_effect
            
            # Add texture-specific adjustments
            if texture_names[i] in ['SAND', 'LOAMY SAND']:
                base_ksat *= 1.8
            elif texture_names[i] in ['SANDY LOAM', 'LOAM']:
                base_ksat *= 1.2
            elif texture_names[i] in ['CLAY', 'SILTY CLAY']:
                base_ksat *= 0.3
            
            # Add realistic noise
            noise = np.random.normal(0, base_ksat * 0.15)
            ksat[i] = max(0.5, base_ksat + noise)
        
        # Clip to realistic range
        ksat = np.clip(ksat, 0.5, 350)
        
        # Create DataFrame
        data = pd.DataFrame({
            'Clay': clay,
            'Silt': silt,
            'Sand': sand,
            'Texture Encoded': texture_encoded,
            'Texture': texture_names,
            'OC': organic_carbon,
            'Ksat': ksat
        })
        
        self.logger.info(f"✅ Generated synthetic data with Ksat range: {ksat.min():.2f} - {ksat.max():.2f}")
        
        return data
    
    def _clean_and_encode_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and encode the data
        
        Args:
            data: Raw data DataFrame
            
        Returns:
            Cleaned DataFrame
        """
        # Rename columns if needed
        column_mapping = {
            'Texture Class': 'Texture',
            'OrgCarbon': 'OC',
            'OrganicCarbon': 'OC'
        }
        data = data.rename(columns=column_mapping)
        
        # Encode texture if present
        if 'Texture' in data.columns and 'Texture Encoded' not in data.columns:
            data['Texture Encoded'] = data['Texture'].map(self.texture_encoding).fillna(self.texture_encoding["Unknown"])
        
        # Convert OC to numeric
        if 'OC' in data.columns:
            data['OC'] = pd.to_numeric(data['OC'], errors='coerce')
        
        # Drop rows with missing values in critical columns
        required_cols = self.feature_columns + [self.target_column]
        data = data.dropna(subset=[col for col in required_cols if col in data.columns])
        
        return data
    
    def _classify_soil_texture(self, sand_pct: float, silt_pct: float, clay_pct: float) -> Tuple[str, int]:
        """
        Classify soil texture using USDA soil texture triangle
        
        Args:
            sand_pct: Sand percentage
            silt_pct: Silt percentage
            clay_pct: Clay percentage
            
        Returns:
            Tuple of (texture name, encoded value)
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
            texture_name = "SILTY LOAM"
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
    
    def optimize_hyperparameters(self, X: pd.DataFrame, y: pd.Series, n_trials: int = 100) -> Dict[str, Any]:
        """
        Optimize hyperparameters using Optuna
        
        Args:
            X: Features DataFrame
            y: Target Series
            n_trials: Number of optimization trials
            
        Returns:
            Best hyperparameters dictionary
        """
        self.logger.info(f"🔍 Starting hyperparameter optimization with {n_trials} trials")
        
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        def objective(trial):
            params = {
                "verbosity": 0,
                "objective": "reg:squarederror",
                "eval_metric": "rmse",
                "booster": "gbtree",
                "max_depth": trial.suggest_int("max_depth", 3, 12),
                "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
                "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
                "subsample": trial.suggest_float("subsample", 0.5, 1.0),
                "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
                "gamma": trial.suggest_float("gamma", 0, 5),
                "reg_alpha": trial.suggest_float("reg_alpha", 0, 5),
                "reg_lambda": trial.suggest_float("reg_lambda", 0, 5),
                "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
                "random_state": 42,
                "n_jobs": -1
            }
            
            model = xgb.XGBRegressor(**params)
            
            # Cross-validation
            scores = cross_val_score(
                model, X_train, y_train, 
                cv=5, 
                scoring='neg_root_mean_squared_error',
                n_jobs=-1
            )
            rmse = -scores.mean()
            
            return rmse
        
        # Create and run study
        study = optuna.create_study(direction="minimize")
        study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
        
        self.best_params = study.best_trial.params
        self.best_params.update({
            "verbosity": 0,
            "objective": "reg:squarederror",
            "eval_metric": "rmse",
            "booster": "gbtree",
            "random_state": 42,
            "n_jobs": -1
        })
        
        self.logger.info(f"✅ Optimization complete. Best RMSE: {study.best_value:.4f}")
        self.logger.info(f"📊 Best parameters: {self.best_params}")
        
        return self.best_params
    
    def train_model(self, X: pd.DataFrame, y: pd.Series, params: Optional[Dict[str, Any]] = None) -> xgb.XGBRegressor:
        """
        Train the XGBoost model
        
        Args:
            X: Features DataFrame
            y: Target Series
            params: Hyperparameters (optional, uses best_params if None)
            
        Returns:
            Trained XGBoost model
        """
        if params is None:
            params = self.best_params or self._get_default_params()
        
        self.logger.info("🔄 Training XGBoost model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model = xgb.XGBRegressor(**params)
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Evaluate model
        y_pred_train = self.model.predict(X_train)
        y_pred_test = self.model.predict(X_test)
        
        self.training_stats = {
            "train_rmse": np.sqrt(mean_squared_error(y_train, y_pred_train)),
            "test_rmse": np.sqrt(mean_squared_error(y_test, y_pred_test)),
            "train_r2": r2_score(y_train, y_pred_train),
            "test_r2": r2_score(y_test, y_pred_test),
            "train_mae": mean_absolute_error(y_train, y_pred_train),
            "test_mae": mean_absolute_error(y_test, y_pred_test),
            "n_samples": len(X),
            "n_features": len(X.columns),
            "training_date": datetime.now().isoformat()
        }
        
        self.logger.info("✅ Model training complete")
        self.logger.info(f"📊 Test RMSE: {self.training_stats['test_rmse']:.4f}")
        self.logger.info(f"📊 Test R²: {self.training_stats['test_r2']:.4f}")
        self.logger.info(f"📊 Test MAE: {self.training_stats['test_mae']:.4f}")
        
        return self.model
    
    def _get_default_params(self) -> Dict[str, Any]:
        """Get default hyperparameters"""
        return {
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
    
    def save_model(self, model_dir: str = 'models', model_name: str = 'ksat_model.pkl'):
        """
        Save the trained model and metadata
        
        Args:
            model_dir: Directory to save model
            model_name: Model filename
        """
        if self.model is None:
            raise ValueError("No model to save. Train model first.")
        
        os.makedirs(model_dir, exist_ok=True)
        
        model_path = os.path.join(model_dir, model_name)
        metadata_path = os.path.join(model_dir, 'model_metadata.json')
        
        # Save model
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        # Save metadata
        metadata = {
            'model_type': 'XGBoost Regressor',
            'target': 'Ksat',
            'features': self.feature_columns,
            'hyperparameters': self.best_params or self._get_default_params(),
            'training_stats': self.training_stats,
            'texture_encoding': self.texture_encoding,
            'version': '1.0',
            'created_at': datetime.now().isoformat()
        }
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        self.logger.info(f"✅ Model saved to {model_path}")
        self.logger.info(f"✅ Metadata saved to {metadata_path}")
    
    def full_training_pipeline(
        self, 
        data_path: Optional[str] = None, 
        optimize: bool = True,
        n_trials: int = 100
    ):
        """
        Run the full training pipeline
        
        Args:
            data_path: Path to training data
            optimize: Whether to run hyperparameter optimization
            n_trials: Number of optimization trials
        """
        self.logger.info("🚀 Starting full training pipeline")
        
        # Load and prepare data
        X, y = self.load_and_prepare_data(data_path)
        
        # Optimize hyperparameters
        if optimize:
            self.optimize_hyperparameters(X, y, n_trials=n_trials)
        
        # Train model
        self.train_model(X, y)
        
        # Save model
        self.save_model()
        
        self.logger.info("✅ Training pipeline complete!")
        
        return self.model, self.training_stats


if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create trainer
    trainer = KsatModelTrainer()
    
    # Run full pipeline
    model, stats = trainer.full_training_pipeline(
        optimize=True,
        n_trials=50  # Reduce for faster training
    )
    
    print("\n" + "="*50)
    print("Training Complete!")
    print("="*50)
    print(f"Test RMSE: {stats['test_rmse']:.4f}")
    print(f"Test R²: {stats['test_r2']:.4f}")
    print(f"Test MAE: {stats['test_mae']:.4f}")
