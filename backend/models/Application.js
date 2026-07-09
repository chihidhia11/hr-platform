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
    type: String
  },
  matchPercentage: {
    type: Number
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  interview: {
    scheduledAt: {
      type: Date
    },
    location: {
      type: String
    },
    status: {
      type: String,
      enum: ['proposed', 'confirmed', 'cancelled'],
      default: null
    },
    notes: {
      type: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);