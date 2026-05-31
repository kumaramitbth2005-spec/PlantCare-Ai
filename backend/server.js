const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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
const DB = process.env.MONGO_URI || process.env.DATABASE || 'mongodb://127.0.0.1:27017/plantcare';

mongoose.set('bufferCommands', false); 

mongoose
    .connect(DB, {
        serverSelectionTimeoutMS: 60000, 
    })
    .then(() => {
        console.log('✅ DB connection successful!');
    })
    .catch((err) => {
        console.error('❌ DB connection error:', err.message);
    });

// 4) START SERVER
const port = process.env.PORT || 8000;
app.listen(port, '0.0.0.0', () => {
    console.log(`App running on port ${port} and listening on all interfaces (0.0.0.0)...`);
});
