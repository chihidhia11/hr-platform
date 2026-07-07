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
      postedBy: req.user.id
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
    const Application = require('../models/Application');
    const jobs = await Job.find().populate('postedBy', 'name email');

    // Add applicant count to each job
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount: count };
      })
    );

    res.status(200).json(jobsWithCount);
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

// DELETE a job (only the recruiter who posted it)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.status(200).json({ message: 'Job deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE a job (only the recruiter who posted it)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    const { title, description, company, location, skillsRequired, salary, status } = req.body;

    if (title) job.title = title;
    if (description) job.description = description;
    if (company) job.company = company;
    if (location) job.location = location;
    if (skillsRequired) job.skillsRequired = skillsRequired;
    if (salary) job.salary = salary;
    if (status) job.status = status;

    await job.save();

    res.status(200).json({ message: 'Job updated successfully', job });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};