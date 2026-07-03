const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only recruiters/admins can create a job
router.post('/', protect, authorize('recruiter', 'admin'), jobController.createJob);

// Anyone can view jobs (no protection needed)
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Only the recruiter who posted it can delete it
router.delete('/:id', protect, authorize('recruiter', 'admin'), jobController.deleteJob);

// Only the recruiter who posted it can edit it
router.put('/:id', protect, authorize('recruiter', 'admin'), jobController.updateJob);

module.exports = router;