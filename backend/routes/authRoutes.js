const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected test route
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

module.exports = router;