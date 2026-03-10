const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.patch('/updateMe', authController.updateMe);

router.post(
    '/uploadProfilePhoto',
    authController.uploadUserPhoto,
    authController.uploadProfilePhoto
);

router.delete('/deleteProfilePhoto', authController.deleteProfilePhoto);

module.exports = router;
