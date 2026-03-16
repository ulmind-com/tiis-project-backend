const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  sectionKey: {
    type: String,
    required: true,
    unique: true, // e.g., 'home_banner', 'about_us_text'
  },
  contentData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    // Can store text strings or objects with text/image URLs
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
