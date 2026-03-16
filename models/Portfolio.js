const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, // Path to uploaded image
    required: false,
  },
  clientName: {
    type: String,
    required: false,
  },
  completionDate: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', PortfolioSchema);
