const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { paginationValidation, idValidation } = require('../validators/event');
const { 
  getNotifications,
  getUnreadNotificationsCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { sendEventReminders } = require('../controllers/navigationController');

// Student routes
router.get(
  '/',
  auth,
  roleCheck('student'),
  paginationValidation,
  getNotifications
);

router.get(
  '/unread-count',
  auth,
  roleCheck('student'),
  getUnreadNotificationsCount
);

router.put(
  '/:id/read',
  auth,
  roleCheck('student'),
  idValidation,
  markAsRead
);

router.put(
  '/read-all',
  auth,
  roleCheck('student'),
  markAllAsRead
);

// Test route to manually trigger event reminders (for testing only)
router.post(
  '/send-reminders',
  async (req, res) => {
    try {
      // Get io instance from app
      const io = req.app.get('io');
      // For testing, we'll pass an empty Map for connectedUsers
      const connectedUsers = new Map();
      const notificationsSent = await sendEventReminders(io, connectedUsers);
      res.json({ 
        message: 'Event reminders sent', 
        notificationsSent 
      });
    } catch (error) {
      console.error('Error sending event reminders:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;