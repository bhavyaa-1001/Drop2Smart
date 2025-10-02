# Drop2Smart ML Service

Complete machine learning service for soil permeability prediction and groundwater analysis.

## Features

### 🌱 Ksat Prediction
- **XGBoost-based model** for predicting saturated hydraulic conductivity (Ksat)
- **Optuna optimization** for hyperparameter tuning
- **SoilGrids integration** for real-time soil data
- **USDA soil texture classification**

### 💧 Groundwater Analysis
- **Comprehensive groundwater level data** for Delhi and Haryana regions
- **Risk assessment** based on exploitation categories
- **Location-based queries** with hierarchical search (State > District > Location)
- **Recommendations** for rainwater harvesting and recharge measures

## Project Structure

```
ml_service/
├── main.py                      # FastAPI application
├── soil_predictor.py            # Ksat prediction model
├── ksat_model_trainer.py        # Model training pipeline
├── groundwater_service.py       # Groundwater data service
├── utils.py                     # Utility functions
├── requirements.txt             # Python dependencies
├── data/
│   └── groundwater_level_data.json  # Groundwater database
└── models/
    ├── ksat_model.pkl          # Trained model (generated)
    └── model_metadata.json     # Model metadata (generated)
```

## Installation

### Prerequisites
- Python 3.8+
- pip

### Install Dependencies

```bash
cd ml_service
pip install -r requirements.txt
```

## Usage

### 1. Train the Model (Optional)

Train a new Ksat prediction model with Optuna optimization:

```bash
python ksat_model_trainer.py
```

This will:
- Generate synthetic training data (or use your data if provided)
- Optimize hyperparameters using Optuna (50-100 trials)
- Train XGBoost model
- Save model to `models/ksat_model.pkl`

**Custom Data Training:**

```python
from ksat_model_trainer import KsatModelTrainer

trainer = KsatModelTrainer()
model, stats = trainer.full_training_pipeline(
    data_path='path/to/your/data.xlsx',  # Excel file with soil data
    optimize=True,
    n_trials=100
)
```

### 2. Start the Service

