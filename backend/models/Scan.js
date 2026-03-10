const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Scan must belong to a user']
    },
    imagePath: {
        type: String,
        required: [true, 'Scan must have an image path']
    },
    plant: {
        type: String,
        required: [true, 'Plant name is required']
    },
    disease: {
        type: String,
        required: [true, 'Disease name is required']
    },
    confidence: {
        type: Number,
        required: [true, 'Confidence score is required']
    },
    type: {
        type: String,
        enum: ['Bacterial', 'Fungal', 'Virus', 'Healthy', 'Pest', 'Unknown'],
        default: 'Unknown'
    },
    description: String,
    treatment: String,
    prevention: String,
    ai_insights: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Scan = mongoose.model('Scan', scanSchema);
module.exports = Scan;
