const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['event_reminder', 'event_update', 'registration_confirmation', 'event_reminder_24h', 'event_reminder_5m', 'event_today'],
    default: 'event_reminder'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ studentId: 1, read: 1 });
notificationSchema.index({ eventId: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);