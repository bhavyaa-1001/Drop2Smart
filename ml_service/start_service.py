#!/usr/bin/env python3
"""
Drop2Smart ML Service - Quick Start Script
Trains model (if needed) and starts the service
"""

import os
import sys
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_model_exists():
    """Check if trained model exists"""
    model_path = Path(__file__).parent / 'models' / 'ksat_model.pkl'
    return model_path.exists()

def train_model():
    """Train the Ksat prediction model"""
    logger.info("🔨 Training Ksat prediction model...")
    
    try:
        from ksat_model_trainer import KsatModelTrainer
        
        trainer = KsatModelTrainer()
        model, stats = trainer.full_training_pipeline(
            optimize=True,
            n_trials=50  # Balanced between speed and performance
        )
        
        logger.info("✅ Model training complete!")
        logger.info(f"📊 Test RMSE: {stats['test_rmse']:.4f}")
        logger.info(f"📊 Test R²: {stats['test_r2']:.4f}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Model training failed: {e}")
        return False

def start_service():
    """Start the FastAPI service"""
    logger.info("🚀 Starting Drop2Smart ML Service...")
    
    try:
        import uvicorn
        
        # Configuration
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", 8000))
        reload = os.getenv("RELOAD", "True").lower() == "true"
        
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start service: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    logger.info("=" * 60)
    logger.info("🌊 Drop2Smart ML Service - Startup")
    logger.info("=" * 60)
    
    # Check if model exists
    if not check_model_exists():
        logger.warning("⚠️  No trained model found!")
        response = input("Would you like to train the model now? (y/n): ")
        
        if response.lower() == 'y':
            if not train_model():
                logger.error("❌ Cannot start service without a trained model")
                sys.exit(1)
        else:
            logger.info("ℹ️  Starting service with auto-generated synthetic model...")
    else:
        logger.info("✅ Found existing trained model")
    
    # Start the service
    logger.info("\n" + "=" * 60)
    logger.info("Starting API Service...")
    logger.info("=" * 60 + "\n")
    
    start_service()

if __name__ == "__main__":
    main()
