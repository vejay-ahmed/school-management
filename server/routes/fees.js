const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/fees
// @desc    Get all fee records
router.get('/', auth, async (req, res) => {
  try {
    const { student, class: classId, feeType, paymentStatus, academicYear } = req.query;
    let filter = {};
    
    if (student) filter.student = student;
    if (classId) filter.class = classId;
    if (feeType) filter.feeType = feeType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (academicYear) filter.academicYear = academicYear;

    const fees = await Fee.find(filter)
      .populate('student', 'name rollNo')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });
    
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/fees/me
// Get fees for the logged-in student
router.get('/me', auth, async (req, res) => {
  try {
    const { getStudentByUser } = require('../utils/studentUtils');
    const student = await getStudentByUser(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const fees = await Fee.find({ student: student._id })
      .populate('class', 'name section')
      .sort({ createdAt: -1 });

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);
    const pending = totalAmount - totalPaid;

    res.json({ fees, totalAmount, totalPaid, pending, status: pending > 0 ? (totalPaid > 0 ? 'partial' : 'pending') : 'paid' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/fees/student/:studentId
// @desc    Get fees for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.params.studentId })
      .populate('class', 'name section')
      .sort({ createdAt: -1 });
    
    // Calculate totals
    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.amountPaid, 0);
    const pending = totalAmount - totalPaid;
    
    res.json({ fees, totalAmount, totalPaid, pending });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/fees
// @desc    Create fee record (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { student, class: classId, feeType, amount, dueDate, academicYear, remarks } = req.body;

    const fee = new Fee({
      student,
      class: classId,
      feeType,
      amount,
      dueDate,
      academicYear,
      remarks
    });

    await fee.save();
    await fee.populate('student', 'name rollNo');
    await fee.populate('class', 'name section');
    
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/fees/:id/pay
// @desc    Record fee payment (Admin only)
router.put('/:id/pay', auth, authorize('admin'), async (req, res) => {
  try {
    const { amountPaid, paymentMethod, transactionId } = req.body;
    
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    fee.amountPaid += amountPaid;
    fee.paymentDate = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId;
    
    if (fee.amountPaid >= fee.amount) {
      fee.paymentStatus = 'paid';
    } else if (fee.amountPaid > 0) {
      fee.paymentStatus = 'partial';
    }

    await fee.save();
    await fee.populate('student', 'name rollNo');
    await fee.populate('class', 'name section');
    
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/fees/:id
// @desc    Update fee record (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate('student', 'name rollNo')
    .populate('class', 'name section');
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/fees/:id
// @desc    Delete fee record (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    
    res.json({ message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
