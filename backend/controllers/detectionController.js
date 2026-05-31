const fs = require('fs');
const path = require('path');
const Scan = require('../models/Scan');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000/predict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.detect = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'Please upload an image' });
        }

        let prediction;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.log('No GEMINI_API_KEY found, falling back to demo engine...');
            const demoClasses = [
                { plant: "Tomato", disease: "Late Blight", type: "Fungal", water: "1 liter every 3 days", fertilizer: "Use a balanced 10-10-10 NPK.", information: "Late blight is devastating. Apply fungicides like chlorothalonil." },
                { plant: "Monstera", disease: "Healthy", type: "Healthy", water: "500ml once a week", fertilizer: "Use liquid nitrogen-rich fertilizer monthly.", information: "The plant is perfectly healthy. Continue current care regime." }
            ];
            const randomClass = demoClasses[Math.floor(Math.random() * demoClasses.length)];

            prediction = {
                plant: randomClass.plant,
                disease: randomClass.disease,
                confidence: parseFloat((Math.random() * (99.9 - 85.0) + 85.0).toFixed(2)),
                type: randomClass.type,
                water: randomClass.water,
                fertilizer: randomClass.fertilizer,
                information: randomClass.information,
                is_demo: true
            };
        } else {
            console.log('Using Gemini Vision AI for scan...');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const imagePath = req.file.path;
            const imageData = fs.readFileSync(imagePath);
            const imageBase64 = imageData.toString('base64');
            const mimeType = req.file.mimetype || 'image/jpeg';

            const prompt = `
            You are a highly skilled agronomist and plant pathologist.
            Analyze this plant image carefully.
            Identify the plant species, the disease (or state if it is Healthy), and provide precise treatment.
            
            Return ONLY a JSON object with EXACTLY these keys:
            {
                "plant": "Common name of the plant",
                "disease": "Specific disease name or 'Healthy'",
                "confidence": 95, 
                "type": "Virus/Bacterial/Fungal/Pest/Unknown/Healthy",
                "water": "Exactly how much water to put (e.g., '500ml twice a week')",
                "fertilizer": "Exactly which fertilizer to use (e.g., 'Use balanced 10-10-10 NPK')",
                "information": "How often to apply fertilizer, plus a very short 1-2 sentence description of the disease or care instructions."
            }
            Do not include Markdown formatting blocks like \`\`\`json. Return raw JSON string only.
            `;

            const result = await model.generateContent([
                prompt,
                { inlineData: { data: imageBase64, mimeType } }
            ]);

            let responseText = result.response.text().trim();
            if (responseText.startsWith('\`\`\`json')) responseText = responseText.replace(/^\`\`\`json/, '');
            if (responseText.endsWith('\`\`\`')) responseText = responseText.replace(/\`\`\`$/, '');
            
            const aiData = JSON.parse(responseText.trim());

            prediction = {
                plant: aiData.plant || 'Unknown Plant',
                disease: aiData.disease || 'Unknown State',
                confidence: parseFloat(aiData.confidence || 95.0),
                type: aiData.type || 'Unknown',
                water: aiData.water || 'Consult expert',
                fertilizer: aiData.fertilizer || 'Consult expert',
                information: aiData.information || 'No information available.',
                is_demo: false
            };
        }

        // 3) Save to database history
        const newScan = await Scan.create({
            user: req.user._id,
            imagePath: req.file.filename,
            plant: prediction.plant || 'Unknown Plant',
            disease: prediction.disease || 'Unknown State',
            confidence: prediction.confidence || 0,
            type: ['Bacterial', 'Fungal', 'Virus', 'Healthy', 'Pest', 'Unknown'].includes(prediction.type) ? prediction.type : 'Unknown',
            water: prediction.water || '',
            fertilizer: prediction.fertilizer || '',
            information: prediction.information || ''
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
