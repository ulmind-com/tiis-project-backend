const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// @desc    Get all portfolio items
// @route   GET /api/portfolio
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await Portfolio.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a portfolio item
// @route   POST /api/portfolio
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const itemData = { ...req.body };
    if (req.file) {
        itemData.imageUrl = req.file.path;
    }
    const item = new Portfolio(itemData);
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a portfolio item
// @route   PUT /api/portfolio/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (item) {
      const updateData = { ...req.body };
      if (req.file) {
          updateData.imageUrl = req.file.path;
      }
      Object.assign(item, updateData);
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (item) {
      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
