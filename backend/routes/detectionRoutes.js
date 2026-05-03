const express = require('express');
const multer = require('multer');
const path = require('path');
const detectionController = require('../controllers/detectionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `leaf-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
});

router.use(protect);

router.post('/detect', upload.single('file'), detectionController.detect);
router.get('/history', detectionController.getHistory);
router.get('/stats', detectionController.getStats);
router.delete('/:id', detectionController.deleteRecord);
router.post('/share/:id', detectionController.shareReport);

module.exports = router;
