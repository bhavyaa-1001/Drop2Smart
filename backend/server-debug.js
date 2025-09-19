const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const assessmentRoutes = require('./routes/assessments');
const locationRoutes = require('./routes/locations');
const mlRoutes = require('./routes/ml');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Connect to MongoDB
connectDB();

// Enhanced CORS configuration with debugging
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS Origin Check:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173', // Vite default port
      process.env.CORS_ORIGIN || 'http://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS Origin Allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS Origin Blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Custom-Header'
  ],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle all preflight requests
app.options('*', (req, res) => {
  console.log('🔍 Preflight request for:', req.path);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Custom middleware to add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
  
  console.log(`${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  next();
});

// Security middleware - After CORS with relaxed settings
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginEmbedderPolicy: false
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Drop2Smart Backend API',
    version: '1.0.0',
    cors: 'enabled',
    uploads: 'ready'
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/assessments', assessmentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/uploads', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Drop2Smart Backend API (Debug Mode)',
    version: '1.0.0',
    cors: 'enabled',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      testCors: '/test-cors',
      assessments: '/api/assessments',
      locations: '/api/locations',
      ml: '/api/ml',
      uploads: '/api/uploads'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Drop2Smart Backend Server (DEBUG MODE) is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Local: http://localhost:${PORT}
🔗 Network: http://0.0.0.0:${PORT}
📚 Health Check: http://localhost:${PORT}/health
🧪 CORS Test: http://localhost:${PORT}/test-cors
🌐 CORS Origins: http://localhost:3000, http://127.0.0.1:3000
📁 Uploads: ${uploadsDir}

🔧 Debug endpoints:
   - GET /health (health check)
   - GET /test-cors (CORS verification)
   - GET / (API info)
  `);
});

module.exports = app;