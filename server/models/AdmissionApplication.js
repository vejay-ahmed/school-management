const mongoose = require('mongoose');

const admissionApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  nationality: {
    type: String,
    trim: true
  },
  religion: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'USA' }
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  previousSchool: {
    name: { type: String, trim: true },
    address: { type: String },
    grade: { type: String },
    year: { type: String }
  },
  applyingForClass: {
    type: String,
    required: true
  },
  selectedSubjects: [{
    type: String,
    trim: true
  }],
  parentInfo: {
    fatherName: { type: String, required: true },
    fatherOccupation: { type: String },
    fatherPhone: { type: String },
    fatherEmail: { type: String },
    motherName: { type: String, required: true },
    motherOccupation: { type: String },
    motherPhone: { type: String },
    motherEmail: { type: String },
    guardianName: { type: String },
    guardianRelation: { type: String },
    guardianPhone: { type: String },
    guardianEmail: { type: String }
  },
  medicalInfo: {
    bloodGroup: { type: String },
    allergies: { type: String },
    medications: { type: String },
    disabilities: { type: String }
  },
  documents: {
    birthCertificate: { type: String, default: '' },
    previousReportCard: { type: String, default: '' },
    transferCertificate: { type: String, default: '' },
    photoId: { type: String, default: '' },
    medicalCertificate: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  statusHistory: [{
    status: String,
    notes: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Generate application ID before saving
admissionApplicationSchema.pre('save', function(next) {
  if (!this.applicationId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.applicationId = `ADM-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('AdmissionApplication', admissionApplicationSchema);