```bash
# Development mode
python main.py

# Production mode with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

The service will be available at:
- API Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Ksat Prediction

#### POST `/predict-ksat`
Predict Ksat value for given coordinates.

```json
{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

**Response:**
```json
{
  "ksat": 45.23,
  "confidence": 0.85,
  "soil_properties": {
    "clay": 27.5,
    "silt": 35.2,
    "sand": 37.3,
    "organicCarbon": 1.8,
    "textureEncoded": 2
  },
  "soil_analysis": {
    "primarySoilType": "Clay",
    "infiltrationCategory": "Moderate",
    "suitabilityScore": 67.5,
    "texture_class": "LOAM"
  }
}
```

#### POST `/batch-predict-ksat`
Batch prediction for multiple locations.

```json
[
  {"latitude": 28.7041, "longitude": 77.1025},
  {"latitude": 28.6139, "longitude": 77.2090}
]
```

### Groundwater Data

#### GET `/groundwater`
Get groundwater data for a specific location.

```
GET /groundwater?state=Delhi&district=North%20Delhi&location=Narela
```

**Response:**
```json
{
  "location": {
    "state": "Delhi",
    "district": "North Delhi",
    "location": "Narela"
  },
  "groundwater_data": {
    "annual_replenishable_gw": 2357.1,
    "net_availability": 2121.39,
    "total_draft": 2514.2,
    "stage_percent": 118.517,
    "category": "Over-exploited"
  }
}
```

#### GET `/groundwater-analysis`
Comprehensive risk analysis for a location.

```
GET /groundwater-analysis?state=Delhi&district=North%20Delhi&location=Narela
```

**Response:**
```json
{
  "location": {...},
  "groundwater_status": {...},
  "risk_analysis": {
    "risk_level": "High",
    "risk_score": 90,
    "utilization_ratio": 1.185,
    "recommendation": "Critical: Immediate water conservation required"
  },
  "suitability_for_recharge": {
    "suitable": true,
    "priority": "Critical - Immediate action required",
    "notes": "Area is over-exploited..."
  }
}
```

#### GET `/locations-search`
Search for locations by name.

```
GET /locations-search?query=Narela
```

#### GET `/groundwater-stats`
Get overall statistics about groundwater categories.

### Other Endpoints

#### GET `/soil-data`
Get raw soil data from SoilGrids.

```
GET /soil-data?latitude=28.7041&longitude=77.1025
```

#### GET `/texture-classification`
Classify soil texture based on composition.

```
GET /texture-classification?sand=40&silt=35&clay=25
```

#### GET `/model-info`
Get information about the loaded ML model.

#### GET `/health`
Health check endpoint.

## Data Format

### Training Data Format

If you want to train with your own data, use Excel format (`.xlsx`) with these columns:

| Column | Description | Required |
|--------|-------------|----------|
| Clay | Clay percentage (0-100) | Yes |
| Silt | Silt percentage (0-100) | Yes |
| Sand | Sand percentage (0-100) | Yes |
| OC | Organic carbon content | Yes |
| Texture Class | Soil texture name (optional, will be auto-classified) | No |
| Ksat | Target: Saturated hydraulic conductivity (mm/hr) | Yes |

### Groundwater Data Format

JSON structure:
```json
{
  "State": {
    "District": {
      "Location": {
        "Annual_Replenishable_GW": 1000.0,
        "Net_Availability": 900.0,
        "Total_Draft": 800.0,
        "Stage_Percent": 88.89,
        "Category": "Semi-critical"
      }
    }
  }
}
```

**Categories:**
- `Safe`: Stage < 70%
- `Semi-critical`: Stage 70-90%
- `Critical`: Stage 90-100%
- `Over-exploited`: Stage > 100%

## Configuration

### Environment Variables

```bash
# Server configuration
HOST=0.0.0.0
PORT=8000
RELOAD=True

# Model configuration (optional)
MODEL_PATH=models/ksat_model.pkl
GROUNDWATER_DATA_PATH=data/groundwater_level_data.json
```

### Model Configuration

Edit `soil_predictor.py` to customize:

```python
class SoilPredictorConfig:
    # Ksat bounds (mm/hr)
    KSAT_MIN = 0.5
    KSAT_MAX = 350.0
    
    # Confidence calculation
    CONFIDENCE_BASE = 0.8
    CONFIDENCE_MIN = 0.5
    CONFIDENCE_MAX = 0.95
    
    # SoilGrids API
    SOILGRIDS_DEPTH = "0-5cm"
    SOILGRIDS_VALUE_TYPE = "mean"
```

## Model Performance

The XGBoost model is trained with Optuna optimization and achieves:
- **RMSE**: ~6.59 (on test set)
- **R² Score**: 0.85+ (typical)
- **Features**: Clay, Silt, Sand, Texture Encoded, Organic Carbon

### Feature Importance

1. **Sand %** - Highest impact on permeability
2. **Clay %** - Strong inverse relationship
3. **Organic Carbon** - Moderate impact
4. **Silt %** - Moderate impact
5. **Texture Encoded** - Classification helper

## Examples

### Python Client

```python
import requests

BASE_URL = "http://localhost:8000"

# Predict Ksat
response = requests.post(
    f"{BASE_URL}/predict-ksat",
    json={"latitude": 28.7041, "longitude": 77.1025}
)
result = response.json()
print(f"Predicted Ksat: {result['ksat']:.2f} mm/hr")

# Get groundwater analysis
response = requests.get(
    f"{BASE_URL}/groundwater-analysis",
    params={
        "state": "Delhi",
        "district": "North Delhi",
        "location": "Narela"
    }
)
analysis = response.json()
print(f"Risk Level: {analysis['risk_analysis']['risk_level']}")
```

### cURL Examples

```bash
# Predict Ksat
curl -X POST "http://localhost:8000/predict-ksat" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.7041, "longitude": 77.1025}'

# Groundwater analysis
curl "http://localhost:8000/groundwater-analysis?state=Delhi&district=North%20Delhi&location=Narela"

# Search locations
curl "http://localhost:8000/locations-search?query=Narela"
```

## Integration with Frontend

The ML service integrates with the Drop2Smart frontend:

```javascript
// Fetch Ksat prediction
const predictKsat = async (lat, lon) => {
  const response = await fetch('http://localhost:8000/predict-ksat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lon })
  });
  return await response.json();
};

// Fetch groundwater data
const getGroundwater = async (state, district, location) => {
  const params = new URLSearchParams({ state, district, location });
  const response = await fetch(`http://localhost:8000/groundwater-analysis?${params}`);
  return await response.json();
};
```

## Troubleshooting

### Model not loading
- Ensure `models/ksat_model.pkl` exists
- Run `python ksat_model_trainer.py` to generate model

### SoilGrids API timeout
- Check internet connection
- Service falls back to default soil properties

### Groundwater data not found
- Verify location names (case-insensitive but spelling matters)
- Use `/locations-search` to find available locations

## Contributing

To add more groundwater locations:

1. Edit `data/groundwater_level_data.json`
2. Follow the existing JSON structure
3. Restart the service

## License

MIT License - Part of Drop2Smart Project

## Credits

- **Model**: XGBoost with Optuna optimization
- **Soil Data**: SoilGrids v2.0 (ISRIC)
- **Groundwater Data**: Custom curated database
- **Framework**: FastAPI
