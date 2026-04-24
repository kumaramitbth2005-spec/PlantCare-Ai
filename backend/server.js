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
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Allow frontend URL from env or anywhere for testing
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
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
const DB = process.env.MONGO_URI || process.env.DATABASE || 'mongodb://localhost:27017/plantcare';

mongoose.set('bufferCommands', false); // Disable mongoose buffering timeout issue

mongoose
    .connect(DB, {
        serverSelectionTimeoutMS: 60000, // 60 second timeout for server selection (Render cold start)
    })
    .then(() => {
        console.log('DB connection successful!');
        
        // 4) START SERVER
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`App running on port ${port}...`);
        });
    })
    .catch((err) => {
        console.error('DB connection error:', err);
        process.exit(1); // Exit process if DB connection fails
    });
