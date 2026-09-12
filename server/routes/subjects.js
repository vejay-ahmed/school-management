const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/subjects
// @desc    Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const { class: classId } = req.query;
    let filter = { isActive: true };
    if (classId) filter.class = classId;

    const subjects = await Subject.find(filter)
      .populate('teacher', 'name')
      .populate('class', 'name section')
      .sort({ name: 1 });
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('class', 'name section');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Create a new subject (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, code, teacher, class: classId, creditHours } = req.body;

    // Check for duplicate subject code
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    const subject = new Subject({ name, code, teacher, class: classId, creditHours });
    await subject.save();
    await subject.populate('teacher', 'name');
    await subject.populate('class', 'name section');
    
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('teacher', 'name')
    .populate('class', 'name section');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject (Admin only) - soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
