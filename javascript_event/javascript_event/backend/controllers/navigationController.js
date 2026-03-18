const Notification = require('../models/Notification');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Send event reminder notifications
// @route   POST /api/notifications/send-reminders
// @access  System only (cron job)
const sendEventReminders = async (io, connectedUsers) => {
  try {
    const now = new Date();
    console.log(`Checking for event notifications at ${now.toISOString()}`);
    
    // Get today's date range (start of day to end of day)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    console.log(`Checking for events between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
    
    // Find all approved events happening today
    const eventsToday = await Event.find({
      status: 'approved',
      startDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    let totalNotifications = 0;

    if (eventsToday.length > 0) {
      console.log(`Found ${eventsToday.length} events happening today`);
    } else {
      console.log('No events found for today');
      return 0;
    }

    for (const event of eventsToday) {
      console.log(`Processing notifications for event: ${event.title} (${event._id})`);
      
      // Find all students registered for this event (without populating)
      const registrations = await Registration.find({ 
        eventId: event._id,
        status: 'registered'
      });

      console.log(`Found ${registrations.length} registrations for event ${event.title}`);

      for (const registration of registrations) {
        console.log(`Processing registration for student: ${registration.studentId}`);
        
        // Check if a "event today" notification already exists for this student and event
        // Use a more precise query with createdAt date to prevent duplicates
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        const existingNotification = await Notification.findOne({
          studentId: registration.studentId,
          eventId: event._id,
          type: 'event_today',
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        });

        if (!existingNotification) {
          console.log(`Creating new notification for student ${registration.studentId}`);
          
          // Format start and end times for the notification
          const startTime = event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endTime = event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const eventDate = event.startDate.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          
          // Create professional notification message
          const message = `Reminder: You have registered for "${event.title}" today. The event is scheduled from ${startTime} to ${endTime} on ${eventDate}.`;
          
          // Create notification
          const notification = new Notification({
            studentId: registration.studentId,
            eventId: event._id,
            message: message,
            type: 'event_today'
          });

          await notification.save();
          totalNotifications++;
          console.log(`Sent "event today" notification to student ${registration.studentId} for event ${event.title}`);
          console.log(`Notification message: ${message}`);
          
          // Send real-time notification if user is connected
          if (io && connectedUsers) {
            const socketId = connectedUsers.get(registration.studentId.toString());
            if (socketId) {
              io.to(socketId).emit('eventToday', {
                message: message,
                eventId: event._id,
                eventName: event.title,
                eventStartTime: event.startDate,
                eventEndTime: event.endDate
              });
              console.log(`Sent real-time "event today" notification to student ${registration.studentId}`);
            } else {
              console.log(`Student ${registration.studentId} is not connected, skipping real-time notification`);
            }
          }
        } else {
          console.log(`Notification already exists for student ${registration.studentId} for event ${event.title}`);
          console.log(`Existing notification message: ${existingNotification.message}`);
        }
      }
    }

    if (totalNotifications > 0) {
      console.log(`Total new notifications sent: ${totalNotifications}`);
    } else {
      console.log('No new notifications were sent');
    }
    return totalNotifications;
  } catch (error) {
    console.error('Error sending event reminders:', error);
    return 0;
  }
};

module.exports = {
  sendEventReminders
};