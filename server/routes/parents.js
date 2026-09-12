const express = require('express');
const router = express.Router();
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Result = require('../models/Result');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Class = require('../models/Class');
const { auth } = require('../middleware/auth');

// Helper: load parent profile for logged-in user and verify child belongs to them
const getParentWithAccess = async (userId, childId) => {
  const parent = await Parent.findOne({ user: userId });
  if (!parent) return { error: 'Parent profile not found', status: 404 };
  if (childId) {
    const hasChild = parent.children.some(c => c.toString() === childId);
    if (!hasChild) return { error: 'Not authorized to view this student', status: 403 };
  }
  return { parent };
};

// @route   GET /api/parents/me
// @desc    Get parent profile with children
router.get('/me', auth, async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id }).populate('children', 'name rollNo class section gender dateOfBirth photo');
    if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

    const children = [];
    for (const child of parent.children) {
      const attendanceRecords = await Attendance.find({ student: child._id });
      const present = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
      const results = await Result.find({ student: child._id });
      const fees = await Fee.find({ student: child._id });
      const totalFees = fees.reduce((s, f) => s + f.amount, 0);
      const paidFees = fees.reduce((s, f) => s + f.amountPaid, 0);

      children.push({
        ...child.toObject(),
        attendance: {
          total: attendanceRecords.length,
          present,
          percentage: attendanceRecords.length ? ((present / attendanceRecords.length) * 100).toFixed(1) : 0
        },
        results: { count: results.length, avg: results.length ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length).toFixed(1) : 0 },
        fees: { total: totalFees, paid: paidFees, pending: totalFees - paidFees }
      });
    }

    res.json({ parent, children });
  } catch (error) {
    console.error('Parent profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// @route   GET /api/parents/me/children/:childId
// @desc    Get full dashboard data for one child
router.get('/me/children/:childId', auth, async (req, res) => {
  try {
    const { error, status } = await getParentWithAccess(req.user._id, req.params.childId);
    if (error) return res.status(status).json({ message: error });

    const childId = req.params.childId;
    const student = await Student.findById(childId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Attendance
    const attendanceRecords = await Attendance.find({ student: childId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Results
    const recentResults = await Result.find({ student: childId })
      .populate('exam', 'name examType')
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fees
    const fees = await Fee.find({ student: childId }).populate('class', 'name section').sort({ createdAt: -1 });
    const totalFees = fees.reduce((s, f) => s + f.amount, 0);
    const totalPaid = fees.reduce((s, f) => s + f.amountPaid, 0);

    // Upcoming exams for the child's class
    const classDoc = await Class.findOne({ name: student.class, isActive: true });
    let upcomingExams = [];
    if (classDoc) {
      upcomingExams = await Exam.find({ class: classDoc._id, date: { $gte: new Date() }, isActive: true })
        .populate('subject', 'name')
        .sort({ date: 1 })
        .limit(5);
    }

    res.json({
      student,
      attendance: { total: totalDays, present: presentDays, percentage: attendancePercentage },
      recentResults,
      fees: { records: fees.length, total: totalFees, paid: totalPaid, pending: totalFees - totalPaid },
      upcomingExams
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/parents/me/children/:childId/results
router.get('/me/children/:childId/results', auth, async (req, res) => {
  try {
    const { error, status } = await getParentWithAccess(req.user._id, req.params.childId);
    if (error) return res.status(status).json({ message: error });

    const allResults = await Result.find({ student: req.params.childId })
      .populate('exam', 'name examType totalMarks')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    const totalMarks = allResults.reduce((s, r) => s + r.totalMarks, 0);
    const obtainedMarks = allResults.reduce((s, r) => s + r.marksObtained, 0);
    const percentage = totalMarks ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

    res.json({ results: allResults, totalMarks, obtainedMarks, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/parents/me/children/:childId/fees
router.get('/me/children/:childId/fees', auth, async (req, res) => {
  try {
    const { error, status } = await getParentWithAccess(req.user._id, req.params.childId);
    if (error) return res.status(status).json({ message: error });

    const fees = await Fee.find({ student: req.params.childId })
      .populate('class', 'name section')
      .sort({ createdAt: -1 });

    const totalAmount = fees.reduce((s, f) => s + f.amount, 0);
    const totalPaid = fees.reduce((s, f) => s + f.amountPaid, 0);

    res.json({ fees, totalAmount, totalPaid, pending: totalAmount - totalPaid });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/parents/me/children/:childId/attendance
router.get('/me/children/:childId/attendance', auth, async (req, res) => {
  try {
    const { error, status } = await getParentWithAccess(req.user._id, req.params.childId);
    if (error) return res.status(status).json({ message: error });

    const attendance = await Attendance.find({ student: req.params.childId })
      .populate('subject', 'name')
      .sort({ date: -1 });

    const totalDays = attendance.length;
    const present = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;

    res.json({ attendance, totalDays, present, absent, late, percentage: totalDays ? ((present / totalDays) * 100).toFixed(2) : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;