const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  }
}, {
  timestamps: true
});

// Indexes
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });
registrationSchema.index({ studentId: 1 });

module.exports = mongoose.model('Registration', registrationSchema);