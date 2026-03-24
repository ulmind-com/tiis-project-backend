const mongoose = require('mongoose');

const CaregiverEnquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'resolved'],
    default: 'new'
  }
}, { timestamps: true });

module.exports = mongoose.model('CaregiverEnquiry', CaregiverEnquirySchema);
