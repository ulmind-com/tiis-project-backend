const express = require('express');
const router = express.Router();
const Logo = require('../models/Logo');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/logos
// @desc    Get all active logos (Public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const logos = await Logo.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(logos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/logos/admin
// @desc    Get all logos (Admin)
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const logos = await Logo.find({}).sort({ createdAt: -1 });
    res.json(logos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/logos
// @desc    Upload a new logo
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { title, isActive } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path;
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image upload failed or empty' });
    }

    const newLogo = new Logo({
      title: title || 'Client Logo',
      imageUrl,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedLogo = await newLogo.save();
    res.status(201).json(savedLogo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/logos/:id
// @desc    Update logo status (toggle active/inactive)
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }

    if (req.body.isActive !== undefined) {
      // the string conversion happens because formData sends strings
      logo.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    if (req.body.title !== undefined) {
      logo.title = req.body.title;
    }

    if (req.file) {
      logo.imageUrl = req.file.path;
    }

    const updatedLogo = await logo.save();
    res.json(updatedLogo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/logos/:id
// @desc    Delete a logo
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }

    await logo.deleteOne();
    res.json({ message: 'Logo removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
