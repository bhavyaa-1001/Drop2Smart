const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Enhanced CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type',
        'Accept',
        'Authorization'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
};

// Debug middleware to log all requests
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📝 [${timestamp}] ${req.method} ${req.url}`);
    console.log(`🌐 Origin: ${req.headers.origin || 'no-origin'}`);
    console.log(`🎯 User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'unknown'}...`);
    
    if (req.method === 'OPTIONS') {
        console.log('🔄 Preflight CORS request detected');
    }
    
    next();
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('✅ Health check requested');
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        corsEnabled: true,
        mongodb: 'disabled for testing',
        uploads: 'enabled'
    });
});

// CORS test endpoint
app.get('/test-cors', (req, res) => {
    console.log('🧪 CORS test requested');
    res.json({ 
        message: 'CORS is working!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Drop2Smart Backend API (Quick Fix)',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            corsTest: '/test-cors',
            upload: '/upload',
            assessment: '/api/assessments'
        }
    });
});

// Simple file upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    console.log('📤 Upload request received');
    console.log('📁 File info:', req.file ? {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
    } : 'no file');

    if (!req.file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('✅ File uploaded successfully');
    res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            url: `/uploads/${req.file.filename}`
        }
    });
});

// Simple assessment endpoint (no database)
app.post('/api/assessments', (req, res) => {
    console.log('📋 Assessment submission received');
    console.log('📊 Data keys:', Object.keys(req.body));

    // Simulate processing
    setTimeout(() => {
        const mockAssessment = {
            id: 'assessment_' + Date.now(),
            status: 'completed',
            submittedAt: new Date().toISOString(),
            data: req.body,
            results: {
                riskLevel: 'medium',
                ksatPrediction: 2.5,
                recommendations: ['Regular maintenance', 'Monitor drainage']
            }
        };

        console.log('✅ Assessment completed');
        res.json(mockAssessment);
    }, 1000);
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error.message);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`❓ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log('\n🚀 Drop2Smart Backend (QUICK FIX) is running!');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`📚 Health Check: http://localhost:${PORT}/health`);
    console.log(`🧪 CORS Test: http://localhost:${PORT}/test-cors`);
    console.log(`📁 Uploads Directory: ${uploadsDir}`);
    console.log('\n🔧 Available endpoints:');
    console.log('   - GET / (API info)');
    console.log('   - GET /health (health check)'); 
    console.log('   - GET /test-cors (CORS test)');
    console.log('   - POST /upload (file upload)');
    console.log('   - POST /api/assessments (assessment submission)');
    console.log('\n🎯 Ready to receive requests from http://localhost:3000');
    console.log('📝 All requests will be logged in detail\n');
});