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

        // 2) Send to Python service (with 15s timeout for production stability)
        const response = await axios.post(AI_SERVICE_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 15000
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'AI Service Error');
        }

        const { prediction } = response.data;

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
        if (prediction.disease.toLowerCase() === 'healthy') {
            updateData.$inc['stats.healthyPlants'] = 1;
        } else {
            updateData.$inc['stats.diseasedPlants'] = 1;
        }

        await User.findByIdAndUpdate(req.user._id, updateData);

        res.status(200).json({
            status: 'success',
            data: {
                scan: newScan
            }
        });
    } catch (err) {
        let errorMessage = err.message;
        if (err.code === 'ECONNABORTED') {
            errorMessage = 'AI Diagnostic Service timed out. Please try again.';
        } else if (err.code === 'ECONNREFUSED') {
            errorMessage = 'AI Diagnostic Service is currently offline.';
        }

        console.error('Detection Error:', errorMessage);
        res.status(500).json({
            status: 'error',
            message: errorMessage
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
