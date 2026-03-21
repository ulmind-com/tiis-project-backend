const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
  title: {
    type: String, // Optional identifier for admin reference
    required: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Logo', logoSchema);
