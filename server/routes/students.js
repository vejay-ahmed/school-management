const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all students (Admin/Teacher only)
router.get('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { class: classId, section, search } = req.query;
    let filter = { isActive: true };
    
    if (classId) filter.class = classId;
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .populate('class', 'name section')
      .sort({ name: 1 });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/me
// @desc    Get the logged-in student's profile (student/parent accessible)
router.get('/me', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name section');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students
// @desc    Create a new student (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, rollNo, class: classId, section, dateOfBirth, gender, parentName, parentPhone, parentEmail, address, contactNumber, bloodGroup } = req.body;

    // Check for duplicate roll number
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const student = new Student({
      name,
      rollNo,
      class: classId,
      section,
      dateOfBirth,
      gender,
      parentName,
      parentPhone,
      parentEmail,
      address,
      contactNumber,
      bloodGroup
    });

    await student.save();
    await student.populate('class', 'name section');
    
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update a student (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('class', 'name section');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student (Admin only) - soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
