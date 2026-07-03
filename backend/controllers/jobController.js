const Job = require('../models/Job');

// CREATE a job (only recruiters/admins)
exports.createJob = async (req, res) => {
  try {
    const { title, description, company, location, skillsRequired, salary } = req.body;

    const newJob = new Job({
      title,
      description,
      company,
      location,
      skillsRequired,
      salary,
      postedBy: req.user.id // comes from the JWT token (set by middleware)
    });

    await newJob.save();

    res.status(201).json({ message: 'Job created successfully', job: newJob });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all jobs (anyone can see)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email');
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET a single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};