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
app.use(cors());
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
const DB = process.env.DATABASE || 'mongodb://localhost:27017/plantcare';

mongoose
    .connect(DB, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.log('DB connection error:', err));

// 4) START SERVER
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
