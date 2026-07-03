const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only recruiters/admins can create a job
router.post('/', protect, authorize('recruiter', 'admin'), jobController.createJob);

// Anyone can view jobs (no protection needed)
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

module.exports = router;