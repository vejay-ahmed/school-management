const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/events/admin/all
// @desc    Get all events including unpublished (Admin only)
// NOTE: This must be BEFORE /:id route to avoid conflict
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name')
      .sort({ startDate: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/events
// @desc    Get all published events (public)
router.get('/', async (req, res) => {
  try {
    const { category, upcoming, featured, limit } = req.query;
    let filter = { isPublished: true };

    if (category) filter.category = category;
    if (upcoming === 'true') filter.startDate = { $gte: new Date() };
    if (featured === 'true') filter.featured = true;

    const events = await Event.find(filter)
      .populate('createdBy', 'name')
      .sort({ startDate: 1 })
      .limit(parseInt(limit) || 50);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!event || !event.isPublished) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/events
// @desc    Create event (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, description, image, category, startDate, endDate, location, organizer, featured } = req.body;

    const event = new Event({
      title,
      description,
      image,
      category,
      startDate,
      endDate,
      location,
      organizer,
      featured,
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'name');

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
