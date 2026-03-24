const express = require('express');
const router = express.Router();
const CaregiverEnquiry = require('../models/CaregiverEnquiry');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Submit a caregiver enquiry
// @route   POST /api/caregiver-enquiries
// @access  Public
router.post('/', async (req, res) => {
  try {
    const enquiry = new CaregiverEnquiry(req.body);
    const createdEnquiry = await enquiry.save();
    res.status(201).json(createdEnquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all caregiver enquiries
// @route   GET /api/caregiver-enquiries
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const enquiries = await CaregiverEnquiry.find({}).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update caregiver enquiry status
// @route   PUT /api/caregiver-enquiries/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const enquiry = await CaregiverEnquiry.findById(req.params.id);
    if (enquiry) {
      enquiry.status = req.body.status || enquiry.status;
      const updatedEnquiry = await enquiry.save();
      res.json(updatedEnquiry);
    } else {
      res.status(404).json({ message: 'Enquiry not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete caregiver enquiry
// @route   DELETE /api/caregiver-enquiries/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const enquiry = await CaregiverEnquiry.findById(req.params.id);
    if (enquiry) {
      await enquiry.deleteOne();
      res.json({ message: 'Enquiry removed' });
    } else {
      res.status(404).json({ message: 'Enquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
