const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  registrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  present: {
    type: Boolean,
    default: false
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
attendanceSchema.index({ registrationId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);