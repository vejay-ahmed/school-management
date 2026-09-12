const Student = require('../models/Student');

// Resolve the Student document for the logged-in user (student role)
const getStudentByUser = async (userId) => {
  return await Student.findOne({ user: userId });
};

module.exports = { getStudentByUser };