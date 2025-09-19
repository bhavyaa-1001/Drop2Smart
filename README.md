# Drop2Smart - Rainwater Harvesting Assessment Platform

A comprehensive full-stack application for assessing rainwater harvesting potential using AI and machine learning. The platform analyzes rooftop characteristics and soil properties to provide detailed recommendations for rainwater harvesting systems.

## 🏗️ Architecture

### Frontend (React + Vite)
- **Location**: `./Frontend`
- **Tech Stack**: React 19, Vite, Tailwind CSS
- **Features**: 
  - Interactive rooftop image upload
  - Location detection (GPS, IP-based, manual)
  - Real-time form validation
  - Results visualization

### Backend (Express.js + MongoDB)
- **Location**: `./backend`
- **Tech Stack**: Express.js, MongoDB, Mongoose
- **Features**:
  - RESTful API for assessments
  - File upload handling
  - MongoDB data storage
  - Background processing

### ML Service (FastAPI + XGBoost)
- **Location**: `./ml_service`
- **Tech Stack**: FastAPI, XGBoost, SciKit-Learn, SoilGrids API
- **Features**:
  - Ksat (soil permeability) prediction
  - Soil texture classification
  - SoilGrids data integration
  - Batch processing support

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.8+
- **MongoDB** Community Edition
- **Git**

### 🎯 One-Command Setup

```powershell
# Clone and setup everything
git clone <your-repo-url>
cd drop2smart
.\setup.ps1
```

### 🏃‍♂️ Run All Services

```powershell
# Start all services concurrently
.\run-all.ps1
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000  
- ML Service: http://localhost:8000

## 🔧 Manual Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

### 2. ML Service Setup
```bash
cd ml_service
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

## 📊 Features

### 🏠 Rooftop Assessment
- **Image Upload**: Drag & drop rooftop images
- **Building Details**: Roof area, slope, material, height
- **Location Detection**: GPS, IP-based, or manual coordinate input
- **Rainfall Data**: Annual precipitation input with auto-suggestions

### 🤖 AI/ML Integration
- **Soil Analysis**: Real-time Ksat prediction using coordinates
- **SoilGrids Integration**: Live soil property data
- **Texture Classification**: USDA soil texture triangle classification
- **Infiltration Analysis**: Soil suitability assessment

### 📈 Results & Recommendations
- **Harvesting Potential**: Annual and monthly collection estimates
- **System Design**: Tank size, pipe specifications, filter recommendations
- **Environmental Impact**: Water savings, carbon footprint reduction
- **Cost Analysis**: ROI and payback period calculations

## 🗂️ Project Structure

```
drop2smart/
├── Frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── utils/             # Utility functions & API integration
│   │   └── context/           # React context providers
│   ├── public/                # Static assets
│   └── package.json
│
├── backend/                    # Express.js backend
│   ├── routes/                # API route handlers
│   ├── models/                # MongoDB schemas
│   ├── config/                # Database & app configuration
│   ├── uploads/               # File upload directory
│   └── package.json
│
├── ml_service/                 # FastAPI ML service
│   ├── main.py                # FastAPI application
│   ├── soil_predictor.py      # XGBoost model & prediction logic
│   ├── utils.py               # ML utility functions
│   ├── models/                # Trained ML models
│   └── requirements.txt
│
├── setup.ps1                  # Automated setup script
├── run-all.ps1               # Run all services script
└── README.md                 # This file
```

## 🔌 API Endpoints

### Backend API (Port 5000)

#### Assessments
- `POST /api/assessments` - Submit new assessment
- `GET /api/assessments/:id` - Get assessment by ID
- `GET /api/assessments/:id/status` - Check processing status

#### Location Services
- `GET /api/locations/cities` - Get Indian cities database
- `GET /api/locations/nearest-city` - Find nearest city
- `POST /api/locations/validate-coordinates` - Validate coordinates

#### File Upload
- `POST /api/uploads/image` - Upload rooftop images

### ML Service API (Port 8000)

#### Predictions
- `POST /predict-ksat` - Get Ksat prediction for coordinates
- `POST /batch-predict-ksat` - Batch Ksat predictions
- `GET /soil-data` - Get raw SoilGrids data

#### Utilities
- `GET /health` - Service health check
- `GET /model-info` - Get model information

## 🌍 Data Sources

### SoilGrids v2.0
- **URL**: https://rest.isric.org/soilgrids/v2.0/
- **Data**: Sand, silt, clay percentages, organic carbon density
- **Coverage**: Global 250m resolution

### OpenStreetMap Nominatim
- **URL**: https://nominatim.openstreetmap.org/
- **Usage**: Geocoding and reverse geocoding
- **Features**: Free, no API key required

## 🤖 Machine Learning Model

### XGBoost Ksat Predictor
- **Input Features**: Clay%, Silt%, Sand%, Organic Carbon, Texture Class
- **Target**: Saturated Hydraulic Conductivity (mm/hr)
- **Training**: Optimized with Optuna hyperparameter tuning
- **Accuracy**: RMSE ~6.59 with normalized RMSE of 0.08

### Soil Texture Classification
- **Standard**: USDA Soil Texture Triangle
- **Classes**: 12 texture classes (Sand, Clay, Loam, etc.)
- **Encoding**: Numerical encoding for ML model input

## 🗃️ Database Schema

### Assessment Collection
```javascript
{
  assessmentId: String,           // Unique public ID
  buildingDetails: {
    roofArea: Number,            // sq ft
    roofSlope: Number,           // degrees
    roofMaterial: String,        // enum
    buildingHeight: Number       // feet
  },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  environmentalData: {
    annualRainfall: Number,      // mm
    soilData: {
      ksat: Number,              // ML prediction
      soilType: String,
      clay: Number,              // %
      silt: Number,              // %
      sand: Number               // %
    }
  },
  results: {
    harvestingPotential: {
      annualCollection: Number,   // liters
      monthlyCollection: Array
    },
    systemRecommendations: {
      tankSize: Number,          // liters
      estimatedCost: Number
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_ML_SERVICE_URL=http://localhost:8000
VITE_ENABLE_ML_PREDICTIONS=true
```

#### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drop2smart
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-secret-key
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd Frontend && npm run build

# Backend
cd backend && npm start

# ML Service
cd ml_service && uvicorn main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### ML Service Tests
```bash
cd ml_service
python -m pytest
```

### Frontend Tests
```bash
cd Frontend
npm run test
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB service is running
   - Check connection string in `.env`

2. **ML Predictions Failing**
   - Check SoilGrids API connectivity
   - Verify model files exist in `ml_service/models/`

3. **Frontend API Calls Failing**
   - Verify backend and ML service are running
   - Check CORS configuration

4. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file size limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **SoilGrids** for global soil data
- **OpenStreetMap** for geocoding services
- **XGBoost** for machine learning capabilities
- **React** and **FastAPI** communities

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for sustainable water management**