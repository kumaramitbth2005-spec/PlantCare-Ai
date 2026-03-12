const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Scan = require('../models/Scan');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000/predict';

exports.detect = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'Please upload an image' });
        }

        // 1) Prepare form data for Python AI service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        let prediction;

        try {
            // 2) Send to Python service (with 5s timeout for faster fallback)
            const response = await axios.post(AI_SERVICE_URL, formData, {
                headers: formData.getHeaders(),
                timeout: 5000
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'AI Service Error');
            }

            prediction = response.data.prediction;
        } catch (apiError) {
            console.warn('AI Diagnostic Service unavailable, using built-in Demo fallback engine.');

            const demoClasses = [
                { plant: "Tomato", disease: "Late Blight", type: "Fungal", description: "Late blight is a potentially devastating disease of tomato, infecting leaves, stems, and fruits.", treatment: "Apply fungicides like chlorothalonil or copper-based sprays immediately.", prevention: "Avoid overhead watering and ensure good air circulation." },
                { plant: "Apple", disease: "Apple Scab", type: "Fungal", description: "Apple scab causes lesions on leaves and fruit, reducing fruit quality.", treatment: "Fungicide application during the early growing season.", prevention: "Plant resistant varieties and clean up fallen leaves." },
                { plant: "Potato", disease: "Early Blight", type: "Fungal", description: "Early blight causes dark, concentric rings on older leaves.", treatment: "Use protectant fungicides regularly.", prevention: "Implement crop rotation and remove infected plant debris." },
                { plant: "Monstera", disease: "Healthy", type: "Healthy", description: "The plant shows no visible signs of disease or pests. Chlorophyll levels appear optimal.", treatment: "None needed. Continue current care regime.", prevention: "Maintain consistent watering and indirect light exposure." }
            ];
            const randomClass = demoClasses[Math.floor(Math.random() * demoClasses.length)];

            prediction = {
                plant: randomClass.plant,
                disease: randomClass.disease,
                confidence: parseFloat((Math.random() * (99.9 - 85.0) + 85.0).toFixed(2)),
                type: randomClass.type,
                description: randomClass.description,
                treatment: randomClass.treatment,
                prevention: randomClass.prevention,
                ai_insights: "Simulated AI insight: Ensure proper watering and sunlight based on your region's current season. Monitor for any leaf discoloration over the next 48 hours.",
                is_demo: true
            };
        }

        // 3) Save to database history
        const newScan = await Scan.create({
            user: req.user._id,
            imagePath: req.file.filename,
            plant: prediction.plant,
            disease: prediction.disease,
            confidence: prediction.confidence,
            type: prediction.type,
            description: prediction.description,
            treatment: prediction.treatment,
            prevention: prediction.prevention,
            ai_insights: prediction.ai_insights
        });

        // 4) Update user stats
        const updateData = { $inc: { 'stats.totalScans': 1 } };
        if ((prediction.disease || '').toLowerCase() === 'healthy') {
            updateData.$inc['stats.healthyPlants'] = 1;
        } else {
            updateData.$inc['stats.diseasedPlants'] = 1;
        }

        await User.findByIdAndUpdate(req.user._id, updateData);

        res.status(200).json({
            status: 'success',
            data: {
                scan: {
                   ...newScan.toObject(),
                   is_demo: prediction.is_demo // Add boolean flag back to the frontend to light up the UI demo badge
                }
            }
        });
    } catch (err) {
        console.error('Detection Error (Fatal):', err.message);
        res.status(500).json({
            status: 'error',
            message: 'A fatal server error occurred during scan execution.'
        });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await Scan.find({ user: req.user._id }).sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: history.length,
            data: {
                history
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getStats = async (req, res) => {
    try {
        // Compute aggregate stats
        const totalScans = await Scan.countDocuments({ user: req.user._id });
        const healthyCount = await Scan.countDocuments({ user: req.user._id, type: 'Healthy' });
        const diseasedCount = totalScans - healthyCount;

        const diseaseStats = await Scan.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalScans,
                healthyCount,
                diseasedCount,
                diseaseStats
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteRecord = async (req, res) => {
    try {
        const scan = await Scan.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!scan) {
            return res.status(404).json({
                status: 'fail',
                message: 'No record found with that ID for this user'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.shareReport = async (req, res) => {
    try {
        const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id });

        if (!scan) {
            return res.status(404).json({
                status: 'fail',
                message: 'No record found with that ID'
            });
        }

        // Generate a placeholder report link
        const shareUrl = `${req.protocol}://${req.get('host')}/report/${scan._id}`;

        res.status(200).json({
            status: 'success',
            data: {
                shareUrl,
                message: 'Report link generated successfully'
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
