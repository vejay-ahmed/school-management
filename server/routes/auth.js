const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const { generateToken } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Validate role
    if (!['student', 'teacher', 'admin', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be student, teacher, admin, or parent' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({ name, email, password, role, phone: phone || '' });
    await user.save();

    // Create role-specific profile
    if (role === 'student') {
      const { rollNo, class: classId, section, dateOfBirth, gender, parentName, parentPhone, contactNumber } = req.body;
      
      if (!rollNo || !classId || !section || !dateOfBirth || !gender || !parentName || !parentPhone || !contactNumber) {
        // Delete the user if student profile data is incomplete
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'All student fields are required' });
      }

      await new Student({
        user: user._id,
        name,
        rollNo,
        class: classId,
        section,
        dateOfBirth,
        gender,
        parentName,
        parentPhone,
        parentEmail: req.body.parentEmail || '',
        contactNumber
      }).save();
    } else if (role === 'teacher') {
      const { employeeId, qualification, experience, subjects } = req.body;
      
      if (!employeeId || !qualification) {
        // Delete the user if teacher profile data is incomplete
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Employee ID and qualification are required' });
      }

      await new Teacher({
        user: user._id,
        name,
        employeeId,
        qualification,
        experience: experience || 0,
        phone: phone || '',
        email,
        subjects: subjects || []
      }).save();
    } else if (role === 'parent') {
      // Find students whose parentEmail matches this parent's email
      const children = await Student.find({ parentEmail: email.toLowerCase() });

      await new Parent({
        user: user._id,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        relation: req.body.relation || 'guardian',
        occupation: req.body.occupation || '',
        children: children.map(c => c._id)
      }).save();
    }
    // For admin role, no additional profile is needed

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    // If user was created but something failed, try to delete it
    if (error.code !== 11000) {
      try {
        await User.findOneAndDelete({ email: req.body.email });
      } catch (deleteError) {
        console.error('Error cleaning up user:', deleteError);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

module.exports = router;
