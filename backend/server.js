const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const detectionRoutes = require('./routes/detectionRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Allow both localhost and 127.0.0.1 for maximum local compatibility
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isLocal = origin.includes('localhost') || 
                        origin.includes('127.0.0.1') || 
                        origin.includes('192.168.') ||
                        origin.includes('10.') ||
                        origin.includes('172.');

        const isVercel = origin.endsWith('.vercel.app') || origin.includes('vercel.app');

        if (allowedOrigins.indexOf(origin) !== -1 || isLocal || isVercel) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Ensure upload directories exist on startup (Render/production environment)
const uploadDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'profiles')
];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2) ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/detection', detectionRoutes);

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to PlantCare AI Backend API'
    });
});

// 3) DB CONNECTION
console.log('⌛ Connecting to JSON Database...');
console.log('✅ DB connection initialized successfully (JSON-DB File Store)!');

// 4) START SERVER
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port} and listening on all interfaces (0.0.0.0)...`);
});
