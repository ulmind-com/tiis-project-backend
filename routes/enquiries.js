const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Submit a business enquiry (with optional attachment)
// @route   POST /api/enquiries
// @access  Public
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const enquiryData = { ...req.body };
    
    if (req.file) {
      enquiryData.attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const enquiry = new Enquiry(enquiryData);
    const createdEnquiry = await enquiry.save();

    // Send Auto Email Acknowledgement via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'TIIS <careers@sagnikmondal.in>',
          to: createdEnquiry.email,
          subject: 'Thank you for your enquiry - TIIS',
          html: `
            <h3>Dear ${createdEnquiry.contactPerson},</h3>
            <p>Thank you for contacting TIIS regarding <strong>${createdEnquiry.serviceRequired}</strong> services.</p>
            <p>Our team has received your enquiry and will get back to you shortly.</p>
            <br/>
            <p>Best Regards,<br/><strong>Team TIIS</strong></p>
          `
        });
        console.log('Enquiry acknowledgment email sent');
      } catch (emailErr) {
        console.error('Failed to send Resend email:', emailErr);
      }
    }

    res.status(201).json(createdEnquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (enquiry) {
      res.json(enquiry);
    } else {
      res.status(404).json({ message: 'Enquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update enquiry status
// @route   PUT /api/enquiries/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
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

module.exports = router;
