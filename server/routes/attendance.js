const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    const { class: classId, student, date, subject, startDate, endDate } = req.query;
    let filter = {};
    
    if (classId) filter.class = classId;
    if (student) filter.student = student;
    if (subject) filter.subject = subject;
    if (date) filter.date = new Date(date);
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'name rollNo')
      .populate('class', 'name section')
      .populate('subject', 'name')
      .populate('markedBy', 'name')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/me
// Get attendance for the logged-in student
router.get('/me', auth, async (req, res) => {
  try {
    const { getStudentByUser } = require('../utils/studentUtils');
    const student = await getStudentByUser(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ student: student._id })
      .populate('subject', 'name')
      .populate('class', 'name section')
      .sort({ date: -1 });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({ attendance, totalDays, presentDays, absentDays, lateDays, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId })
      .populate('subject', 'name')
      .populate('class', 'name section')
      .sort({ date: -1 });
    
    // Calculate attendance percentage
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
    
    res.json({ attendance, totalDays, presentDays, percentage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance (Admin/Teacher only)
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { class: classId, subject, date, attendanceRecords } = req.body;

    const records = attendanceRecords.map(record => ({
      student: record.student,
      class: classId,
      subject,
      date: new Date(date),
      status: record.status,
      remarks: record.remarks || '',
      markedBy: req.user._id
    }));

    // Use insertMany with ordered:false to skip duplicates
    await Attendance.insertMany(records, { ordered: false });
    
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Attendance already marked for some students on this date' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (Admin/Teacher only)
router.put('/:id', auth, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/class/:classId/stats
// @desc    Get attendance statistics for a class
router.get('/class/:classId/stats', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { class: req.params.classId };
    if (date) filter.date = new Date(date);

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const present = stats.find(s => s._id === 'present')?.count || 0;
    const absent = stats.find(s => s._id === 'absent')?.count || 0;
    const late = stats.find(s => s._id === 'late')?.count || 0;

    res.json({ total, present, absent, late, percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
