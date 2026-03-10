const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide your first name']
    },
    middleName: String,
    lastName: {
        type: String,
        required: [true, 'Please provide your last name']
    },
    contactNumber: {
        type: String,
        required: [true, 'Please provide your contact number']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    profilePhoto: {
        type: String,
        default: 'default.jpg'
    },
    accountType: {
        type: String,
        enum: ['user', 'researcher', 'admin'],
        default: 'user'
    },
    stats: {
        totalScans: { type: Number, default: 0 },
        healthyPlants: { type: Number, default: 0 },
        diseasedPlants: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordOtp: String,
    resetPasswordExpires: Date,
    addresses: [{
        type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
        street: String,
        city: String,
        state: String,
        zip: String,
        isDefault: { type: Boolean, default: false }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' // Assuming a Product model will exist or just IDs for now
    }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
