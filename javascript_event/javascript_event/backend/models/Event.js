const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  longDescription: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  capacity: {
    type: Number,
    min: 1
  },
  category: {
    type: String,
    enum: ['Technical', 'Cultural', 'Literary', 'Sports', 'Entrepreneurial', 'Social Service', 'Informal'],
    required: true
  },
  attachments: [attachmentSchema],
  organiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ status: 1 });
eventSchema.index({ organiser: 1 });
eventSchema.index({ assignedAdmin: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ registrationDeadline: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);