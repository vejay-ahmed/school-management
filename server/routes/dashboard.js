const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments({ isActive: true });

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = todayAttendance.length > 0 
      ? ((presentToday / todayAttendance.length) * 100).toFixed(1) 
      : 0;

    // Upcoming exams
    const upcomingExams = await Exam.find({
      date: { $gte: new Date() },
      isActive: true
    })
    .populate('class', 'name section')
    .populate('subject', 'name')
    .sort({ date: 1 })
    .limit(5);

    // Fee statistics
    const feeStats = await Fee.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalFeeCollected = feeStats.find(s => s._id === 'paid')?.total || 0;
    const totalFeePending = feeStats.find(s => s._id === 'pending')?.total || 0;
    const totalFeePartial = feeStats.find(s => s._id === 'partial')?.total || 0;

    // Recent activities (latest results)
    const recentResults = await Result.find()
      .populate('student', 'name')
      .populate('exam', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      presentToday,
      attendancePercentage,
      upcomingExams,
      feeStats: {
        collected: totalFeeCollected,
        pending: totalFeePending,
        partial: totalFeePartial
      },
      recentResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/teacher/:teacherId
// @desc    Get teacher dashboard data
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findById(req.params.teacherId).populate('subjects');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get classes for teacher's subjects
    const Class = require('../models/Class');
    const classes = await Class.find({ subjects: { $in: teacher.subjects } })
      .populate('subjects', 'name');

    // Get upcoming exams for teacher's subjects
    const upcomingExams = await Exam.find({
      subject: { $in: teacher.subjects },
      date: { $gte: new Date() },
      isActive: true
    })
    .populate('class', 'name section')
    .populate('subject', 'name')
    .sort({ date: 1 })
    .limit(5);

    res.json({ teacher, classes, upcomingExams });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/student/me
// @desc    Get dashboard data for the logged-in student
router.get('/student/me', auth, async (req, res) => {
  try {
    const { getStudentByUser } = require('../utils/studentUtils');
    const student = await getStudentByUser(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get attendance percentage
    const attendanceRecords = await Attendance.find({ student: student._id });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Get recent results
    const recentResults = await Result.find({ student: student._id })
      .populate('exam', 'name examType')
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate overall result stats
    const allResults = await Result.find({ student: student._id });
    const avgResult = allResults.length > 0
      ? (allResults.reduce((s, r) => s + (r.percentage || 0), 0) / allResults.length).toFixed(1)
      : 0;

    // Get fee status
    const fees = await Fee.find({ student: student._id });
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);
    const pendingFees = totalFees - totalPaid;

    // Find class document matching student's class string
    const classDoc = await Class.findOne({ name: student.class, isActive: true });

    // Get upcoming exams for student's class
    let upcomingExams = [];
    if (classDoc) {
      upcomingExams = await Exam.find({
        class: classDoc._id,
        date: { $gte: new Date() },
        isActive: true
      })
      .populate('subject', 'name')
      .sort({ date: 1 })
      .limit(5);
    }

    // Attendance history (recent 10 records)
    const recentAttendance = await Attendance.find({ student: student._id })
      .populate('subject', 'name')
      .sort({ date: -1 })
      .limit(10);

    res.json({
      student,
      attendancePercentage,
      totalDays,
      presentDays,
      recentResults,
      avgResult,
      fees: { total: totalFees, paid: totalPaid, pending: pendingFees, status: pendingFees > 0 ? (totalPaid > 0 ? 'partial' : 'pending') : 'paid' },
      upcomingExams,
      recentAttendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/parent/me
// @desc    Get dashboard data for the logged-in parent (all children)
router.get('/parent/me', auth, async (req, res) => {
  try {
    const Parent = require('../models/Parent');
    const parent = await Parent.findOne({ user: req.user._id }).populate('children', 'name rollNo class section');

    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    const childrenData = [];
    for (const child of parent.children) {
      // Attendance
      const attendanceRecords = await Attendance.find({ student: child._id });
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
      const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

      // Results
      const allResults = await Result.find({ student: child._id });
      const avgResults = allResults.length > 0
        ? (allResults.reduce((s, r) => s + (r.percentage || 0), 0) / allResults.length).toFixed(1)
        : 0;

      // Fees
      const fees = await Fee.find({ student: child._id });
      const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
      const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);

      childrenData.push({
        student: child,
        attendancePercentage,
        totalDays,
        presentDays,
        avgResults,
        resultCount: allResults.length,
        fees: { total: totalFees, paid: totalPaid, pending: totalFees - totalPaid }
      });
    }

    res.json({ parent, children: childrenData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/student/:studentId
// @desc    Get student dashboard data
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get attendance percentage
    const attendanceRecords = await Attendance.find({ student: req.params.studentId });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Get recent results
    const recentResults = await Result.find({ student: req.params.studentId })
      .populate('exam', 'name examType')
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get fee status
    const fees = await Fee.find({ student: req.params.studentId });
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);

    // Find class document matching student's class string
    const classDoc = await Class.findOne({ name: student.class, isActive: true });

    // Get upcoming exams for student's class
    let upcomingExams = [];
    if (classDoc) {
      upcomingExams = await Exam.find({
        class: classDoc._id,
        date: { $gte: new Date() },
        isActive: true
      })
      .populate('subject', 'name')
      .sort({ date: 1 })
      .limit(5);
    }

    res.json({
      student,
      attendancePercentage,
      totalDays,
      presentDays,
      recentResults,
      fees: { total: totalFees, paid: totalPaid, pending: totalFees - totalPaid },
      upcomingExams
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
