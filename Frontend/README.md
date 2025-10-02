# Drop2Smart Frontend

<div align="center">

**React 19 + Vite Frontend Application for Drop2Smart Platform**

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue.svg)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Component Documentation](#-component-documentation)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Styling Guide](#-styling-guide)
- [Building for Production](#-building-for-production)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

The Drop2Smart Frontend is a modern, responsive web application built with React 19 and Vite that provides an intuitive interface for assessing rainwater harvesting potential. Users can upload rooftop images, input building details, detect location, and receive comprehensive recommendations.

### Key Highlights

🎨 **Modern UI/UX**: Clean, responsive design with Tailwind CSS  
⚡ **Lightning Fast**: Vite for instant hot module replacement  
📱 **Mobile Responsive**: Works seamlessly on all devices  
🌐 **Smart Location**: GPS, IP-based, and manual location detection  
📊 **Data Visualization**: Interactive charts with Recharts  
📄 **PDF Export**: Generate downloadable assessment reports  
🔔 **Toast Notifications**: User-friendly feedback system  
🎯 **Form Validation**: Real-time input validation  

---

## 🚀 Features

### Core Functionality

✅ **Landing Page** - Engaging introduction with features and impact  
✅ **Assessment Form** - Multi-step form with validation  
✅ **Image Upload** - Drag-and-drop with preview  
✅ **Location Detection** - Multiple methods (GPS, IP, Manual)  
✅ **Results Display** - Comprehensive results with visualizations  
✅ **PDF Generation** - Export reports with jsPDF  
✅ **Responsive Design** - Mobile, tablet, desktop optimized  
✅ **Dark Mode** - Theme toggle (optional)  
✅ **Loading States** - Smooth loading indicators  
✅ **Error Handling** - User-friendly error messages  

### User Experience

- **Progressive Form**: Step-by-step guided input
- **Auto-save**: Form data preserved during navigation
- **Tooltips**: Helpful hints for complex fields
- **Accessibility**: ARIA labels and keyboard navigation
- **Animations**: Smooth transitions and micro-interactions

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library |
| **React Router DOM** | 7.9.1 | Client-side routing |
| **Vite** | 7.1.2 | Build tool & dev server |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Recharts** | 3.2.1 | Data visualization |
| **jsPDF** | 3.0.3 | PDF generation |
| **html2canvas** | 1.4.1 | HTML to canvas conversion |
| **jspdf-autotable** | 5.0.2 | Table generation for PDFs |
| **PostCSS** | 8.5.6 | CSS processing |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixing |
| **ESLint** | 9.33.0 | Code linting |

### Development Dependencies

- `@vitejs/plugin-react` - React plugin for Vite
- `@tailwindcss/typography` - Typography plugin
- `eslint-plugin-react-hooks` - React hooks linting
- `eslint-plugin-react-refresh` - React refresh linting

---

## 📋 Prerequisites

Before installing, ensure you have:

- **Node.js**: v18.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0 or higher (comes with Node.js)
- **Backend Server**: Running on port 5000
- **ML Service**: Running on port 8000 (optional but recommended)

### Verify Installation

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## 🔧 Installation

### Step 1: Navigate to Frontend Directory

```bash
cd Frontend
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install
```

**What gets installed:**
```
✅ React 19 and React DOM
✅ React Router DOM
✅ Vite and plugins
✅ Tailwind CSS and plugins
✅ Recharts
✅ jsPDF, html2canvas, jspdf-autotable
✅ ESLint and plugins
✅ PostCSS and Autoprefixer
```

**Expected time**: 3-5 minutes  
**Expected output**: ~800 packages installed (includes dependencies)

### Step 3: Create Environment File

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

If `.env.example` doesn't exist, create `.env` manually (see Configuration section).

---

## ⚙️ Configuration

Create a `.env` file in the Frontend directory:

```env
#==================================================
# API CONFIGURATION
#==================================================
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# ML Service URL
VITE_ML_SERVICE_URL=http://localhost:8000

#==================================================
# APPLICATION SETTINGS
#==================================================
VITE_APP_NAME=Drop2Smart
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Rainwater Harvesting Assessment Platform

#==================================================
# FEATURE FLAGS
#==================================================
# Enable/disable ML predictions
VITE_ENABLE_ML_PREDICTIONS=true

# Enable/disable image upload
VITE_ENABLE_IMAGE_UPLOAD=true

# Enable/disable location detection
VITE_ENABLE_LOCATION_DETECTION=true

# Enable/disable PDF export
VITE_ENABLE_PDF_EXPORT=true

#==================================================
# GOOGLE MAPS API (Optional)
#==================================================
# Get key from: https://developers.google.com/maps
# VITE_GOOGLE_MAPS_API_KEY=your-api-key-here

#==================================================
# DEVELOPMENT SETTINGS
#==================================================
# Enable debug logging
VITE_DEBUG_MODE=false

# API request timeout (milliseconds)
VITE_API_TIMEOUT=30000

# Max file upload size (bytes) - 5MB
VITE_MAX_FILE_SIZE=5242880

#==================================================
# ANALYTICS (Optional)
#==================================================
# VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
# VITE_HOTJAR_ID=your-hotjar-id
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_BACKEND_URL` | Backend API endpoint | localhost:5000 | Yes |
| `VITE_ML_SERVICE_URL` | ML service endpoint | localhost:8000 | Yes |
| `VITE_APP_NAME` | Application name | Drop2Smart | No |
| `VITE_ENABLE_ML_PREDICTIONS` | Enable ML features | true | No |
| `VITE_ENABLE_IMAGE_UPLOAD` | Enable image upload | true | No |
| `VITE_MAX_FILE_SIZE` | Max upload size | 5MB | No |
| `VITE_DEBUG_MODE` | Enable debug logs | false | No |

**Important**: All environment variables must start with `VITE_` to be accessible in the frontend.

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

This starts the Vite dev server with hot module replacement.

**Expected Output:**
```
  VITE v7.1.2  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Development Features

- ✅ **Hot Module Replacement (HMR)**: Changes reflect instantly
- ✅ **Fast Refresh**: Preserves component state during updates
- ✅ **Error Overlay**: Syntax errors shown in browser
- ✅ **Source Maps**: Easy debugging

### Preview Production Build

```bash
# Build first
npm run build

# Preview the build
npm run preview
```

This runs the production build locally on port 4173.

---

## 📁 Project Structure

```
Frontend/
│
├── src/                         # Source code
│   │
│   ├── components/              # Reusable components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Footer.jsx          # Footer component
│   │   ├── Loader.jsx          # Loading spinner
│   │   ├── Toast.jsx           # Notification toasts
│   │   ├── LocationSection.jsx # Location detection UI
│   │   ├── HowItWorks.jsx      # Info section
│   │   ├── Impact.jsx          # Environmental impact display
│   │   ├── About.jsx           # About section
│   │   ├── ThemeToggle.jsx     # Dark/light mode toggle
│   │   └── GeolocationTest.jsx # GPS testing component
│   │
│   ├── pages/                   # Page components
│   │   ├── Landing.jsx         # Home/landing page
│   │   ├── Assessment.jsx      # Main assessment form
│   │   ├── Results.jsx         # Results listing page
│   │   └── AssessmentResult.jsx # Detailed results page
│   │
│   ├── utils/                   # Utility functions
│   │   ├── apiUtils.js         # API calls and config
│   │   ├── envUtils.js         # Environment variable access
│   │   ├── validation.js       # Form validation logic
│   │   ├── calculations.js     # RWH calculations
│   │   ├── pdfGenerator.js     # PDF export logic
│   │   └── locationUtils.js    # Location detection helpers
│   │
│   ├── context/                 # React Context
│   │   └── AppContext.jsx      # Global state management
│   │
│   ├── assets/                  # Static assets
│   │   ├── images/             # Images
│   │   ├── icons/              # Icon files
│   │   └── fonts/              # Custom fonts
│   │
│   ├── styles/                  # Additional styles
│   │   └── custom.css          # Custom CSS (if needed)
│   │
│   ├── hooks/                   # Custom React hooks (optional)
│   │   ├── useApi.js           # API hook
│   │   ├── useLocation.js      # Location hook
│   │   └── useForm.js          # Form hook
│   │
│   ├── App.jsx                  # Main App component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
│
├── public/                      # Public static files
│   ├── favicon.ico             # Favicon
│   ├── logo.png                # Logo image
│   └── manifest.json           # PWA manifest (optional)
│
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── package-lock.json            # Locked dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint configuration
└── README.md                    # This file
```

---

## 🧩 Component Documentation

### Page Components

#### 1. Landing.jsx
**Purpose**: Home page with introduction and features

**Key Features**:
- Hero section with CTA
- Feature highlights
- How it works section
- Environmental impact showcase
- Testimonials (optional)

**Props**: None (standalone page)

---

#### 2. Assessment.jsx
**Purpose**: Main assessment form

**Sections**:
1. **Building Details**
   - Roof area input
   - Roof slope slider
   - Roof material dropdown
   - Building height input

2. **Location Detection**
   - GPS button
   - IP-based detection
   - Manual coordinate entry
   - City selection

3. **Image Upload**
   - Drag-and-drop zone
   - File preview
   - Multiple image support

4. **Environmental Data**
   - Annual rainfall input
   - Auto-suggestions based on city

5. **Contact Information**
   - Name, email, phone fields

**Validation**:
```javascript
// Real-time validation
- roofArea: 100-50000 sq ft
- roofSlope: 0-90 degrees
- buildingHeight: 5-500 feet
- latitude: 6.5-35.5 (India)
- longitude: 68-97.5 (India)
- email: Valid email format
- phone: 10-digit number
```

---

#### 3. AssessmentResult.jsx
**Purpose**: Display detailed assessment results

**Sections**:
1. **Summary Cards**
   - Annual collection
   - Tank size
   - Estimated cost
   - Payback period

2. **Charts**
   - Monthly collection bar chart
   - Soil composition pie chart
   - Financial analysis chart

3. **Recommendations**
   - System components
   - Installation guidelines
   - Maintenance tips

4. **Export Options**
   - Download PDF button
   - Share functionality

---

### Reusable Components

#### LocationSection.jsx
**Purpose**: Handle all location detection methods

**Methods**:
- `getGPSLocation()` - Browser geolocation API
- `getIPLocation()` - IP-based detection
- `validateCoordinates()` - Validate India bounds
- `getNearestCity()` - Find nearest city from database

**Props**:
```javascript
{
  onLocationSelect: Function,  // Callback with coordinates
  initialLocation: Object,     // {lat, lon} (optional)
  showManualEntry: Boolean     // Show manual input
}
```

---

#### Loader.jsx
**Purpose**: Loading spinner/skeleton

**Usage**:
```jsx
<Loader 
  type="spinner"        // "spinner" | "skeleton" | "dots"
  size="large"          // "small" | "medium" | "large"
  message="Loading..."  // Optional loading message
/>
```

---

#### Toast.jsx
**Purpose**: Notification system

**Types**:
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Usage**:
```jsx
import { showToast } from './components/Toast';

showToast('Assessment created successfully!', 'success');
showToast('Error uploading image', 'error');
```

---

## 🔄 State Management

### Context API

**AppContext.jsx** provides global state:

```javascript
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  
  const value = {
    user,
    setUser,
    assessments,
    setAssessments,
    loading,
    setLoading,
    currentAssessment,
    setCurrentAssessment
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
```

**Usage in Components**:
```jsx
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { assessments, loading } = useApp();
  
  return <div>{/* ... */}</div>;
}
```

---

## 🌐 API Integration

### API Utility (apiUtils.js)

```javascript
const API_CONFIG = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  ML_SERVICE_URL: import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000',
  TIMEOUT: 30000
};

// Create Assessment
export const createAssessment = async (data) => {
  try {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to create assessment');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get Assessment
export const getAssessment = async (id) => {
  const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/assessments/${id}`);
  if (!response.ok) throw new Error('Assessment not found');
  return await response.json();
};

// Upload Image
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/uploads/image`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Image upload failed');
  return await response.json();
};

// Predict Ksat (ML Service)
export const predictKsat = async (latitude, longitude) => {
  const response = await fetch(`${API_CONFIG.ML_SERVICE_URL}/predict-ksat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude })
  });
  
  if (!response.ok) throw new Error('Ksat prediction failed');
  return await response.json();
};
```

**Usage**:
```jsx
import { createAssessment, uploadImage } from '../utils/apiUtils';

const handleSubmit = async (formData) => {
  try {
    // Upload image first
    const imageResponse = await uploadImage(formData.image);
    
    // Create assessment
    const assessment = await createAssessment({
      ...formData,
      images: [imageResponse.fileId]
    });
    
    console.log('Assessment created:', assessment.assessmentId);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🎨 Styling Guide

### Tailwind CSS

**Color Palette**:
```css
/* Primary Colors */
bg-blue-600    /* Primary button */
bg-green-600   /* Success */
bg-red-600     /* Error */
bg-yellow-500  /* Warning */

/* Neutral Colors */
bg-gray-100    /* Light background */
bg-gray-800    /* Dark background */
text-gray-700  /* Body text */
```

**Common Classes**:
```jsx
/* Buttons */
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
  Click Me
</button>

/* Cards */
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  Card Content
</div>

/* Inputs */
<input 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  type="text"
/>

/* Responsive */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Custom CSS

For styles not possible with Tailwind, add to `index.css`:

```css
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #4B5563;
  border-radius: 4px;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

---

## 📦 Building for Production

### Build the Application

```bash
npm run build
```

**Output**: `dist/` folder with optimized files

**Build Process**:
1. ✅ Type checking
2. ✅ Code minification
3. ✅ Tree shaking (removes unused code)
4. ✅ Asset optimization
5. ✅ Code splitting

**Build Stats**:
```
dist/
├── index.html              # Main HTML (2 KB)
├── assets/
│   ├── index-abc123.js    # Main JS bundle (150 KB gzipped)
│   ├── index-xyz789.css   # CSS bundle (15 KB gzipped)
│   └── logo-def456.png    # Optimized images
```

### Preview Build Locally

```bash
npm run preview
```

Access at: http://localhost:4173

### Build Optimization Tips

```javascript
// vite.config.js
export default defineConfig({
  build: {
    // Enable minification
    minify: 'terser',
    
    // Source maps for debugging (disable in production)
    sourcemap: false,
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Manual chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'pdf-vendor': ['jspdf', 'html2canvas']
        }
      }
    }
  }
});
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Structure

```
src/
└── __tests__/
    ├── components/
    │   ├── Navbar.test.jsx
    │   ├── Loader.test.jsx
    │   └── Toast.test.jsx
    ├── pages/
    │   ├── Landing.test.jsx
    │   └── Assessment.test.jsx
    ├── utils/
    │   ├── apiUtils.test.js
    │   └── validation.test.js
    └── integration/
        └── assessment-flow.test.jsx
```

### Example Test

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Assessment from '../pages/Assessment';

describe('Assessment Page', () => {
  it('renders assessment form', () => {
    render(
      <BrowserRouter>
        <Assessment />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Building Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Roof Area')).toBeInTheDocument();
  });
  
  it('validates roof area input', () => {
    render(<BrowserRouter><Assessment /></BrowserRouter>);
    
    const input = screen.getByLabelText('Roof Area');
    fireEvent.change(input, { target: { value: '50' } });
    
    expect(screen.getByText('Minimum area is 100 sq ft')).toBeInTheDocument();
  });
});
```

---

## 🔍 Troubleshooting

### Common Issues

**1. Vite Server Won't Start**
```
Error: Port 3000 is already in use
```
**Solution:**
- Change port in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3001
  }
});
```

**2. Environment Variables Not Working**
```
undefined when accessing import.meta.env.VITE_BACKEND_URL
```
**Solution:**
- Ensure variable starts with `VITE_`
- Restart dev server after changing `.env`
- Check `.env` file is in Frontend directory

**3. Tailwind Styles Not Applied**
```
Classes not working or styles missing
```
**Solution:**
- Check `tailwind.config.js` content paths:
```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```
- Restart dev server
- Clear cache: `rm -rf node_modules/.vite`

**4. Build Failures**
```
Error: Failed to build
```
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

**5. API Calls Failing (CORS)**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution:**
- Ensure backend is running
- Check `VITE_BACKEND_URL` in `.env`
- Verify backend CORS configuration

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
