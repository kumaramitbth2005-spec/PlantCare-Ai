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
    }],
    plantReminders: {
        water: {
            enabled: { type: Boolean, default: true },
            frequency: { type: Number, default: 2 }, // days
            lastTransmission: { type: Date, default: Date.now },
            reminderTime: { type: String, default: "09:00" }
        },
        fertilizer: {
            enabled: { type: Boolean, default: false },
            frequency: { type: String, default: 'Monthly' },
            nextProtocol: { type: Date },
            reminderTime: { type: String, default: "09:00" }
        }
    },
    dailyRoutine: {
        type: String,
        default: ''
    },
    scannerSettings: {
        cameraOption: { type: Boolean, default: true },
        autoPlantDetection: { type: Boolean, default: true },
        saveInGoogleDrive: { type: Boolean, default: false }
    },
    privacyGrid: {
        notifications: { type: Boolean, default: true },
        dataEncryption: { type: Boolean, default: true }
    },
    ringtoneSettings: {
        notificationSoundEnabled: { type: Boolean, default: true },
        alarmSoundEnabled: { type: Boolean, default: true },
        selectedNotificationRingtone: { type: String, default: '/audio/notification_1.mp3' },
        selectedAlarmRingtone: { type: String, default: '/audio/alarm_1.mp3' },
        customRingtones: [{ type: String }]
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
