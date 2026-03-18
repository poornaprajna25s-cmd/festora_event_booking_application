const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { paginationValidation } = require('../validators/event');
const { 
  getMyCompletedEvents,
  getAssignedCompletedEvents,
  getMyCompletedRegistrations
} = require('../controllers/completedEventController');

// Organiser routes
router.get(
  '/my-events',
  auth,
  roleCheck('organiser'),
  paginationValidation,
  getMyCompletedEvents
);

// Admin routes
router.get(
  '/assigned',
  auth,
  roleCheck('admin'),
  paginationValidation,
  getAssignedCompletedEvents
);

// Student routes
router.get(
  '/my-registrations',
  auth,
  roleCheck('student'),
  paginationValidation,
  getMyCompletedRegistrations
);

module.exports = router;