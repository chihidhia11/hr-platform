const Application = require('../models/Application');
const Job = require('../models/Job');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { sendApplicationStatusEmail } = require('../emailService');

// CANDIDATE applies to a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    let resumeText = req.body.resumeText || '';
    const cvUrl = req.file ? req.file.filename : (req.body.cvUrl || '');

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

    // If PDF was uploaded, extract text from it via Python service
    if (req.file) {
      try {
        const formData = new FormData();
        formData.append('pdf', fs.createReadStream(req.file.path));

        const extractRes = await axios.post('http://127.0.0.1:5001/extract-pdf', formData, {
          headers: formData.getHeaders()
        });

        resumeText = extractRes.data.text;
      } catch (extractError) {
        console.log('PDF extraction failed (continuing without text):', extractError.message);
      }
    }

    let matchPercentage = null;

    // Call AI matching if we have resume text
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

// RECRUITER views applications for a specific job (sorted by match %)
exports.getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'name email');

    // Sort by match percentage (highest first, null values at the end)
    const sorted = applications.sort((a, b) => {
      if (a.matchPercentage === null && b.matchPercentage === null) return 0;
      if (a.matchPercentage === null) return 1;
      if (b.matchPercentage === null) return -1;
      return b.matchPercentage - a.matchPercentage;
    });

    res.status(200).json(sorted);

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

    const application = await Application.findById(applicationId)
      .populate('candidate', 'name email')
      .populate('job', 'title company');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Send email notification to candidate
    if (status === 'accepted' || status === 'rejected') {
      try {
        await sendApplicationStatusEmail(
          application.candidate.email,
          application.candidate.name,
          application.job.title,
          application.job.company,
          status
        );
        console.log(`✅ Email sent to ${application.candidate.email}`);
      } catch (emailError) {
        console.log('Email sending failed (continuing):', emailError.message);
      }
    }

    res.status(200).json({ message: 'Application updated', application });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};