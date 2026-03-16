const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @desc    Get all content blocks
// @route   GET /api/content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const contents = await Content.find({});
    // Transform array to a key-value object for easier frontend consumption
    const contentMap = contents.reduce((acc, curr) => {
      acc[curr.sectionKey] = curr.contentData;
      return acc;
    }, {});
    
    res.json(contentMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single content block by key
// @route   GET /api/content/:key
// @access  Public
router.get('/:key', async (req, res) => {
  try {
    const content = await Content.findOne({ sectionKey: req.params.key });
    if (content) {
      res.json(content);
    } else {
      res.status(404).json({ message: 'Content not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create or update content block
// @route   POST /api/content
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { sectionKey, contentData } = req.body;
    let content = await Content.findOne({ sectionKey });

    if (content) {
      content.contentData = contentData;
      await content.save();
    } else {
      content = new Content({ sectionKey, contentData });
      await content.save();
    }
    
    res.json(content);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Upload image for content
// @route   POST /api/content/upload
// @access  Private/Admin
router.post('/upload', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }
    const imageUrl = req.file.path;
    res.json({ imageUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
