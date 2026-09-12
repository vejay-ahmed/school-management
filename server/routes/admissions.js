const express = require('express');
const router = express.Router();
const AdmissionApplication = require('../models/AdmissionApplication');
const { auth, authorize } = require('../middleware/auth');

router.post('/apply', async (req, res) => {
  try {
    // Convert dateOfBirth to Date if it's a string
    const body = { ...req.body };
    if (body.dateOfBirth && typeof body.dateOfBirth === 'string') {
      body.dateOfBirth = new Date(body.dateOfBirth);
    }
    
    const application = new AdmissionApplication(body);
    await application.save();
    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: application.applicationId,
      application
    });
  } catch (error) {
    console.error('Admission apply error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Application with this email already exists' });
    } else if (error.name === 'ValidationError') {
      // Extract validation error messages
      const messages = Object.values(error.errors).map(e => e.message);
      res.status(400).json({ message: 'Validation error', errors: messages });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

router.get('/status/:applicationId', async (req, res) => {
  try {
    const application = await AdmissionApplication.findOne({
      applicationId: req.params.applicationId
    }).select('applicationId firstName lastName status applyingForClass createdAt reviewedAt reviewNotes');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page, limit, search, sortBy } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } }
      ];
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    let sort = { createdAt: -1 };
    if (sortBy === 'date_asc') sort = { createdAt: 1 };
    if (sortBy === 'name') sort = { firstName: 1 };
    const applications = await AdmissionApplication.find(filter)
      .populate('reviewedBy', 'name').sort(sort).skip(skip).limit(limitNum);
    const total = await AdmissionApplication.countDocuments(filter);
    res.json({ applications, pagination: { current: pageNum, total: Math.ceil(total / limitNum), count: total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const application = await AdmissionApplication.findById(req.params.id).populate('reviewedBy', 'name');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/review', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const application = await AdmissionApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.statusHistory.push({
      status: application.status,
      notes: application.reviewNotes,
      updatedBy: application.reviewedBy,
      updatedAt: application.reviewedAt
    });
    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    await application.save();
    await application.populate('reviewedBy', 'name');
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const application = await AdmissionApplication.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    ).populate('reviewedBy', 'name');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const application = await AdmissionApplication.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats/summary', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await AdmissionApplication.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const total = await AdmissionApplication.countDocuments();
    const thisMonth = await AdmissionApplication.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const byClass = await AdmissionApplication.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: '$applyingForClass', count: { $sum: 1 } } }
    ]);
    res.json({ stats, total, thisMonth, byClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
