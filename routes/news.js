const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', async (req, res) => {
  try {
    // Only fetch published news for public
    const items = await News.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin', protect, admin, async (req, res) => {
  try {
    const items = await News.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const newsData = { ...req.body };
    if (req.file) {
      newsData.imageUrl = req.file.path;
    }
    const item = new News(newsData);
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (item) {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.imageUrl = req.file.path;
      }
      Object.assign(item, updateData);
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (item) {
      await item.deleteOne();
      res.json({ message: 'News removed' });
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
