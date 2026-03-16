const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    // If admin, return all. If public, return only active
    const filter = req.query.admin === 'true' ? {} : { isActive: true };
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const job = new Job(req.body);
    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      Object.assign(job, req.body);
      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
