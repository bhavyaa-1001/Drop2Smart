# Drop2Smart - Rainwater Harvesting Assessment Platform

<div align="center">

**🌧️ A comprehensive AI-powered platform for assessing rainwater harvesting potential 💧**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [API Docs](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Installation](#-detailed-installation)
- [Running the Application](#-running-the-application)
- [Project Structure](#️-project-structure)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#️-database-schema)
- [Machine Learning Models](#-machine-learning-models)
- [Data Sources](#-data-sources)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Drop2Smart** is an intelligent full-stack web application designed to help individuals, organizations, and governments assess the viability and effectiveness of rainwater harvesting systems. By analyzing rooftop characteristics, local rainfall patterns, soil properties, and groundwater conditions, the platform provides comprehensive recommendations for implementing sustainable water management solutions.

### Why Drop2Smart?

- 🌍 **Environmental Impact**: Promote water conservation and reduce groundwater depletion
- 🤖 **AI-Powered**: Machine learning models predict soil permeability and analyze groundwater risks
- 📊 **Data-Driven**: Integration with SoilGrids API and comprehensive groundwater databases
- 🎯 **Actionable Insights**: Detailed system recommendations, cost estimates, and ROI calculations
- 📱 **User-Friendly**: Modern, responsive interface with multiple location detection methods

### Key Capabilities

✅ Rooftop image upload and analysis  
✅ GPS, IP-based, and manual location detection  
✅ Real-time soil permeability (Ksat) prediction using XGBoost ML models  
✅ Groundwater risk assessment for Delhi and Haryana regions  
✅ Annual and monthly rainwater collection potential calculations  
✅ System design recommendations (tank size, pipes, filters)  
✅ Cost-benefit analysis with ROI and payback period  
✅ Environmental impact estimation (water savings, carbon footprint)  
✅ PDF export of comprehensive assessment reports  
✅ Charts and visualizations for data insights  

---

## 🚀 Features

### 🏠 Rooftop Assessment Module
- **Image Upload**: 
  - Drag-and-drop interface
  - Preview with thumbnails
  - Format support: JPG, PNG, JPEG
  - Maximum size: 5MB
  - Image optimization with Sharp
  
- **Building Details**:
  - Roof area (sq ft / sq m)
  - Roof slope (0-90 degrees)
  - Roof material (RCC, Metal, Tile, Asbestos)
  - Building height (feet/meters)
  
- **Form Validation**: Real-time validation with helpful error messages

### 📍 Smart Location Detection
- **Multiple Detection Methods**:
  - **GPS Geolocation**: Browser-based GPS using Geolocation API
  - **IP-Based Location**: Automatic detection using IP geolocation
  - **Manual Entry**: Direct latitude/longitude input
  - **Address Search**: Search with autocomplete (planned)
  
- **Features**:
  - Indian cities database with 100+ cities
  - Coordinate validation (India: 6.5°N-35.5°N, 68°E-97.5°E)
  - Nearest city finder
  - Annual rainfall data integration

### 🤖 AI/ML Integration

#### Soil Analysis
- **Ksat Prediction**: 
  - XGBoost-based model (RMSE ~6.59)
  - Real-time predictions using coordinates
  - Confidence scores for predictions
  
- **Soil Properties**:
  - Sand, silt, clay percentages
  - Organic carbon content
  - USDA soil texture classification (12 classes)
  - Infiltration category assessment
  
- **Data Sources**:
  - SoilGrids v2.0 API (250m resolution)
  - Global coverage with high accuracy

#### Groundwater Assessment
- **Comprehensive Database**:
  - Delhi and Haryana regions
  - District-wise data
  - Location-specific measurements
  
- **Analysis**:
  - Groundwater availability
  - Extraction rates
  - Stage of development (%)
  - Risk categorization:
    - Safe (< 70%)
    - Semi-critical (70-90%)
    - Critical (90-100%)
    - Over-exploited (> 100%)
  
- **Recommendations**:
  - Recharge suitability assessment
  - Priority level determination
  - Conservation measures

### 📈 Results & Recommendations

#### Harvesting Potential
- **Annual Collection**: Total liters/gallons per year
- **Monthly Breakdown**: Month-by-month collection estimates
- **Calculations Include**:
  - Runoff coefficient (based on roof material)
  - First flush losses
  - Collection efficiency
  - Rainfall variation

#### System Design Recommendations
- **Storage Tank**:
  - Optimal size (liters/gallons)
  - Material recommendations
  - Placement suggestions
  
- **Piping System**:
  - Pipe diameter specifications
  - Material type (PVC, GI)
  - Layout recommendations
  
- **Filtration**:
  - Filter type selection
  - Filter size calculations
  - Maintenance guidelines
  
- **Additional Components**:
  - Pump requirements
  - First flush diverter size
  - Overflow management

#### Financial Analysis
- **Cost Estimation**:
  - Component-wise breakdown
  - Installation costs
  - Maintenance costs
  
- **Savings Analysis**:
  - Annual water bill savings
  - Payback period calculation
  - ROI percentage
  - 10-year projection

#### Environmental Impact
- **Water Conservation**:
  - Annual water savings (liters)
  - Percentage of household demand met
  
- **Carbon Footprint**:
  - CO₂ emissions avoided
  - Energy savings
  
- **Groundwater Impact**:
  - Recharge contribution
  - Reduced extraction pressure

### 📊 Visualization & Export
- **Interactive Charts**:
  - Monthly collection bar charts (Recharts)
  - Soil composition pie charts
  - Cost breakdown visualizations
  - Environmental impact graphs
  
- **PDF Export**:
  - Comprehensive assessment reports
  - All charts and visualizations included
  - Professional formatting
  - Downloadable for offline viewing
  - Technologies: jsPDF + html2canvas + jspdf-autotable

---

## 🏗️ Architecture

Drop2Smart follows a modern **microservices architecture** with three independent services:

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                     (Web Browser)                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   HTTP Requests
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      FRONTEND SERVICE                        │
│               React 19 + Vite + Tailwind CSS                 │
│         Port: 3000  │  Location: ./Frontend/                 │
│                                                               │
│  • User Interface Components                                 │
│  • State Management (Context API)                            │
│  • API Integration Layer                                     │
│  • Form Validation & Error Handling                          │
└─────────┬───────────────────────────────────┬───────────────┘
          │                                   │
    REST API Calls                      REST API Calls
          │                                   │
┌─────────▼─────────────────────┐   ┌───────▼────────────────┐
│    BACKEND SERVICE            │   │   ML SERVICE           │
│  Express.js + MongoDB         │   │  FastAPI + XGBoost     │
│  Port: 5000                   │   │  Port: 8000            │
│  Location: ./backend/         │   │  Location: ./ml_service│
│                               │   │                         │
│  • RESTful API Endpoints      │   │  • Ksat Prediction     │
│  • File Upload Handler        │   │  • Soil Analysis       │
│  • Assessment Processing      │   │  • Groundwater Data    │
│  • MongoDB Integration        │   │  • SoilGrids API       │
│  • Image Optimization         │◄──┤  • Batch Processing    │
└───────────┬───────────────────┘   └────────────────────────┘
            │                               │
            │                               │
    ┌───────▼──────────┐          ┌────────▼────────────┐
    │   MongoDB        │          │  External APIs      │
    │   Database       │          │  • SoilGrids v2.0   │
    │   Port: 27017    │          │  • OpenMeteo        │
    └──────────────────┘          └─────────────────────┘
```

### Component Details

#### Frontend (React 19 + Vite)
- **Location**: `./Frontend`
- **Port**: 3000
- **Tech Stack**:
  ```json
  {
    "framework": "React 19.1.1",
    "build_tool": "Vite 7.1.2",
    "styling": "Tailwind CSS 3.4.17",
    "routing": "React Router DOM 7.9.1",
    "charts": "Recharts 3.2.1",
    "pdf_export": "jsPDF 3.0.3 + html2canvas 1.4.1"
  }
  ```

#### Backend (Express.js + MongoDB)
- **Location**: `./backend`
- **Port**: 5000
- **Tech Stack**:
  ```json
  {
    "framework": "Express.js 4.18.2",
    "database": "MongoDB + Mongoose 8.0.3",
    "file_upload": "Multer 1.4.5 + Sharp 0.33.1",
    "security": "Helmet 7.1.0 + CORS 2.8.5",
    "logging": "Morgan 1.10.0",
    "rate_limiting": "express-rate-limit 7.1.5"
  }
  ```

#### ML Service (FastAPI + XGBoost)
- **Location**: `./ml_service`
- **Port**: 8000
- **Tech Stack**:
  ```json
  {
    "framework": "FastAPI 0.104.1",
    "ml_library": "XGBoost 1.7.6",
    "data_processing": "Pandas 2.1.1 + NumPy 1.24.4",
    "optimization": "Optuna 3.4.0",
    "scikit_learn": "1.3.0",
    "server": "Uvicorn 0.24.0"
  }
  ```

---

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|-------------|
| **Node.js** | 18.0+ | Backend & Frontend runtime | [Download](https://nodejs.org/) |
| **npm** | 9.0+ | Node package manager | Included with Node.js |
| **Python** | 3.8-3.11 | ML Service runtime | [Download](https://python.org/) |
| **pip** | Latest | Python package manager | Included with Python |
| **MongoDB** | 6.0+ | Database server | [Download](https://www.mongodb.com/try/download/community) |
| **Git** | 2.0+ | Version control | [Download](https://git-scm.com/) |

### System Requirements

- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB free space
- **Internet**: Required for API calls and dependencies

### Quick Verification

```bash
# Check all prerequisites
node --version     # ✅ Should show v18.x.x or higher
npm --version      # ✅ Should show 9.x.x or higher
python --version   # ✅ Should show Python 3.8-3.11
pip --version      # ✅ Should show pip version
mongod --version   # ✅ Should show v6.x.x or higher
git --version      # ✅ Should show git 2.x.x or higher
```

### MongoDB Setup

**Windows:**
```powershell
# After installation, start MongoDB service
net start MongoDB

# Or use Windows Services Manager (services.msc)
```

**macOS:**
```bash
# Using Homebrew
brew install mongodb-community@6.0
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended for Windows)

```powershell
# 1. Clone the repository
git clone https://github.com/bhavyaa-1001/Drop2Smart.git
cd Drop2Smart

# 2. Run automated setup (installs all dependencies)
.\setup.ps1

# 3. Start all services (Backend, ML Service, Frontend)
.\run-all.ps1
```

The `run-all.ps1` script will:
- ✅ Start MongoDB service
- ✅ Launch Backend on port 5000
- ✅ Launch ML Service on port 8000
- ✅ Launch Frontend on port 3000
- ✅ Monitor all services
- ✅ Show logs in real-time

### Option 2: Manual Setup (All Platforms)

Follow the [Detailed Installation](#-detailed-installation) section below.

### Accessing the Application

Once running, access the application at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:5000 | REST API endpoints |
| **ML Service** | http://localhost:8000 | ML predictions |
| **ML API Docs** | http://localhost:8000/docs | Swagger documentation |
| **MongoDB** | mongodb://localhost:27017 | Database connection |

---

## 🔧 Detailed Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/bhavyaa-1001/Drop2Smart.git
cd Drop2Smart
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# On Windows
copy .env.example .env

# On Linux/macOS
cp .env.example .env

# Edit .env file with your configuration
# (See Configuration section below)

# Return to root directory
cd ..
```

**Expected Output:**
```
✅ 150+ packages installed
✅ Dependencies: express, mongoose, multer, sharp, etc.
✅ Time: 2-3 minutes
```

### Step 3: ML Service Setup

```bash
# Navigate to ML service directory
cd ml_service

# Create virtual environment
python -m venv venv

# Activate virtual environment

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
venv\Scripts\activate.bat

# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model (optional - pre-trained model included)
python ksat_model_trainer.py

# Return to root directory
cd ..
```

**Expected Output:**
```
✅ Virtual environment created
✅ 30+ packages installed (FastAPI, XGBoost, pandas, etc.)
✅ ML model loaded/trained
✅ Time: 5-7 minutes
```

### Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Create environment file
# On Windows
copy .env.example .env

# On Linux/macOS
cp .env.example .env

# Edit .env file
# (Default values work for local development)

# Return to root directory
cd ..
```

**Expected Output:**
```
✅ 800+ packages installed (includes dependencies)
✅ Dependencies: React, Vite, Tailwind, Recharts, etc.
✅ Time: 3-5 minutes
```

---

## ▶️ Running the Application

### Method 1: Using PowerShell Script (Windows)

```powershell
# Start all services at once
.\run-all.ps1

# The script will:
# - Start MongoDB
# - Launch Backend (port 5000)
# - Launch ML Service (port 8000)
# - Launch Frontend (port 3000)
# - Monitor all services

# Stop all services: Press Ctrl+C
```

### Method 2: Manual Start (All Platforms)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Expected output:
# 🚀 Server running on port 5000
# 📊 MongoDB connected successfully
```

**Terminal 2 - ML Service:**
```bash
cd ml_service

# Activate virtual environment first
# Windows: .\venv\Scripts\Activate.ps1
# Linux/macOS: source venv/bin/activate

python main.py

# Or use uvicorn
uvicorn main:app --reload --port 8000

# Expected output:
# ✅ ML Model loaded successfully
# 🌐 Uvicorn running on http://0.0.0.0:8000
```

**Terminal 3 - Frontend:**
```bash
cd Frontend
npm run dev

# Expected output:
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

### Method 3: Using Batch Scripts (Windows)

```batch
# Backend
cd backend
start-backend.bat

# ML Service
cd ml_service
start.bat

# Frontend
cd Frontend
npm run dev
```

### Method 4: Production Mode

```bash
# Backend (production)
cd backend
npm start

# ML Service (production)
cd ml_service
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (build and serve)
cd Frontend
npm run build
npm run preview
```

### Verification

Test if all services are running:

```bash
# Test Backend
curl http://localhost:5000/api/health

# Test ML Service
curl http://localhost:8000/health

# Test Frontend
# Open browser: http://localhost:3000
```

---

## 🗂️ Project Structure

```
Drop2Smart/
│
├── Frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── Footer.jsx           # Footer component
│   │   │   ├── LocationSection.jsx  # Location detection
│   │   │   ├── Loader.jsx           # Loading spinner
│   │   │   ├── Toast.jsx            # Notification system
│   │   │   ├── HowItWorks.jsx       # Info section
│   │   │   ├── Impact.jsx           # Environmental impact
│   │   │   └── About.jsx            # About section
│   │   │
│   │   ├── pages/                    # Application Pages
│   │   │   ├── Landing.jsx          # Home page
│   │   │   ├── Assessment.jsx       # Main assessment form
│   │   │   ├── Results.jsx          # Results page
│   │   │   └── AssessmentResult.jsx # Detailed results
│   │   │
│   │   ├── utils/                    # Utility Functions
│   │   │   ├── apiUtils.js          # API integration
│   │   │   ├── envUtils.js          # Environment config
│   │   │   └── validation.js        # Form validation
│   │   │
│   │   ├── context/                  # React Context
│   │   │   └── AppContext.jsx       # Global state
│   │   │
│   │   ├── assets/                   # Static Assets
│   │   ├── App.jsx                   # Main App component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── public/                        # Public Static Files
│   ├── .env                           # Environment variables
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind config
│   └── index.html                     # HTML template
│
├── backend/                           # Express Backend Server
│   ├── routes/                        # API Routes
│   │   ├── assessments.js            # Assessment endpoints
│   │   ├── locations.js              # Location services
│   │   ├── ml.js                     # ML service proxy
│   │   └── uploads.js                # File upload
│   │
│   ├── models/                        # MongoDB Models
│   │   └── Assessment.js             # Assessment schema
│   │
│   ├── config/                        # Configuration
│   │   └── database.js               # MongoDB connection
│   │
│   ├── uploads/                       # Uploaded Files
│   │   ├── *.jpg                     # Original images
│   │   ├── *_opt.jpg                 # Optimized images
│   │   └── *_thumb.jpg               # Thumbnails
│   │
│   ├── .env                           # Environment variables
│   ├── server.js                      # Main server file
│   └── package.json                   # Dependencies
│
├── ml_service/                        # ML Service (FastAPI)
│   ├── models/                        # ML Models
│   │   ├── ksat_model.pkl            # Trained Ksat model
│   │   └── model_metadata.json       # Model info
│   │
│   ├── data/                          # Data Files
│   │   └── groundwater_level_data.json # Groundwater DB
│   │
│   ├── main.py                        # FastAPI application
│   ├── soil_predictor.py              # Ksat prediction
│   ├── groundwater_service.py         # Groundwater analysis
│   ├── rainfall_service.py            # Rainfall data
│   ├── ksat_model_trainer.py          # Model training
│   ├── utils.py                       # Helper functions
│   ├── requirements.txt               # Python dependencies
│   ├── start.py                       # Startup script
│   ├── start.bat                      # Windows starter
│   └── start.sh                       # Linux/macOS starter
│
├── docs/                              # Documentation
│   └── GOOGLE_MAPS_API_SETUP.md      # API setup guide
│
├── .git/                              # Git repository
├── .gitignore                         # Git ignore rules
├── setup.ps1                          # Automated setup (Windows)
├── run-all.ps1                        # Run all services (Windows)
├── TROUBLESHOOTING.md                 # Troubleshooting guide
└── README.md                          # This file
```

---

## ⚙️ Configuration

### Backend Configuration (`.env`)

Create `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/drop2smart

# MongoDB Production (Atlas)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drop2smart

# ML Service URL
ML_SERVICE_URL=http://localhost:8000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100        # Max requests per window

# File Upload
MAX_FILE_SIZE=5242880              # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info                     # debug, info, warn, error
```

### Frontend Configuration (`.env`)

Create `Frontend/.env`:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# ML Service URL
VITE_ML_SERVICE_URL=http://localhost:8000

# Application Settings
VITE_APP_NAME=Drop2Smart
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ML_PREDICTIONS=true
VITE_ENABLE_IMAGE_UPLOAD=true
VITE_ENABLE_LOCATION_DETECTION=true

# Google Maps API (Optional)
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Debug Mode
VITE_DEBUG_MODE=false
```

### ML Service Configuration

The ML service uses the following default settings (can be modified in `main.py`):

```python
# Server Configuration
HOST = "0.0.0.0"
PORT = 8000
RELOAD = True  # Set to False in production

# Model Paths
MODEL_PATH = "models/ksat_model.pkl"
GROUNDWATER_DATA_PATH = "data/groundwater_level_data.json"

# SoilGrids API
SOILGRIDS_API_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
SOILGRIDS_DEPTH = "0-5cm"
SOILGRIDS_VALUE_TYPE = "mean"

# Model Configuration
KSAT_MIN = 0.5  # mm/hr
KSAT_MAX = 350.0  # mm/hr
CONFIDENCE_BASE = 0.8
```

---

## 🔌 API Endpoints

### Backend API (Port 5000)

#### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T10:30:00.000Z",
  "uptime": 12345,
  "mongodb": "connected"
}
```

#### Assessments

**Create Assessment**
```http
POST /api/assessments
Content-Type: application/json

{
  "buildingDetails": {
    "roofArea": 1500,
    "roofSlope": 15,
    "roofMaterial": "RCC",
    "buildingHeight": 30
  },
  "location": {
    "address": "Connaught Place, New Delhi",
    "coordinates": {
      "latitude": 28.6315,
      "longitude": 77.2167
    }
  },
  "environmentalData": {
    "annualRainfall": 650
  },
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210"
  }
}
```

**Response:**
```json
{
  "success": true,
  "assessmentId": "ASM-1696234567890",
  "message": "Assessment created successfully",
  "estimatedTime": "30 seconds"
}
```

**Get Assessment by ID**
```http
GET /api/assessments/:id
```

**Get Assessment Status**
```http
GET /api/assessments/:id/status
```

#### Location Services

**Get Cities Database**
```http
GET /api/locations/cities
```

**Find Nearest City**
```http
GET /api/locations/nearest-city?latitude=28.7041&longitude=77.1025
```

**Validate Coordinates**
```http
POST /api/locations/validate-coordinates
Content-Type: application/json

{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

#### File Upload

**Upload Image**
```http
POST /api/uploads/image
Content-Type: multipart/form-data

file: [binary image data]
```

**Response:**
```json
{
  "success": true,
  "fileId": "uuid-here",
  "filename": "rooftop.jpg",
  "paths": {
    "original": "/uploads/uuid_original.jpg",
    "optimized": "/uploads/uuid_opt.jpg",
    "thumbnail": "/uploads/uuid_thumb.jpg"
  }
}
```

### ML Service API (Port 8000)

#### Soil Predictions

**Predict Ksat**
```http
POST /predict-ksat
Content-Type: application/json

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

**Batch Predict Ksat**
```http
POST /batch-predict-ksat
Content-Type: application/json

[
  {"latitude": 28.7041, "longitude": 77.1025},
  {"latitude": 28.6139, "longitude": 77.2090}
]
```

#### Groundwater Services

**Get Groundwater Data**
```http
GET /groundwater?state=Delhi&district=North Delhi&location=Narela
```

**Get Groundwater Analysis**
```http
GET /groundwater-analysis?state=Delhi&district=North Delhi&location=Narela
```

**Search Locations**
```http
GET /locations-search?query=Narela
```

**Get Groundwater Statistics**
```http
GET /groundwater-stats
```

#### Utility Endpoints

**Health Check**
```http
GET /health
```

**Model Information**
```http
GET /model-info
```

**Get Soil Data (Raw)**
```http
GET /soil-data?latitude=28.7041&longitude=77.1025
```

**API Documentation**
```http
GET /docs          # Swagger UI
GET /redoc         # ReDoc UI
```

---

## 🗄️ Database Schema

### Assessment Collection

```javascript
{
  // Unique Identifiers
  _id: ObjectId,                      // MongoDB auto-generated
  assessmentId: String,               // Public ID: "ASM-timestamp"
  
  // Building Details
  buildingDetails: {
    roofArea: Number,                 // Square feet
    roofSlope: Number,                // Degrees (0-90)
    roofMaterial: String,             // "RCC" | "Metal" | "Tile" | "Asbestos"
    buildingHeight: Number,           // Feet
    roofType: String                  // Optional: "Flat" | "Sloped"
  },
  
  // Location Information
  location: {
    address: String,                  // Full address
    city: String,                     // City name
    state: String,                    // State name
    country: String,                  // Default: "India"
    coordinates: {
      latitude: Number,               // -90 to 90
      longitude: Number,              // -180 to 180
      accuracy: Number                // Meters (if GPS)
    },
    detectionMethod: String           // "gps" | "ip" | "manual"
  },
  
  // Environmental Data
  environmentalData: {
    annualRainfall: Number,           // Millimeters
    rainfallSource: String,           // "user" | "database"
    soilData: {
      ksat: Number,                   // mm/hr (from ML prediction)
      confidence: Number,             // 0-1
      soilType: String,               // Primary soil type
      clay: Number,                   // Percentage
      silt: Number,                   // Percentage
      sand: Number,                   // Percentage
      organicCarbon: Number,          // g/kg
      textureClass: String,           // USDA classification
      infiltrationCategory: String,   // "High" | "Moderate" | "Low"
      suitabilityScore: Number        // 0-100
    },
    groundwaterData: {                // Optional: if available
      annualReplenishableGW: Number,
      netAvailability: Number,
      totalDraft: Number,
      stagePercent: Number,
      category: String,               // "Safe" | "Semi-critical" etc.
      riskLevel: String,
      riskScore: Number
    }
  },
  
  // Results
  results: {
    // Harvesting Potential
    harvestingPotential: {
      annualCollection: Number,       // Liters
      monthlyCollection: [            // Array of 12 numbers
        {
          month: String,
          rainfall: Number,
          collection: Number
        }
      ],
      runoffCoefficient: Number,      // 0-1
      collectionEfficiency: Number,   // Percentage
      firstFlushLoss: Number          // Liters
    },
    
    // System Recommendations
    systemRecommendations: {
      tankSize: Number,               // Liters
      tankType: String,
      pipeSize: Number,               // mm diameter
      pipeMaterial: String,
      filterType: String,
      filterSize: String,
      pumpRequired: Boolean,
      pumpSpecification: String,
      firstFlushDiverter: String
    },
    
    // Financial Analysis
    financialAnalysis: {
      estimatedCost: Number,          // INR
      componentCosts: {
        tank: Number,
        pipes: Number,
        filter: Number,
        pump: Number,
        installation: Number,
        miscellaneous: Number
      },
      annualSavings: Number,          // INR
      paybackPeriod: Number,          // Years
      roi: Number,                    // Percentage
      tenYearProjection: Number       // INR
    },
    
    // Environmental Impact
    environmentalImpact: {
      annualWaterSavings: Number,     // Liters
      householdDemandMet: Number,     // Percentage
      co2Avoided: Number,             // kg CO2
      energySavings: Number,          // kWh
      groundwaterRecharge: Number     // Liters
    }
  },
  
  // Images
  images: [
    {
      fileId: String,                 // UUID
      filename: String,
      paths: {
        original: String,
        optimized: String,
        thumbnail: String
      },
      uploadedAt: Date
    }
  ],
  
  // Contact Information
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  
  // Metadata
  status: String,                     // "pending" | "processing" | "completed" | "failed"
  processingTime: Number,             // Seconds
  createdAt: Date,                    // Auto-generated
  updatedAt: Date,                    // Auto-updated
  ipAddress: String,                  // Request IP
  userAgent: String                   // Browser info
}
```

### Indexes

```javascript
// For faster queries
db.assessments.createIndex({ assessmentId: 1 }, { unique: true });
db.assessments.createIndex({ createdAt: -1 });
db.assessments.createIndex({ "location.city": 1 });
db.assessments.createIndex({ "contactInfo.email": 1 });
```

---

## 🤖 Machine Learning Models

### Ksat Prediction Model

**Model Type**: XGBoost Regressor

**Purpose**: Predict saturated hydraulic conductivity (Ksat) of soil based on composition

**Training Data**:
- 1000+ synthetic samples (can be replaced with real data)
- Features: Clay%, Silt%, Sand%, Organic Carbon, Texture Class
- Target: Ksat (mm/hr)

**Feature Engineering**:
```python
Features = [
    "clay",           # 0-100% (inverse relationship with Ksat)
    "silt",           # 0-100% (moderate impact)
    "sand",           # 0-100% (strong positive relationship)
    "organicCarbon",  # 0-5 g/kg (moderate positive impact)
    "textureEncoded"  # 0-11 (USDA texture class encoding)
]
```

**Hyperparameters** (Optuna-optimized):
```python
{
    "n_estimators": 200-300,
    "max_depth": 5-8,
    "learning_rate": 0.05-0.1,
    "subsample": 0.7-0.9,
    "colsample_bytree": 0.7-0.9,
    "min_child_weight": 1-5,
    "gamma": 0.0-0.3
}
```

**Performance Metrics**:
- RMSE: ~6.59 mm/hr
- R² Score: 0.85+
- MAE: ~4.2 mm/hr
- Normalized RMSE: 0.08

**Confidence Calculation**:
```python
confidence = base_confidence * (1 - uncertainty_factor)
where:
    uncertainty_factor = normalized_distance_from_training_data
    base_confidence = 0.8
```

### Soil Texture Classification

**Method**: USDA Soil Texture Triangle

**Classes** (12 total):
1. Sand
2. Loamy Sand
3. Sandy Loam
4. Loam
5. Silt Loam
6. Silt
7. Sandy Clay Loam
8. Clay Loam
9. Silty Clay Loam
10. Sandy Clay
11. Silty Clay
12. Clay

**Classification Rules**:
```python
# Example rules
if clay >= 40:
    if sand <= 45:
        return "Clay"
    elif sand <= 65:
        return "Sandy Clay"
        
if clay < 27.5:
    if sand >= 85:
        return "Sand"
    elif sand >= 70:
        return "Loamy Sand"
        
# ... more rules based on USDA triangle
```

### Groundwater Risk Analysis

**Risk Categorization**:
```python
stage_percent = (total_draft / net_availability) * 100

if stage_percent < 70:
    category = "Safe"
    risk_level = "Low"
elif stage_percent < 90:
    category = "Semi-critical"
    risk_level = "Medium"
elif stage_percent < 100:
    category = "Critical"
    risk_level = "High"
else:
    category = "Over-exploited"
    risk_level = "Critical"
```

**Risk Score Calculation**:
```python
risk_score = min(100, (stage_percent / 100) * 100)
```

---

## 🌐 Data Sources

### SoilGrids v2.0 API

**Provider**: ISRIC - World Soil Information  
**URL**: https://rest.isric.org/soilgrids/v2.0/  
**Resolution**: 250m  
**Coverage**: Global  

**Data Retrieved**:
- Clay content (% at 0-5cm depth)
- Silt content (% at 0-5cm depth)
- Sand content (% at 0-5cm depth)
- Organic carbon density (g/kg)
- Soil pH
- Bulk density

**API Limitations**:
- Rate limit: ~1000 requests/hour
- Timeout: 10 seconds
- Free to use (no API key required)

**Example Request**:
```python
GET https://rest.isric.org/soilgrids/v2.0/properties/query
    ?lat=28.7041
    &lon=77.1025
    &property=clay&property=silt&property=sand&property=soc
    &depth=0-5cm
    &value=mean
```

### OpenStreetMap Nominatim

**Purpose**: Geocoding and reverse geocoding  
**URL**: https://nominatim.openstreetmap.org/  
**Free**: Yes, with usage policy  

**Usage**:
- Convert addresses to coordinates
- Reverse geocode coordinates to addresses
- Find nearest cities

**Rate Limiting**:
- 1 request per second
- User-Agent header required

### Indian Cities Database

**Custom Database**: 100+ Indian cities with:
- City name
- State
- Latitude/Longitude
- Annual rainfall (mm)
- Population
- Climate zone

**Format**:
```json
[
  {
    "city": "New Delhi",
    "state": "Delhi",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "annualRainfall": 790,
    "population": 32941000,
    "climateZone": "Semi-arid"
  }
]
```

### Groundwater Database

**Coverage**: Delhi and Haryana  
**Source**: Custom curated database  
**Structure**: State → District → Location  

**Data Points**:
- Annual replenishable groundwater (ham)
- Net groundwater availability (ham)
- Total groundwater draft (ham)
- Stage of groundwater extraction (%)
- Category (Safe/Semi-critical/Critical/Over-exploited)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test

# Run specific test suite
npm test -- --testPathPattern=assessments

# Run with coverage
npm test -- --coverage
```

**Test Structure**:
```
backend/tests/
├── unit/
│   ├── models.test.js
│   └── utils.test.js
├── integration/
│   ├── api.test.js
│   └── database.test.js
└── e2e/
    └── assessment-flow.test.js
```

### ML Service Tests

```bash
cd ml_service

# Activate virtual environment first
# Windows: .\venv\Scripts\Activate.ps1
# Linux/macOS: source venv/bin/activate

# Run tests
python -m pytest

# Run with coverage
python -m pytest --cov=.

# Run specific test
python test_service.py
```

**Test Files**:
- `test_service.py` - API endpoint tests
- `test_rainfall.py` - Rainfall service tests
- `tests/test_model.py` - Model prediction tests

### Frontend Tests

```bash
cd Frontend
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Manual Testing

**Test Checklist**:
- [ ] Upload rooftop image
- [ ] GPS location detection
- [ ] IP-based location detection
- [ ] Manual coordinate entry
- [ ] Form validation (all fields)
- [ ] Submit assessment
- [ ] View results page
- [ ] Download PDF report
- [ ] Chart rendering
- [ ] Mobile responsiveness
- [ ] Dark mode toggle

---

## 🚀 Deployment

### Production Deployment

#### Frontend (Static Hosting)

**Build for Production**:
```bash
cd Frontend
npm run build

# Output: Frontend/dist/
```

**Deploy Options**:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3 + CloudFront**: Upload `dist` folder

**Environment Variables** (Production):
```env
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_ML_SERVICE_URL=https://ml.yourdomain.com
VITE_ENABLE_ML_PREDICTIONS=true
```

#### Backend (Node.js Hosting)

**Deploy Options**:
- **Heroku**:
  ```bash
  heroku create drop2smart-api
  git push heroku main
  heroku config:set MONGODB_URI=your_mongodb_atlas_uri
  ```

- **AWS EC2**:
  ```bash
  # SSH into EC2 instance
  ssh -i key.pem ubuntu@your-ec2-ip
  
  # Install dependencies
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  
  # Clone and setup
  git clone https://github.com/yourusername/drop2smart.git
  cd drop2smart/backend
  npm install
  npm install -g pm2
  
  # Start with PM2
  pm2 start server.js --name drop2smart-api
  pm2 startup
  pm2 save
  ```

- **DigitalOcean App Platform**: Connect GitHub repo

**MongoDB Atlas** (Cloud Database):
```bash
# Sign up at https://www.mongodb.com/cloud/atlas
# Create cluster
# Get connection string
# Update .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drop2smart
```

#### ML Service (Python Hosting)

**Deploy Options**:
- **Railway**:
  ```bash
  railway login
  railway init
  railway up
  ```

- **Render**:
  - Connect GitHub repo
  - Select "Python" environment
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

- **AWS Lambda** (with Mangum):
  ```python
  from mangum import Mangum
  from main import app
  
  handler = Mangum(app)
  ```

### Docker Deployment

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
      
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/drop2smart
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - mongodb
      
  ml-service:
    build: ./ml_service
    ports:
      - "8000:8000"
      
  frontend:
    build: ./Frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_BACKEND_URL=http://localhost:5000
      - VITE_ML_SERVICE_URL=http://localhost:8000
    depends_on:
      - backend
      - ml-service

volumes:
  mongo-data:
```

**Build and Run**:
```bash
docker-compose up --build -d
```

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Failed

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solutions**:
- ✅ Check if MongoDB service is running:
  ```bash
  # Windows
  net start MongoDB
  
  # Linux
  sudo systemctl status mongod
  sudo systemctl start mongod
  ```
- ✅ Verify connection string in `backend/.env`
- ✅ Check firewall settings
- ✅ Ensure MongoDB is listening on port 27017

#### 2. ML Service Not Loading

**Error**: `Model file not found`

**Solutions**:
- ✅ Train the model:
  ```bash
  cd ml_service
  python ksat_model_trainer.py
  ```
- ✅ Check if `models/ksat_model.pkl` exists
- ✅ Verify Python version (should be 3.8-3.11)
- ✅ Reinstall dependencies:
  ```bash
  pip install -r requirements.txt --force-reinstall
  ```

#### 3. CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
- ✅ Check backend CORS configuration in `server.js`
- ✅ Verify `VITE_BACKEND_URL` in `Frontend/.env`
- ✅ Ensure backend is running on correct port (5000)
- ✅ For development, backend allows `origin: '*'`

#### 4. SoilGrids API Timeout

**Error**: `SoilGrids API request timeout`

**Solutions**:
- ✅ Check internet connection
- ✅ Service automatically falls back to default values
- ✅ Retry after some time
- ✅ Check SoilGrids API status: https://soilgrids.org

#### 5. File Upload Issues

**Error**: `File too large` or `Invalid file type`

**Solutions**:
- ✅ Check file size (max 5MB)
- ✅ Verify file format (JPG, PNG, JPEG only)
- ✅ Ensure `uploads/` directory exists:
  ```bash
  mkdir backend/uploads
  ```
- ✅ Check disk space

#### 6. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
- ✅ Find and kill process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/macOS
  lsof -i :5000
  kill -9 <PID>
  ```
- ✅ Use a different port in `.env`

#### 7. npm/pip Install Failures

**Solutions**:
- ✅ Clear cache:
  ```bash
  # npm
  npm cache clean --force
  
  # pip
  pip cache purge
  ```
- ✅ Use specific registry:
  ```bash
  npm install --registry=https://registry.npmjs.org/
  ```
- ✅ Run as administrator/sudo (if permission issues)

#### 8. Frontend Build Errors

**Error**: `Module not found` or `Cannot find module`

**Solutions**:
- ✅ Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- ✅ Check Node.js version (should be 18+)
- ✅ Clear Vite cache:
  ```bash
  rm -rf .vite
  ```

### Debugging Tools

**Backend Debugging**:
```bash
# Enable debug mode
DEBUG=* npm run dev

# Check logs
tail -f logs/combined.log
```

**ML Service Debugging**:
```bash
# Run with verbose logging
uvicorn main:app --reload --log-level debug

# Check logs
tail -f ml_service.log
```

**MongoDB Debugging**:
```bash
# Connect to MongoDB shell
mongosh

# Check databases
show dbs
use drop2smart
db.assessments.find().pretty()
```

### Getting Help

If you encounter issues not covered here:

1. 📖 Check `TROUBLESHOOTING.md` for more detailed solutions
2. 🐛 Open an issue on GitHub with:
   - Error message (full stack trace)
   - Steps to reproduce
   - System information (OS, Node version, Python version)
3. 💬 Contact the development team
4. 📧 Email: support@drop2smart.com

---

## 🤝 Contributing

We welcome contributions to Drop2Smart! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/yourusername/drop2smart.git
   cd drop2smart
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, commented code
   - Follow existing code style
   - Add tests for new features

4. **Test thoroughly**
   ```bash
   # Run all tests
   cd backend && npm test
   cd ../ml_service && python -m pytest
   cd ../Frontend && npm test
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Describe your changes
   - Link relevant issues

### Contribution Guidelines

#### Code Style

**JavaScript/React**:
- Use ES6+ features
- 2 spaces for indentation
- Semicolons required
- Use `const` over `let`, avoid `var`
- Descriptive variable names (camelCase)

**Python**:
- Follow PEP 8
- 4 spaces for indentation
- Type hints encouraged
- Descriptive function names (snake_case)

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

#### Areas for Contribution

- 🐛 **Bug Fixes**: Check GitHub issues
- ✨ **New Features**: 
  - Additional location detection methods
  - More ML models (rainfall prediction)
  - Enhanced visualizations
  - Mobile app integration
- 📚 **Documentation**: 
  - Improve README
  - Add tutorials
  - API documentation
- 🧪 **Testing**: Increase test coverage
- 🌐 **Localization**: Add language support
- 🎨 **UI/UX**: Design improvements

### Code Review Process

1. Automated checks run (linting, tests)
2. Maintainers review code
3. Feedback and requested changes
4. Approval and merge

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Drop2Smart Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Data & APIs
- **ISRIC - World Soil Information** for SoilGrids v2.0 API
- **OpenStreetMap** for geocoding services
- **OpenMeteo** for rainfall data API

### Technologies
- **XGBoost** team for the gradient boosting library
- **FastAPI** community for the modern Python web framework
- **React** team for the amazing frontend library
- **MongoDB** for the robust database solution

### Inspiration
- **Central Ground Water Board (CGWB), India** for groundwater data insights
- **Ministry of Jal Shakti** for water conservation initiatives
- **Sustainable Development Goals (SDG)** - particularly SDG 6: Clean Water and Sanitation

### Contributors
- [Bhavyaa](https://github.com/bhavyaa-1001) - Project Lead & Full Stack Developer
- [Contributors](https://github.com/bhavyaa-1001/Drop2Smart/graphs/contributors) - All amazing contributors

### Special Thanks
- Open source community
- Beta testers and early adopters
- Everyone passionate about water conservation 💧

---

## 📞 Contact & Support

### Project Links
- **GitHub Repository**: https://github.com/bhavyaa-1001/Drop2Smart
- **Issues Tracker**: https://github.com/bhavyaa-1001/Drop2Smart/issues
- **Documentation**: [See docs folder](./docs/)

### Get in Touch
- **Email**: support@drop2smart.com
- **Twitter**: @Drop2Smart (planned)
- **LinkedIn**: [Drop2Smart Project](https://linkedin.com/company/drop2smart) (planned)

### Support
- 📚 **Documentation**: Check this README and `docs/` folder
- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Open an issue with label "enhancement"
- ❓ **Questions**: Use GitHub Discussions

---

## 🗺️ Roadmap

### Version 1.1 (Q1 2026)
- [ ] Google Maps integration for location selection
- [ ] Enhanced PDF reports with more charts
- [ ] User authentication and saved assessments
- [ ] Email notifications for completed assessments
- [ ] Mobile-responsive improvements

### Version 1.2 (Q2 2026)
- [ ] Rainfall prediction using ML
- [ ] Historical data analysis
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Community features (share assessments)
- [ ] Government scheme integration

### Version 2.0 (Q3 2026)
- [ ] Mobile app (React Native)
- [ ] Real-time monitoring dashboard
- [ ] IoT integration for actual collection tracking
- [ ] Advanced analytics and insights
- [ ] Marketplace for RWH components

---

<div align="center">

## 🌟 Star Us on GitHub! 🌟

If you find Drop2Smart useful, please consider giving us a ⭐ on GitHub!

**Built with ❤️ for sustainable water management**

🌧️ **Every Drop Counts** 💧

</div>

---

**Last Updated**: October 2, 2025  
**Version**: 1.0.0  
**Status**: Active Development
