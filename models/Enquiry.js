const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  serviceRequired: {
    type: String,
    required: true,
  },
  briefRequirement: {
    type: String,
    required: true,
  },
  attachmentUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'resolved'],
    default: 'new'
  }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', EnquirySchema);
