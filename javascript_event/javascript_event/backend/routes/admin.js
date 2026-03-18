const express = require('express');
const { idValidation } = require('../validators/event');
const { 
  getAssignedEvents, 
  approveEvent, 
  rejectEvent, 
  getAllEvents, 
  getNotifications, 
  markNotificationAsRead 
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();


router.get('/events/assigned', auth, roleCheck('admin'), getAssignedEvents);


router.post('/events/:id/approve', auth, roleCheck('admin'), idValidation, approveEvent);

router.post('/events/:id/reject', auth, roleCheck('admin'), idValidation, rejectEvent);

router.get('/events', auth, roleCheck('admin'), getAllEvents);

router.get('/notifications', auth, roleCheck('admin'), getNotifications);

router.put('/notifications/:id', auth, roleCheck('admin'), idValidation, markNotificationAsRead);

module.exports = router;