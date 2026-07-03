const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  cvUrl: {
    type: String
  },
  resumeText: {
    type: String // raw CV text, used for AI skill matching
  },
  matchPercentage: {
    type: Number // calculated when application is created
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);