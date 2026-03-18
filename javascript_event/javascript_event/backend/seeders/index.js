const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://gaana:1234@cluster.y4fbnyi.mongodb.net/final", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Organiser User',
    email: 'organiser@example.com',
    password: 'organiser123',
    role: 'organiser'
  },
  {
    name: 'Student One',
    email: 'student1@example.com',
    password: 'student123',
    role: 'student'
  },
  {
    name: 'Student Two',
    email: 'student2@example.com',
    password: 'student123',
    role: 'student'
  },
  {
    name: 'Student Three',
    email: 'student3@example.com',
    password: 'student123',
    role: 'student'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create users with hashed passwords
    const users = [];
    for (const userData of seedUsers) {
      // Let the User model handle password hashing through pre-save hook
      const { password, ...userDataWithoutPassword } = userData;
      
      const user = new User({
        ...userDataWithoutPassword,
        passwordHash: password // This will be hashed by the pre-save hook
      });
      
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    }
    
    // Create sample events
    const adminUser = users.find(u => u.role === 'admin');
    const organiserUser = users.find(u => u.role === 'organiser');
    
    if (adminUser && organiserUser) {
      const event1 = new Event({
        title: 'Tech Conference 2023',
        shortDescription: 'Annual technology conference',
        longDescription: 'Join us for the biggest technology conference of the year featuring keynote speakers, workshops, and networking opportunities.',
        location: 'Main Auditorium, College Campus',
        category: 'Technical',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 30 days + 8 hours
        registrationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        capacity: 100,
        organiser: organiserUser._id,
        assignedAdmin: adminUser._id,
        status: 'approved'
      });
      
      await event1.save();
      console.log('Created event: Tech Conference 2023');
      
      const event2 = new Event({
        title: 'Art Exhibition',
        shortDescription: 'Student art showcase',
        longDescription: 'Showcasing the artistic talents of our students in various mediums including painting, sculpture, and digital art.',
        location: 'Art Gallery, College Campus',
        category: 'Cultural',
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 15 days + 6 hours
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        capacity: 50,
        organiser: organiserUser._id,
        assignedAdmin: adminUser._id,
        status: 'draft'
      });
      
      await event2.save();
      console.log('Created event: Art Exhibition');
    }
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();