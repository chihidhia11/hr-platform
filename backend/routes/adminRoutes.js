const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require login + admin role
router.get('/stats', protect, authorize('admin'), adminController.getStats);
router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);

module.exports = router;