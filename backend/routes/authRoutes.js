const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Email verification
router.get('/verify/:token', authController.verifyEmail);

// Profile routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;