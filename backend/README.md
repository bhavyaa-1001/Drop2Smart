# Drop2Smart Backend Server

<div align="center">

**Express.js + MongoDB Backend Service for Drop2Smart Platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Server](#-running-the-server)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Error Handling](#-error-handling)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

The Drop2Smart Backend is a RESTful API server built with Express.js and MongoDB that handles:

- 🏠 **Assessment Management**: Create, read, update assessment data
- 📁 **File Upload**: Handle rooftop images with optimization
- 📍 **Location Services**: Geocoding, city database, coordinate validation
- 🤖 **ML Integration**: Proxy requests to ML service for predictions
- 💾 **Data Persistence**: MongoDB storage for all assessment data
- 🔒 **Security**: CORS, rate limiting, input validation
- 📊 **Logging**: Request logging with Morgan

---

## 🚀 Features

### Core Functionality

✅ **RESTful API** with Express.js  
✅ **MongoDB Integration** with Mongoose ODM  
✅ **File Upload** with Multer  
✅ **Image Processing** with Sharp (optimize, thumbnails)  
✅ **CORS Enabled** for frontend communication  
✅ **Rate Limiting** to prevent abuse  
✅ **Security Headers** with Helmet  
✅ **Request Logging** with Morgan  
✅ **Error Handling** middleware  
✅ **Environment Configuration** with dotenv  
✅ **Data Validation** with Joi  
✅ **Compression** for responses  

### API Endpoints

- `/api/assessments` - Assessment CRUD operations
- `/api/locations` - Location services (cities, validation)
- `/api/ml` - ML service proxy
- `/api/uploads` - File upload handling
- `/api/health` - Health check endpoint

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Web framework |
| **MongoDB** | 6.0+ | Database |
| **Mongoose** | 8.0.3 | MongoDB ODM |
| **Multer** | 1.4.5 | File upload handling |
| **Sharp** | 0.33.1 | Image processing |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.0 | HTTP request logger |
| **Joi** | 17.11.0 | Data validation |
| **dotenv** | 16.3.1 | Environment variables |
| **express-rate-limit** | 7.1.5 | API rate limiting |
| **Compression** | 1.7.4 | Response compression |
| **Axios** | 1.6.2 | HTTP client for ML service |
| **UUID** | 9.0.1 | Unique ID generation |

---

## 📋 Prerequisites

Before installing, ensure you have:

- **Node.js**: v18.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0 or higher (comes with Node.js)
- **MongoDB**: v6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git**: For cloning the repository

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
mongod --version  # Should show v6.x.x or higher
```

---

## 🔧 Installation

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install
```

**What gets installed:**
```
✅ express, cors, helmet, morgan
✅ mongoose, mongodb
✅ multer, sharp
✅ joi, express-validator
✅ axios, uuid
✅ dotenv, compression
✅ express-rate-limit
✅ nodemon (dev dependency)
✅ jest, eslint (dev dependencies)
```

**Expected time**: 2-3 minutes  
**Expected output**: ~150 packages installed

### Step 3: Create Environment File

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually (see Configuration section).

### Step 4: Create Uploads Directory

```bash
# Windows
mkdir uploads

# Linux/macOS
mkdir -p uploads
```

This directory will store uploaded images.

---

## ⚙️ Configuration

Create a `.env` file in the backend directory with the following configuration:

```env
#==================================================
# SERVER CONFIGURATION
#==================================================
PORT=5000
NODE_ENV=development

#==================================================
# DATABASE CONFIGURATION
#==================================================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/drop2smart

# MongoDB Atlas (Production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drop2smart?retryWrites=true&w=majority

#==================================================
# ML SERVICE CONFIGURATION
#==================================================
ML_SERVICE_URL=http://localhost:8000

#==================================================
# SECURITY CONFIGURATION
#==================================================
# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345678

#==================================================
# CORS CONFIGURATION
#==================================================
# Development
CORS_ORIGIN=http://localhost:3000

# Production (comma-separated for multiple origins)
# CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

#==================================================
# RATE LIMITING
#==================================================
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100          # Max requests per window

#==================================================
# FILE UPLOAD CONFIGURATION
#==================================================
MAX_FILE_SIZE=5242880                # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png

#==================================================
# LOGGING
#==================================================
LOG_LEVEL=info                       # debug | info | warn | error

#==================================================
# IMAGE PROCESSING
#==================================================
IMAGE_QUALITY=80                     # JPEG quality (0-100)
THUMBNAIL_SIZE=200                   # Thumbnail width in pixels
OPTIMIZED_SIZE=1200                  # Optimized image width in pixels
```

### Configuration Options Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | Yes |
| `NODE_ENV` | Environment | development | Yes |
| `MONGODB_URI` | MongoDB connection string | localhost | Yes |
| `ML_SERVICE_URL` | ML service endpoint | localhost:8000 | Yes |
| `JWT_SECRET` | Secret for JWT tokens | - | Optional |
| `CORS_ORIGIN` | Allowed frontend origins | localhost:3000 | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window | 15 min | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 5MB | No |
| `LOG_LEVEL` | Logging verbosity | info | No |

---

## ▶️ Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

This starts the server with **nodemon**, which automatically restarts when you make changes.

**Expected Output:**
```
🚀 Server running on port 5000
📊 MongoDB connected successfully
🌐 CORS enabled for: http://localhost:3000
🔒 Rate limiting: 100 requests per 15 minutes
📁 Uploads directory ready
✅ All routes registered
```

### Production Mode

```bash
npm start
```

This starts the server with Node.js directly (no auto-restart).

### Check Server Status

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-02T10:30:00.000Z",
  "uptime": 12345,
  "mongodb": "connected"
}
```

### Stop the Server

Press `Ctrl + C` in the terminal running the server.

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000
Production:  https://api.yourdomain.com
```

