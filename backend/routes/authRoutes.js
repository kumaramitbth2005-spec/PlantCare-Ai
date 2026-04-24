const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verifyEmail/:token', authController.verifyEmail);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
