const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store io instance in app for access in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection handling
const connectedUsers = new Map();
app.set('connectedUsers', connectedUsers);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('registerUser', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove user from connectedUsers map
    for (let [userId, socketId] of connectedUsers) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const completedEventsRoutes = require('./routes/completedEvents');
const automationRoutes = require('./routes/automation');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/events/completed', completedEventsRoutes);
app.use('/api/automation', automationRoutes);

// Schedule a job to update event statuses
const cron = require('node-cron');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const { sendEventReminders } = require('./controllers/navigationController');

// Run every 10 minutes to check for completed events
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log(`Checking for completed events at ${new Date().toISOString()}`);
    
    // Find approved events that have ended (with a small buffer to account for timezone differences)
    const bufferTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes buffer
    const eventsToUpdate = await Event.find({
      status: 'approved',
      endDate: { $lt: bufferTime }
    });
    
    console.log(`Found ${eventsToUpdate.length} events to update`);
    
    // Update their status to completed
    let updatedCount = 0;
    for (const event of eventsToUpdate) {
      try {
        // Double-check that the event hasn't already been marked as completed
        if (event.status === 'approved') {
          event.status = 'completed';
          await event.save();
          console.log(`Event ${event.title} (${event._id}) marked as completed`);
          updatedCount++;
        } else {
          console.log(`Event ${event.title} (${event._id}) already has status ${event.status}`);
        }
      } catch (saveError) {
        console.error(`Error saving event ${event.title} (${event._id}):`, saveError);
      }
    }
    
    if (updatedCount > 0) {
      console.log(`Successfully updated ${updatedCount} events to completed status`);
    }
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
});

// Run every 30 seconds to send event reminders (more frequent for better precision)
cron.schedule('*/30 * * * * *', async () => {
  try {
    console.log(`Running event reminder cron job at ${new Date().toISOString()}`);
    const notificationsSent = await sendEventReminders(io, connectedUsers);
    if (notificationsSent > 0) {
      console.log(`Sent ${notificationsSent} event reminder notifications`);
    } else {
      console.log('No event reminders to send at this time');
    }
  } catch (error) {
    console.error('Error in event reminder cron job:', error);
  }
});

const PORT = process.env.PORT || 5001; // Changed to 5001 to match the frontend expectation
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});