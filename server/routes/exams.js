const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/exams
// @desc    Get all exams
router.get('/', auth, async (req, res) => {
  try {
    const { class: classId, subject, examType, academicYear } = req.query;
    let filter = { isActive: true };
    
    if (classId) filter.class = classId;
    if (subject) filter.subject = subject;
    if (examType) filter.examType = examType;
    if (academicYear) filter.academicYear = academicYear;

    const exams = await Exam.find(filter)
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .sort({ date: -1 });
    
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/exams/:id
// @desc    Get exam by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('class', 'name section')
      .populate('subject', 'name code');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/exams
// @desc    Create a new exam (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, examType, class: classId, subject, date, totalMarks, passingMarks, duration, academicYear } = req.body;

    const exam = new Exam({
      name,
      examType,
      class: classId,
      subject,
      date,
      totalMarks,
      passingMarks,
      duration,
      academicYear
    });

    await exam.save();
    await exam.populate('class', 'name section');
    await exam.populate('subject', 'name code');
    
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update an exam (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('class', 'name section')
    .populate('subject', 'name code');
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete an exam (Admin only) - soft delete
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
