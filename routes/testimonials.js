const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all testimonials (Admin sees all, public sees only active via query params)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') {
      filter.isActive = true;
    }
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a testimonial (Admin only)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { clientName, designation, description, rating, isActive } = req.body;
    
    const newTestimonial = new Testimonial({
      clientName,
      designation,
      description,
      rating: parseInt(rating, 10) || 5,
      isActive: isActive === 'true' || isActive === true,
      imageUrl: req.file ? req.file.path : '',
    });

    const testimonial = await newTestimonial.save();
    res.json(testimonial);
  } catch (err) {
    require('fs').appendFileSync('/tmp/err.log', err.stack + '\n');
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Update a testimonial (Admin only)
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { clientName, designation, description, rating, isActive } = req.body;

    let testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.clientName = clientName || testimonial.clientName;
    testimonial.designation = designation !== undefined ? designation : testimonial.designation;
    testimonial.description = description || testimonial.description;
    if (rating !== undefined) testimonial.rating = parseInt(rating, 10);
    if (isActive !== undefined) testimonial.isActive = isActive === 'true' || isActive === true || isActive === '1';

    if (req.file) {
      testimonial.imageUrl = req.file.path;
    }

    await testimonial.save();
    res.json(testimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a testimonial (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
