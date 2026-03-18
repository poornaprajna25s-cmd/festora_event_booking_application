const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get completed events for organisers
// @route   GET /api/events/completed/my-events
// @access  Organiser only
const getMyCompletedEvents = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter for organiser's completed events
    const filter = { 
      organiser: req.user.id,
      status: 'completed'
    };

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Get completed events for this organiser
    const events = await Event.find(filter)
      .populate('assignedAdmin', 'name')
      .sort({ endDate: -1 }) // Sort by end date, most recent first
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

// @desc    Get completed events for admins
// @route   GET /api/events/completed/assigned
// @access  Admin only
const getAssignedCompletedEvents = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter for admin's assigned completed events
    const filter = { 
      assignedAdmin: req.user.id,
      status: 'completed'
    };

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Get completed events assigned to this admin
    const events = await Event.find(filter)
      .populate('organiser', 'name')
      .sort({ endDate: -1 }) // Sort by end date, most recent first
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

// @desc    Get student's completed event registrations
// @route   GET /api/events/completed/my-registrations
// @access  Student only
const getMyCompletedRegistrations = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get registrations for completed events for this student
    const registrations = await Registration.find({ studentId: req.user.id })
      .populate({
        path: 'eventId',
        match: { status: 'completed' },
        select: 'title shortDescription startDate endDate location',
        populate: {
          path: 'organiser',
          select: 'name'
        }
      })
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out registrations where eventId is null (due to match filter)
    const filteredRegistrations = registrations.filter(reg => reg.eventId);

    const total = await Registration.countDocuments({ 
      studentId: req.user.id,
      eventId: { $in: filteredRegistrations.map(reg => reg.eventId._id) }
    });

    res.json({
      registrations: filteredRegistrations,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRegistrations: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyCompletedEvents,
  getAssignedCompletedEvents,
  getMyCompletedRegistrations
};