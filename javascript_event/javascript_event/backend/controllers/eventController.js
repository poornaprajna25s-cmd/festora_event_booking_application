const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Notification = require('../models/Notification');
const attachmentSchema = require('../models/Attachment');
const { createObjectCsvWriter } = require('csv-writer');

// @desc    Update event statuses manually (for testing)
// @route   POST /api/events/update-statuses
// @access  Public (for testing only)
const updateEventStatuses = async (req, res) => {
  try {
    // Redirect to the new automation endpoint
    res.json({ 
      message: 'This endpoint has been deprecated. Please use POST /api/automation/update-event-statuses instead.',
      redirect: '/api/automation/update-event-statuses'
    });
  } catch (error) {
    console.error('Error updating event statuses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
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

    // Only get approved events
    const filter = { status: 'approved' };

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Add date filter if provided
    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      filter.startDate = {
        $gte: date,
        $lt: nextDay
      };
    }

    const events = await Event.find(filter)
      .populate('organiser', 'name')
      .sort({ startDate: 1 })
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

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public (approved) or Private (organiser/admin)
const getEventById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const event = await Event.findById(req.params.id)
      .populate('organiser', 'name')
      .populate('assignedAdmin', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If event is not approved, only organiser or admin can view
    if (event.status !== 'approved') {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check user role
      if (req.user.role !== 'organiser' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // For organisers, check if they own the event
      // Fix: Use event.organiser._id instead of event.organiser.toString()
      if (req.user.role === 'organiser' && event.organiser._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // For admins, allow access to all events
      // No additional checks needed - admins can view all events regardless of assignment
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Organiser only
const createEvent = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      title, 
      shortDescription, 
      longDescription, 
      location, 
      category,
      startDate, 
      endDate, 
      registrationDeadline, 
      capacity,
      assignedAdmin,
      submitForApproval,
      attachments // Add attachments to destructuring
    } = req.body;

    // Create event
    const event = new Event({
      title,
      shortDescription,
      longDescription,
      location,
      category,
      startDate,
      endDate,
      registrationDeadline,
      capacity: capacity || undefined,
      organiser: req.user.id,
      assignedAdmin: assignedAdmin || undefined,
      status: submitForApproval ? 'pending' : 'draft',
      attachments: attachments || [] // Add attachments to event
    });

    await event.save();

    // Populate organiser and assignedAdmin
    await event.populate('organiser', 'name');
    if (event.assignedAdmin) {
      await event.populate('assignedAdmin', 'name');
    }

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Organiser only (own events, draft/rejected status)
const updateEvent = async (req, res) => {
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

    // Check if user is the organiser
    if (event.organiser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if event can be edited (draft or rejected)
    if (event.status !== 'draft' && event.status !== 'rejected') {
      return res.status(400).json({ message: 'Event cannot be edited in current status' });
    }

    const { 
      title, 
      shortDescription, 
      longDescription, 
      location, 
      category,
      startDate, 
      endDate, 
      registrationDeadline, 
      capacity,
      assignedAdmin,
      submitForApproval
      // attachments // Remove attachments from destructuring
    } = req.body;

    // Update event fields
    event.title = title || event.title;
    event.shortDescription = shortDescription || event.shortDescription;
    event.longDescription = longDescription || event.longDescription;
    event.location = location || event.location;
    event.category = category || event.category;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.registrationDeadline = registrationDeadline || event.registrationDeadline;
    event.capacity = capacity || event.capacity;
    event.assignedAdmin = assignedAdmin || event.assignedAdmin;
    event.attachments = attachments || event.attachments; // Add attachments update
    
    // Update status if submitting for approval
    if (submitForApproval) {
      event.status = 'pending';
    }

    await event.save();

    // Populate organiser and assignedAdmin
    await event.populate('organiser', 'name');
    if (event.assignedAdmin) {
      await event.populate('assignedAdmin', 'name');
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit event for approval
// @route   POST /api/events/:id/submit
// @access  Organiser only (own events)
const submitEventForApproval = async (req, res) => {
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

    // Check if user is the organiser
    if (event.organiser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if event can be submitted (draft or rejected)
    if (event.status !== 'draft' && event.status !== 'rejected') {
      return res.status(400).json({ message: 'Event cannot be submitted in current status' });
    }

    // Check if assigned admin is provided
    if (!req.body.assignedAdmin) {
      return res.status(400).json({ message: 'Assigned admin is required' });
    }

    // Update event
    event.assignedAdmin = req.body.assignedAdmin;
    event.status = 'pending';
    await event.save();

    // Populate organiser and assignedAdmin
    await event.populate('organiser', 'name');
    await event.populate('assignedAdmin', 'name');

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Student only
const registerForEvent = async (req, res) => {
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

    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event is not approved for registration' });
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      eventId: event._id,
      studentId: req.user.id
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check capacity if set
    if (event.capacity) {
      const registrationCount = await Registration.countDocuments({
        eventId: event._id,
        status: 'registered'
      });

      if (registrationCount >= event.capacity) {
        return res.status(400).json({ message: 'Event is full' });
      }
    }

    // Create registration
    const registration = new Registration({
      eventId: event._id,
      studentId: req.user.id
    });

    await registration.save();

    // Create notification for the student
    const notification = new Notification({
      studentId: req.user.id,
      eventId: event._id,
      message: `You have successfully registered for the event "${event.title}".`,
      type: 'registration_confirmation'
    });
    await notification.save();

    // Send real-time notification if user is connected
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    if (io && connectedUsers) {
      const socketId = connectedUsers.get(req.user.id.toString());
      if (socketId) {
        io.to(socketId).emit('registrationConfirmation', {
          message: `You have successfully registered for the event "${event.title}".`,
          eventId: event._id,
          eventName: event.title
        });
      }
    }

    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Organiser/Admin only
const getEventRegistrations = async (req, res) => {
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

    // Check permissions
    if (req.user.role === 'organiser' && event.organiser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'admin' && 
        event.assignedAdmin && 
        event.assignedAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get registrations
    const registrations = await Registration.find({ eventId: event._id })
      .populate('studentId', 'name email department usn')
      .skip(skip)
      .limit(limit);

    // Get attendance for each registration
    const registrationsWithAttendance = await Promise.all(
      registrations.map(async (registration) => {
        const attendance = await Attendance.findOne({ registrationId: registration._id });
        // Ensure we're returning a proper object with all registration data
        const regObject = registration.toObject ? registration.toObject() : registration;
        return {
          ...regObject,
          attendance: attendance ? attendance.present : null
        };
      })
    );

    const total = await Registration.countDocuments({ eventId: event._id });

    res.json({
      registrations: registrationsWithAttendance,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRegistrations: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark attendance
// @route   POST /api/events/:id/attendance
// @access  Organiser only (own events)
const markAttendance = async (req, res) => {
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

    // Check if user is the organiser
    if (event.organiser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'Event is not approved' });
    }

    const { registrations } = req.body;

    if (!registrations || !Array.isArray(registrations)) {
      return res.status(400).json({ message: 'Registrations array is required' });
    }

    // Process each registration
    const results = await Promise.all(
      registrations.map(async (item) => {
        try {
          // Find existing attendance record
          let attendance = await Attendance.findOne({ registrationId: item.registrationId });
          
          if (attendance) {
            // Update existing
            attendance.present = item.present;
            attendance.markedBy = req.user.id;
            attendance.markedAt = new Date();
            await attendance.save();
          } else {
            // Create new
            attendance = new Attendance({
              registrationId: item.registrationId,
              present: item.present,
              markedBy: req.user.id
            });
            await attendance.save();
          }
          
          return { registrationId: item.registrationId, success: true };
        } catch (error) {
          return { registrationId: item.registrationId, success: false, error: error.message };
        }
      })
    );

    res.json({
      message: 'Attendance marked successfully',
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export event data as CSV
// @route   GET /api/events/:id/export-csv
// @access  Organiser/Admin only (own events)
const exportEventCSV = async (req, res) => {
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

    // Check if user is the organiser or assigned admin
    const isOrganiser = event.organiser.toString() === req.user.id;
    const isAssignedAdmin = event.assignedAdmin && event.assignedAdmin.toString() === req.user.id;
    
    if (!isOrganiser && !isAssignedAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get registrations
    const registrations = await Registration.find({ eventId: event._id })
      .populate('studentId', 'name email department usn');

    // Get attendance for each registration
    const data = await Promise.all(
      registrations.map(async (registration) => {
        const attendance = await Attendance.findOne({ registrationId: registration._id });
        return {
          studentName: registration.studentId.name,
          email: registration.studentId.email,
          department: registration.studentId.department || '',
          usn: registration.studentId.usn || '',
          registrationDate: registration.registeredAt.toISOString(),
          attendance: attendance ? (attendance.present ? 'Present' : 'Absent') : 'Not Marked'
        };
      })
    );

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.title.replace(/\s+/g, '_')}_registrations.csv"`);

    // Write CSV data
    if (data.length === 0) {
      return res.send('No registrations found');
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: 'temp.csv',
      header: [
        { id: 'studentName', title: 'Student Name' },
        { id: 'email', title: 'Email' },
        { id: 'department', title: 'Department' },
        { id: 'usn', title: 'USN' },
        { id: 'registrationDate', title: 'Registration Date' },
        { id: 'attendance', title: 'Attendance' }
      ]
    });

    // Write data to CSV
    await csvWriter.writeRecords(data);
    
    // Read the file and send it
    const fs = require('fs');
    const csvData = fs.readFileSync('temp.csv', 'utf8');
    res.send(csvData);
    
    // Clean up temp file
    fs.unlinkSync('temp.csv');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all event categories
// @route   GET /api/events/categories
// @access  Public
const getEventCategories = async (req, res) => {
  try {
    const categories = [
      'Technical',
      'Cultural',
      'Literary',
      'Sports',
      'Entrepreneurial',
      'Social Service',
      'Informal'
    ];

    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }, 'name email');
    res.json({ admins });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's registrations
// @route   GET /api/events/my-registrations
// @access  Student only
const getMyRegistrations = async (req, res) => {
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

    // Get registrations for this student, excluding completed events
    const registrations = await Registration.find({ studentId: req.user.id })
      .populate({
        path: 'eventId',
        match: { status: { $ne: 'completed' } }, // Exclude completed events
        select: 'title shortDescription startDate endDate location status',
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

    // Get attendance for each registration
    const registrationsWithAttendance = await Promise.all(
      filteredRegistrations.map(async (registration) => {
        const attendance = await Attendance.findOne({ registrationId: registration._id });
        return {
          ...registration.toObject(),
          attendance: attendance ? attendance.present : null
        };
      })
    );

    const total = await Registration.countDocuments({ 
      studentId: req.user.id,
      eventId: { $in: filteredRegistrations.map(reg => reg.eventId._id) }
    });

    res.json({
      registrations: registrationsWithAttendance,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRegistrations: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get organiser's events
// @route   GET /api/events/my-events
// @access  Organiser only
const getMyEvents = async (req, res) => {
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

    // Build filter for organiser's events
    const filter = { organiser: req.user.id };

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Get events for this organiser
    const events = await Event.find(filter)
      .populate('assignedAdmin', 'name')
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

module.exports = {
  updateEventStatuses,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  submitEventForApproval,
  registerForEvent,
  getEventRegistrations,
  markAttendance,
  exportEventCSV,
  getEventCategories,
  getAdmins,
  getMyRegistrations,
  getMyEvents
};