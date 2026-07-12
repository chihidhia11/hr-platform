const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  skills: {
    type: [String],
    default: []
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);