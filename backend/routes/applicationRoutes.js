const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Candidate applies to a job
router.post('/jobs/:jobId/apply', protect, authorize('candidate'), applicationController.applyToJob);

// Recruiter views applications for a specific job
router.get('/jobs/:jobId/applications', protect, authorize('recruiter', 'admin'), applicationController.getApplicationsForJob);
router.put('/:applicationId/status', protect, authorize('recruiter', 'admin'), applicationController.updateApplicationStatus);

// Candidate views their own applications
router.get('/my-applications', protect, authorize('candidate'), applicationController.getMyApplications);

module.exports = router;