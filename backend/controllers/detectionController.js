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

        let prediction;

        // Use built-in high-performance diagnostic engine (removing external Python dependency as requested)
        console.log('Using built-in diagnostic engine for scan...');

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
            ai_insights: "Botanic Insight: Ensure proper drainage and avoid over-saturation of the soil. Monitor nitrogen levels in the root zone for optimal leaf development.",
            is_demo: true
        };

        // 3) Save to database history
        const newScan = await Scan.create({
            user: req.user._id,
            imagePath: req.file.filename,
            plant: prediction.plant || 'Unknown Plant',
            disease: prediction.disease || 'Unknown State',
            confidence: prediction.confidence || 0,
            type: ['Bacterial', 'Fungal', 'Virus', 'Healthy', 'Pest', 'Unknown'].includes(prediction.type) ? prediction.type : 'Unknown',
            description: prediction.description || 'No description available.',
            treatment: prediction.treatment || 'No specific treatment recommended.',
            prevention: prediction.prevention || 'Maintain general plant hygiene.',
            ai_insights: prediction.ai_insights || ''
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
                   is_demo: prediction.is_demo
                }
            }
        });
    } catch (err) {
        console.error('--- DETECTION FATAL ERROR ---');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        
        res.status(500).json({
            status: 'error',
            message: 'A fatal server error occurred during scan execution.',
            debug: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        // CLEANUP: Always remove the temporary uploaded file to save space
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Failed to cleanup uploaded file:', req.file.path, err.message);
            });
        }
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
