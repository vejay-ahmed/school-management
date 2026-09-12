const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  feeType: {
    type: String,
    enum: ['tuition', 'transport', 'hostel', 'library', 'lab', 'exam', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online', 'cheque'],
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  remarks: {
    type: String,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Generate receipt number before saving if paid
feeSchema.pre('save', function(next) {
  if (this.paymentStatus === 'paid' && !this.receiptNumber) {
    this.receiptNumber = 'RCP' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
