const Event = require('../models/Event');
const { sendEventReminders } = require('./navigationController');

// @desc    Update event statuses from approved to completed
// @route   POST /api/automation/update-event-statuses
// @access  System only (cron job)
const updateEventStatuses = async (req, res) => {
  try {
    const now = new Date();
    console.log(`Manual event status update triggered at ${now.toISOString()}`);
    
    // Find approved events that have ended (with a small buffer to account for timezone differences)
    const bufferTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes buffer
    const eventsToUpdate = await Event.find({
      status: 'approved',
      endDate: { $lt: bufferTime }
    });
    
    console.log(`Found ${eventsToUpdate.length} approved events that have ended`);
    
    // Update their status to completed
    let updatedCount = 0;
    const errors = [];
    
    for (const event of eventsToUpdate) {
      try {
        // Double-check that the event hasn't already been marked as completed
        if (event.status === 'approved') {
          event.status = 'completed';
          await event.save();
          console.log(`Event ${event.title} (${event._id}) manually marked as completed`);
          updatedCount++;
        } else {
          console.log(`Event ${event.title} (${event._id}) already has status ${event.status}`);
        }
      } catch (saveError) {
        console.error(`Error saving event ${event.title} (${event._id}):`, saveError);
        errors.push({
          eventId: event._id,
          eventName: event.title,
          error: saveError.message
        });
      }
    }
    
    const response = {
      message: 'Event statuses update process completed',
      totalFound: eventsToUpdate.length,
      successfullyUpdated: updatedCount,
      errors: errors
    };
    
    console.log(`Manual update result:`, response);
    res.json(response);
  } catch (error) {
    console.error('Error updating event statuses:', error);
    res.status(500).json({ 
      message: 'Server error during event status update',
      error: error.message 
    });
  }
};

// @desc    Send event reminders
// @route   POST /api/automation/send-reminders
// @access  System only (cron job)
const sendReminders = async (req, res) => {
  try {
    // Get io instance from app
    const io = req.app.get('io');
    // Get connected users from app (if available)
    const connectedUsers = req.app.get('connectedUsers') || new Map();
    
    const notificationsSent = await sendEventReminders(io, connectedUsers);
    
    res.json({ 
      message: 'Event reminders sent', 
      notificationsSent 
    });
  } catch (error) {
    console.error('Error sending event reminders:', error);
    res.status(500).json({ 
      message: 'Server error during sending event reminders',
      error: error.message 
    });
  }
};

module.exports = {
  updateEventStatuses,
  sendReminders
};