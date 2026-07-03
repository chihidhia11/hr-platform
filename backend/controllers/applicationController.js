const Application = require('../models/Application');
const Job = require('../models/Job');
const axios = require('axios');

// CANDIDATE applies to a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { cvUrl, resumeText } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You already applied to this job' });
    }

    let matchPercentage = null;

    // Call the AI service to calculate skill match, if resumeText was provided
    if (resumeText && job.skillsRequired?.length > 0) {
      try {
        const aiResponse = await axios.post('http://127.0.0.1:5001/match', {
          cvText: resumeText,
          requiredSkills: job.skillsRequired
        });
        matchPercentage = aiResponse.data.matchPercentage;
      } catch (aiError) {
        console.log('AI service error (continuing without match score):', aiError.message);
      }
    }

    const newApplication = new Application({
      job: jobId,
      candidate: req.user.id,
      cvUrl,
      resumeText,
      matchPercentage
    });

    await newApplication.save();

    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// RECRUITER views applications for a specific job
exports.getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'name email');

    res.status(200).json(applications);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CANDIDATE views their own applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title company location');

    res.status(200).json(applications);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// RECRUITER updates application status (accept/reject)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: 'Application updated', application });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};