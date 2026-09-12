const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/results
// @desc    Get all results
router.get('/', auth, async (req, res) => {
  try {
    const { class: classId, exam, student, subject } = req.query;
    let filter = {};
    
    if (classId) filter.class = classId;
    if (exam) filter.exam = exam;
    if (student) filter.student = student;
    if (subject) filter.subject = subject;

    const results = await Result.find(filter)
      .populate('student', 'name rollNo')
      .populate('exam', 'name examType')
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/results/me
// @desc    Get results for the logged-in student
router.get('/me', auth, async (req, res) => {
  try {
    const { getStudentByUser } = require('../utils/studentUtils');
    const student = await getStudentByUser(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const results = await Result.find({ student: student._id })
      .populate('exam', 'name examType totalMarks')
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/results/student/:studentId
// @desc    Get results for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId })
      .populate('exam', 'name examType totalMarks')
      .populate('subject', 'name code')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/results/report-card/:studentId
// @desc    Generate report card for a student
router.get('/report-card/:studentId', auth, async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId })
      .populate('exam', 'name examType totalMarks')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    // Group by exam
    const examGroups = results.reduce((acc, result) => {
      const examId = result.exam._id.toString();
      if (!acc[examId]) {
        acc[examId] = {
          exam: result.exam,
          subjects: [],
          totalMarksObtained: 0,
          totalMarks: 0
        };
      }
      acc[examId].subjects.push(result);
      acc[examId].totalMarksObtained += result.marksObtained;
      acc[examId].totalMarks += result.totalMarks;
      return acc;
    }, {});

    // Calculate overall stats
    const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
    const marksObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const percentage = totalMarks > 0 ? ((marksObtained / totalMarks) * 100).toFixed(2) : 0;

    res.json({ results, examGroups, totalMarks, marksObtained, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/results
// @desc    Add result (Admin/Teacher only)
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { student, exam, subject, class: classId, marksObtained, totalMarks, academicYear } = req.body;

    const result = new Result({
      student,
      exam,
      subject,
      class: classId,
      marksObtained,
      totalMarks,
      academicYear,
      percentage: 0,
      grade: 'F'
    });

    await result.save();
    await result.populate('student', 'name rollNo');
    await result.populate('exam', 'name examType');
    await result.populate('subject', 'name code');
    
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Result already exists for this student and exam' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// @route   PUT /api/results/:id
// @desc    Update result (Admin/Teacher only)
router.put('/:id', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('student', 'name rollNo')
    .populate('exam', 'name examType')
    .populate('subject', 'name code');
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/results/:id
// @desc    Delete result (Admin/Teacher only)
router.delete('/:id', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