### Authentication

Currently, the API is open (no authentication required). To add authentication:

1. Uncomment JWT middleware in `server.js`
2. Add authentication routes
3. Include JWT token in request headers:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Endpoints

#### Health Check

**GET** `/api/health`

Check if the server is running and database is connected.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T10:30:00.000Z",
  "uptime": 12345,
  "mongodb": "connected",
  "version": "1.0.0"
}
```

---

#### Assessments API

**POST** `/api/assessments`

Create a new rainwater harvesting assessment.

**Request Body:**
```json
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
  },
  "images": ["uuid-1", "uuid-2"]
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

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request data
- `500` - Server error

---

**GET** `/api/assessments/:id`

Retrieve an assessment by ID.

**Parameters:**
- `id` (path) - Assessment ID (e.g., "ASM-1696234567890")

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "ASM-1696234567890",
    "buildingDetails": { ... },
    "location": { ... },
    "results": { ... },
    "status": "completed",
    "createdAt": "2025-10-02T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Assessment not found
- `500` - Server error

---

**GET** `/api/assessments/:id/status`

Check processing status of an assessment.

**Response:**
```json
{
  "assessmentId": "ASM-1696234567890",
  "status": "completed",
  "progress": 100,
  "message": "Assessment processing completed"
}
```

**Status Values:**
- `pending` - Waiting to be processed
- `processing` - Currently being processed
- `completed` - Successfully completed
- `failed` - Processing failed

---

#### Location Services API

**GET** `/api/locations/cities`

Get the Indian cities database with rainfall data.

**Query Parameters:**
- `state` (optional) - Filter by state name
- `search` (optional) - Search city name

**Response:**
```json
{
  "success": true,
  "count": 100,
  "cities": [
    {
      "city": "New Delhi",
      "state": "Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "annualRainfall": 790
    }
  ]
}
```

---

**GET** `/api/locations/nearest-city`

Find the nearest city to given coordinates.

**Query Parameters:**
- `latitude` (required) - Latitude coordinate
- `longitude` (required) - Longitude coordinate

**Example:**
```
GET /api/locations/nearest-city?latitude=28.7041&longitude=77.1025
```

**Response:**
```json
{
  "success": true,
  "city": {
    "city": "New Delhi",
    "state": "Delhi",
    "distance": 5.2,
    "annualRainfall": 790
  }
}
```

