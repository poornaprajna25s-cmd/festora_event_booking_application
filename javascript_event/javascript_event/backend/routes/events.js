const express = require('express');
const { createEventValidation, paginationValidation, idValidation } = require('../validators/event');
const { 
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
  getMyEvents,
  updateEventStatuses
} = require('../controllers/eventController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// @route   POST /api/events/update-statuses
// @desc    Update event statuses manually (for testing) - Deprecated
// @access  Public (for testing only)
router.post('/update-statuses', updateEventStatuses);

// @route   GET /api/events/categories
// @desc    Get all event categories
// @access  Public
router.get('/categories', getEventCategories);

// @route   GET /api/events/admins
// @desc    Get all admins
// @access  Organiser/Admin only
router.get('/admins', auth, roleCheck('organiser', 'admin'), getAdmins);

// @route   GET /api/events/my-registrations
// @desc    Get student's registrations
// @access  Student only
router.get('/my-registrations', auth, roleCheck('student'), paginationValidation, getMyRegistrations);

// @route   GET /api/events/my-events
// @desc    Get organiser's events
// @access  Organiser only
router.get('/my-events', auth, roleCheck('organiser'), paginationValidation, getMyEvents);

// @route   GET /api/events
// @desc    Get all approved events
// @access  Public
router.get('/', paginationValidation, getEvents);

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public (approved) or Private (organiser/admin)
router.get('/:id', auth, idValidation, getEventById);

// @route   POST /api/events
// @desc    Create new event
// @access  Organiser only
router.post('/', auth, roleCheck('organiser'), createEventValidation, createEvent);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Organiser only
router.put('/:id', auth, roleCheck('organiser'), idValidation, createEventValidation, updateEvent);

// @route   POST /api/events/:id/submit
// @desc    Submit event for approval
// @access  Organiser only
router.post('/:id/submit', auth, roleCheck('organiser'), idValidation, submitEventForApproval);

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Student only
router.post('/:id/register', auth, roleCheck('student'), idValidation, registerForEvent);

// @route   GET /api/events/:id/registrations
// @desc    Get event registrations
// @access  Organiser/Admin only
router.get('/:id/registrations', auth, roleCheck('organiser', 'admin'), idValidation, paginationValidation, getEventRegistrations);

// @route   POST /api/events/:id/attendance
// @desc    Mark attendance
// @access  Organiser only
router.post('/:id/attendance', auth, roleCheck('organiser'), idValidation, markAttendance);

// @route   GET /api/events/:id/export-csv
// @desc    Export event data as CSV
// @access  Organiser/Admin only
router.get('/:id/export-csv', auth, roleCheck('organiser', 'admin'), idValidation, exportEventCSV);

module.exports = router;