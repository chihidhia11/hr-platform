const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  skillsRequired: {
    type: [String], // array of strings, e.g. ["React", "Node.js"]
    default: []
  },
  salary: {
    type: Number
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // links to the recruiter who posted it
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);