const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/teachers
// @desc    Get all teachers (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { search, subject } = req.query;
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    if (subject) filter.subjects = subject;

    const teachers = await Teacher.find(filter)
      .populate('subjects', 'name code')
      .sort({ name: 1 });
    
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('subjects', 'name code');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/teachers
// @desc    Create a new teacher (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, employeeId, subjects, qualification, experience, phone, email, address, dateOfBirth, gender, salary } = req.body;

    // Check for duplicate employee ID
    const existingTeacher = await Teacher.findOne({ employeeId });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher with this employee ID already exists' });
    }

    const teacher = new Teacher({
      name,
      employeeId,
      subjects,
      qualification,
      experience,
      phone,
      email,
      address,
      dateOfBirth,
      gender,
      salary
    });

    await teacher.save();
    await teacher.populate('subjects', 'name code');
    
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update a teacher (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('subjects', 'name code');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete a teacher (Admin only) - soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