---

**POST** `/api/locations/validate-coordinates`

Validate if coordinates are within India.

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

**Response:**
```json
{
  "valid": true,
  "country": "India",
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

---

#### File Upload API

**POST** `/api/uploads/image`

Upload a rooftop image (multipart/form-data).

**Form Data:**
- `file` - Image file (JPG, PNG, JPEG)
- Max size: 5MB

**Response:**
```json
{
  "success": true,
  "fileId": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "rooftop.jpg",
  "paths": {
    "original": "/uploads/123e4567_original.jpg",
    "optimized": "/uploads/123e4567_opt.jpg",
    "thumbnail": "/uploads/123e4567_thumb.jpg"
  },
  "sizes": {
    "original": 2048576,
    "optimized": 512000,
    "thumbnail": 51200
  }
}
```

**Image Processing:**
- **Original**: Stored as-is
- **Optimized**: Resized to max 1200px width, JPEG quality 80
- **Thumbnail**: 200x200px

---

#### ML Service Proxy API

**POST** `/api/ml/predict-ksat`

Proxy request to ML service for Ksat prediction.

**Request Body:**
```json
{
  "latitude": 28.7041,
  "longitude": 77.1025
}
```

**Response:** (from ML service)
```json
{
  "ksat": 45.23,
  "confidence": 0.85,
  "soil_properties": { ... }
}
```

---

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `DATABASE_ERROR` - MongoDB operation failed
- `FILE_UPLOAD_ERROR` - File upload failed
- `ML_SERVICE_ERROR` - ML service unavailable
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 📁 Project Structure

```
backend/
│
├── config/                      # Configuration files
│   └── database.js             # MongoDB connection setup
│
├── models/                      # Mongoose models
│   └── Assessment.js           # Assessment schema & model
│
├── routes/                      # Express routes
│   ├── assessments.js          # Assessment endpoints
│   ├── locations.js            # Location services
│   ├── ml.js                   # ML service proxy
│   └── uploads.js              # File upload handling
│
├── middleware/                  # Custom middleware (optional)
│   ├── auth.js                 # Authentication (if needed)
│   ├── validation.js           # Request validation
│   └── errorHandler.js         # Error handling
│
├── utils/                       # Utility functions (optional)
│   ├── calculations.js         # RWH calculations
│   ├── imageProcessor.js       # Image processing helpers
│   └── logger.js               # Custom logger
│
├── uploads/                     # Uploaded files directory
│   ├── *.jpg                   # Original images
│   ├── *_opt.jpg               # Optimized images
│   └── *_thumb.jpg             # Thumbnails
│
├── tests/                       # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── logs/                        # Log files (if using file logging)
│   ├── combined.log
│   └── error.log
│
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── server.js                    # Main server file
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Locked dependencies
└── README.md                    # This file
```

---

## 🗄️ Database Schema

### Assessment Model

**Collection**: `assessments`

**Schema:**
```javascript
{
  assessmentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ASM-${Date.now()}`
  },
  
  buildingDetails: {
    roofArea: { type: Number, required: true },      // sq ft
    roofSlope: { type: Number, required: true },     // degrees
    roofMaterial: {
      type: String,
      required: true,
      enum: ['RCC', 'Metal', 'Tile', 'Asbestos']
    },
    buildingHeight: { type: Number, required: true } // feet
  },
  
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  
  environmentalData: {
    annualRainfall: { type: Number, required: true },
    soilData: {
      ksat: Number,
      clay: Number,
      silt: Number,
      sand: Number,
      soilType: String
    }
  },
  
  results: {
    harvestingPotential: {
      annualCollection: Number,
      monthlyCollection: [Number]
    },
    systemRecommendations: {
      tankSize: Number,
      pipeSize: Number,
      filterType: String
    },
    financialAnalysis: {
      estimatedCost: Number,
      annualSavings: Number,
      paybackPeriod: Number
    }
  },
  
  images: [{
    fileId: String,
    filename: String,
    paths: {
      original: String,
      optimized: String,
      thumbnail: String
    }
  }],
  
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
```javascript
assessments.index({ assessmentId: 1 }, { unique: true });
assessments.index({ createdAt: -1 });
assessments.index({ "location.city": 1 });
assessments.index({ "contactInfo.email": 1 });
```

---

## 🛡️ Security

### Implemented Security Measures

1. **Helmet.js**: Sets security HTTP headers
   ```javascript
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Strict-Transport-Security
   ```

2. **CORS**: Configurable allowed origins
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN,
     credentials: true
   }));
   ```

3. **Rate Limiting**: Prevents abuse
   ```javascript
   - 100 requests per 15 minutes (default)
   - Configurable per endpoint
   ```

4. **Input Validation**: Using Joi/express-validator
   - Sanitize all inputs
   - Validate data types
   - Check required fields

5. **File Upload Security**:
   - File type validation (only images)
   - File size limits (5MB)
   - Filename sanitization
   - Secure file storage

6. **Environment Variables**: Sensitive data in `.env`
   - Never commit `.env` to Git
   - Use `.env.example` for template

### Additional Security Recommendations

For production:

```javascript
// Add in server.js

// 1. Enable HTTPS
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(httpsOptions, app).listen(443);

// 2. Use JWT for authentication
const jwt = require('jsonwebtoken');

// 3. Implement input sanitization
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// 4. Add request validation
const { body, validationResult } = require('express-validator');
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- assessments.test.js

# Run in watch mode
npm test -- --watch
```

### Test Structure

```
tests/
├── unit/
│   ├── models/
│   │   └── Assessment.test.js
│   └── utils/
│       └── calculations.test.js
│
├── integration/
│   ├── api/
│   │   ├── assessments.test.js
│   │   ├── locations.test.js
│   │   └── uploads.test.js
│   └── database/
│       └── connection.test.js
│
└── e2e/
    └── assessment-flow.test.js
```

### Writing Tests

**Example Unit Test:**
```javascript
const Assessment = require('../models/Assessment');

describe('Assessment Model', () => {
  it('should create assessment with valid data', async () => {
    const assessmentData = {
      buildingDetails: {
        roofArea: 1500,
        roofSlope: 15,
        roofMaterial: 'RCC',
        buildingHeight: 30
      },
      location: {
        coordinates: { latitude: 28.7, longitude: 77.1 }
      },
      environmentalData: {
        annualRainfall: 650
      }
    };
    
    const assessment = new Assessment(assessmentData);
    const saved = await assessment.save();
    
    expect(saved.assessmentId).toBeDefined();
    expect(saved.status).toBe('pending');
  });
});
```

---

## 🚀 Deployment

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create drop2smart-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set ML_SERVICE_URL=your_ml_service_url
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# Open app
heroku open
```

### AWS EC2 Deployment

```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/drop2smart.git
cd drop2smart/backend

# Install dependencies
npm install --production

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start server.js --name drop2smart-api

# Setup auto-restart
pm2 startup
pm2 save

# Configure Nginx (reverse proxy)
sudo apt-get install nginx
# Edit /etc/nginx/sites-available/default
# Add proxy_pass to http://localhost:5000
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Build and Run:**
```bash
docker build -t drop2smart-backend .
docker run -p 5000:5000 --env-file .env drop2smart-backend
```

---

## 🔍 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Start MongoDB: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux)
- Check connection string in `.env`

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :5000
kill -9 <PID>
```

**3. File Upload Failing**
```
Error: ENOENT: no such file or directory
```
**Solution:**
- Create uploads directory: `mkdir uploads`
- Check permissions: `chmod 755 uploads`

**4. Module Not Found**
```
Error: Cannot find module 'express'
```
**Solution:**
- Reinstall dependencies: `npm install`
- Clear cache: `npm cache clean --force`

---

## 📞 Support

For issues and questions:

- 📖 Check main [project README](../README.md)
- 🐛 Open an issue on [GitHub](https://github.com/bhavyaa-1001/Drop2Smart/issues)
- 📧 Email: support@drop2smart.com

---

**Last Updated**: October 2, 2025  
**Version**: 1.0.0  
**Part of**: Drop2Smart Platform
