const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/classes
// @desc    Get all classes
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('classTeacher', 'name')
      .populate('subjects', 'name code')
      .sort({ name: 1 });
    
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/classes/:id
// @desc    Get class by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('classTeacher', 'name')
      .populate('subjects', 'name code teacher');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/classes
// @desc    Create a new class (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, section, classTeacher, subjects, roomNumber, capacity, academicYear } = req.body;

    const newClass = new Class({
      name,
      section,
      classTeacher,
      subjects,
      roomNumber,
      capacity,
      academicYear
    });

    await newClass.save();
    await newClass.populate('classTeacher', 'name');
    await newClass.populate('subjects', 'name code');
    
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update a class (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('classTeacher', 'name')
    .populate('subjects', 'name code');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete a class (Admin only) - soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
