const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get events assigned to admin for approval
// @route   GET /api/admin/events/assigned
// @access  Admin only
const getAssignedEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get events assigned to this admin with pending status
    const events = await Event.find({
      assignedAdmin: req.user.id,
      status: 'pending'
    })
      .populate('organiser', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments({
      assignedAdmin: req.user.id,
      status: 'pending'
    });

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve event
// @route   POST /api/admin/events/:id/approve
// @access  Admin only (assigned events)
const approveEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is assigned to this admin
    if (event.assignedAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if event is pending
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Event is not pending approval' });
    }

    // Update event status
    event.status = 'approved';
    event.rejectionReason = undefined;
    await event.save();

    // Create notification for organiser
    const notification = new Notification({
      studentId: event.organiser,
      eventId: event._id,
      message: `Your event "${event.title}" has been approved!`,
      type: 'event_update'
    });
    await notification.save();

    // Populate organiser
    await event.populate('organiser', 'name email');

    res.json({
      message: 'Event approved successfully',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reject event
// @route   POST /api/admin/events/:id/reject
// @access  Admin only (assigned events)
const rejectEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is assigned to this admin
    if (event.assignedAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if event is pending
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Event is not pending approval' });
    }

    // Update event status
    event.status = 'rejected';
    event.rejectionReason = rejectionReason;
    await event.save();

    // Create notification for organiser
    const notification = new Notification({
      studentId: event.organiser,
      eventId: event._id,
      message: `Your event "${event.title}" has been rejected. Reason: ${rejectionReason}`,
      type: 'event_update'
    });
    await notification.save();

    // Populate organiser
    await event.populate('organiser', 'name email');

    res.json({
      message: 'Event rejected successfully',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Admin only
const getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    // Filter by status if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const events = await Event.find(filter)
      .populate('organiser', 'name email')
      .populate('assignedAdmin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notifications for admin
// @route   GET /api/admin/notifications
// @access  Admin only
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId: req.user.id });

    res.json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id
// @access  Admin only
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAssignedEvents,
  approveEvent,
  rejectEvent,
  getAllEvents,
  getNotifications,
  markNotificationAsRead
};