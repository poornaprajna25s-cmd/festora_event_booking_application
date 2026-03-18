# Campus Event Hub

A comprehensive web application for managing college events with role-based access control for students, organisers, and administrators.

## Features

1. **User Authentication & Authorization**
   - JWT-based authentication system
   - Role-based access control (student/organiser/admin)
   - Secure password hashing with bcrypt

2. **Event Management**
   - Create, view, and manage events
   - Event approval workflow (draft → pending → approved/rejected)
   - Category-based event filtering
   - File attachments for events

3. **Registration System**
   - Student event registration
   - Registration deadline enforcement
   - Capacity management

4. **Attendance Tracking**
   - Mark attendance for registered students
   - Export attendance data as CSV
   - View attendance history

5. **Admin Dashboard**
   - Review and approve event submissions
   - View all events in the system
   - Manage event assignments

6. **Organiser Dashboard**
   - Create and manage events
   - View registrations for own events
   - Export event data

7. **Student Dashboard**
   - Browse and register for approved events
   - View registration history
   - Check attendance status

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer middleware
- **Validation**: express-validator

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Set up environment variables (see .env.example files)
5. Run the application:
   - Backend: `npm start` in the backend directory
   - Frontend: `npm start` in the frontend directory

## API Endpoints

### Authentication
- POST /api/auth/signup - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Events
- GET /api/events - Get all approved events
- GET /api/events/:id - Get event by ID
- POST /api/events - Create new event (organiser only)
- PUT /api/events/:id - Update event (organiser only)
- POST /api/events/:id/submit - Submit event for approval (organiser only)
- POST /api/events/:id/register - Register for event (student only)
- GET /api/events/:id/registrations - Get event registrations (organiser/admin only)
- POST /api/events/:id/attendance - Mark attendance (organiser only)
- GET /api/events/:id/export-csv - Export event data as CSV (organiser/admin only)
- GET /api/events/categories - Get all event categories
- GET /api/events/admins - Get all admins (organiser/admin only)

### Admin
- POST /api/admin/events/:id/approve - Approve event (admin only)
- POST /api/admin/events/:id/reject - Reject event (admin only)

## Role-Based Access Control

### Student
- View approved events
- Register for events
- View own registrations and attendance

### Organiser
- Create events
- Submit events for approval
- View own events
- Manage event registrations
- Mark attendance
- Export event data

### Admin
- View all events
- Approve/reject event submissions
- Assign events to other admins
- View assigned events
- Export event data

## Database Models

### User
- name (String, required)
- email (String, required, unique)
- passwordHash (String, required)
- role (String, enum: student/organiser/admin)
- department (String, required for students)
- usn (String, required for students, unique)
- timestamps (createdAt, updatedAt)

### Event
- title (String, required)
- shortDescription (String, required)
- longDescription (String)
- location (String, required)
- category (String, required)
- startDate (Date, required)
- endDate (Date, required)
- registrationDeadline (Date, required)
- capacity (Number)
- organiser (ObjectId, ref: User, required)
- assignedAdmin (ObjectId, ref: User)
- status (String, enum: draft/pending/approved/rejected)
- rejectionReason (String)
- attachments (Array)
- timestamps (createdAt, updatedAt)

### Registration
- eventId (ObjectId, ref: Event, required)
- studentId (ObjectId, ref: User, required)
- status (String, enum: registered, default: registered)
- registeredAt (Date, default: Date.now)

### Attendance
- registrationId (ObjectId, ref: Registration, required, unique)
- present (Boolean, default: false)
- markedBy (ObjectId, ref: User, required)
- markedAt (Date, default: Date.now)
- timestamps (createdAt, updatedAt)

## Environment Variables

### Backend (.env)
- PORT - Server port (default: 5002)
- MONGODB_URI - MongoDB connection string
- JWT_SECRET - Secret key for JWT signing
- NODE_ENV - Environment (development/production)

### Frontend (.env)
- REACT_APP_API_URL - Backend API URL (default: http://localhost:5002/api)

## Security Guidelines

### Environment Variables Protection
1. All `.env` files are included in `.gitignore` to prevent accidental exposure
2. Never commit `.env` files to version control
3. Use strong, randomly generated secrets for JWT_SECRET
4. Rotate secrets regularly in production environments

### Password Requirements
- Minimum 8 characters
- Must contain at least one capital letter
- Must contain at least one special character
- Frontend validation matches backend requirements
