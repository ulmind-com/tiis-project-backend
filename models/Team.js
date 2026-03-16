const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
  },
  linkedIn: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
