const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key-123456', {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = async (req, res, next) => {
    try {
        const newUser = await User.create({
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            contactNumber: req.body.contactNumber,
            email: req.body.email,
            password: req.body.password,
            accountType: req.body.accountType
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password!'
            });
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
        }

        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.forgotPassword = async (req, res, next) => {
    // 1) Get user based on POSTed contact (email or phone)
    const { contact } = req.body;
    
    if (!contact) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide your email or phone number.'
        });
    }

    const user = await User.findOne({
        $or: [
            { email: contact },
            { contactNumber: contact }
        ]
    });

    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'There is no user with that email address or phone number.'
        });
    }

    // 2) Generate the random OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email 
    // FALLBACK: If dummy credentials are used, skip sending email to prevent crash.
    const isDummyEmail = !process.env.EMAIL_USERNAME || process.env.EMAIL_USERNAME.includes('your-email');
    
    if (isDummyEmail) {
        // Skip nodemailer and just return success for testing/demo purposes
        console.log(`[TESTING MODE] Dummy Email detected. OTP for ${user.email} is: ${otp}`);
        return res.status(200).json({
            status: 'success',
            message: `OTP generated successfully! (Testing Mode: Check backend console for OTP: ${otp})`
        });
    }

    const message = `Your password reset OTP is ${otp}. It is valid for 10 minutes.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset OTP (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'OTP sent to your registered email!'
        });
    } catch (err) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        console.error("Email Error:", err);

        return res.status(500).json({
            status: 'error',
            message: 'There was an error sending the email. Try again later!'
        });
    }
};

exports.resetPassword = async (req, res, next) => {
    // 1) Get user based on the OTP and check if it's expired
    const user = await User.findOne({
        resetPasswordOtp: req.body.otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    // 2) If OTP is invalid or has expired, send error
    if (!user) {
        return res.status(400).json({
            status: 'fail',
            message: 'OTP is invalid or has expired'
        });
    }

    // 3) Update password and clear OTP fields
    user.password = req.body.password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
};

exports.updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password) {
            return res.status(400).json({
                status: 'fail',
                message: 'This route is not for password updates. Please use /resetPassword.'
            });
        }

        // 2) Filter out unwanted fields that are not allowed to be updated
        const filteredBody = {};
        const allowedFields = ['firstName', 'lastName', 'email', 'contactNumber', 'address', 'profilePhoto', 'plantReminders', 'dailyRoutine', 'scannerSettings', 'privacyGrid', 'addresses', 'ringtoneSettings'];
        Object.keys(req.body).forEach(el => {
            if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
        });

        // 3) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// --- PHOTO UPLOAD SETTINGS ---

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        // user-id-timestamp.jpeg
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware to use in routes
exports.uploadUserPhoto = upload.single('profilePhoto');

exports.uploadProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'No image file uploaded'
            });
        }

        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePhoto: photoUrl },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
                fileUrl: photoUrl
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.deleteProfilePhoto = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User no longer exists.'
            });
        }

        // Only delete physical file if they have a custom photo
        if (user.profilePhoto && user.profilePhoto !== 'default.jpg' && user.profilePhoto.startsWith('/uploads/profiles/')) {
            const fileName = user.profilePhoto.split('/').pop();
            const filePath = path.join(__dirname, '..', 'uploads', 'profiles', fileName);

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting physical file:', err);
                    // We don't block the profile update even if the file deletion slightly errors out
                }
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePhoto: 'default.jpg' },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status: 'success',
            message: 'Profile image successfully deleted',
            data: {
                user: updatedUser,
                fileUrl: 'default.jpg'
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
