const express = require('express');
const router = express.Router();
const { updateEventStatuses, sendReminders } = require('../controllers/automationController');

// @route   POST /api/automation/update-event-statuses
// @desc    Update event statuses from approved to completed
// @access  System only (cron job)
router.post('/update-event-statuses', updateEventStatuses);

// @route   POST /api/automation/send-reminders
// @desc    Send event reminders
// @access  System only (cron job)
router.post('/send-reminders', sendReminders);

module.exports = router;