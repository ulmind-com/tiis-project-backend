const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Open Position', 'Caregivers Enroll', 'TIIS Openings'],
    default: 'Open Position'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
