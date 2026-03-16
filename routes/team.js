const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/', async (req, res) => {
  try {
    const members = await Team.find({});
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const memberData = { ...req.body };
    if (req.file) {
      memberData.imageUrl = req.file.path;
    }
    const member = new Team(memberData);
    const createdMember = await member.save();
    res.status(201).json(createdMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (member) {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.imageUrl = req.file.path;
      }
      Object.assign(member, updateData);
      const updatedMember = await member.save();
      res.json(updatedMember);
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (member) {
      await member.deleteOne();
      res.json({ message: 'Team member removed' });
    } else {
      res.status(404).json({ message: 'Team member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
