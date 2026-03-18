# Campus Event Hub (Festora Event Booking)

A full-stack **college event management platform** built with a modern JavaScript stack. It supports role-based access control, event registration, attendance tracking, approvals, and a rich user interface designed for students, organisers, and admins.

---

## 🚀 Project Summary

**Campus Event Hub** is designed to streamline event discovery, submission, approval, registration, and attendance tracking for university campuses. The platform provides:

- A **modern React + Tailwind** frontend for an intuitive user experience
- A **Node.js + Express** backend with REST APIs and role-based access control
- A **MongoDB** database with Mongoose for robust data modeling
- JWT-based authentication and secure password hashing

---

## 🌟 Key Features (Highlights)

- **Role-based access control (RBAC)** for Student, Organiser, and Admin users
- **Event lifecycle management** (draft → pending → approved/rejected)
- **Student registration flow** with deadline and capacity checks
- **Attendance marking** & **CSV export** for event organizers
- **Admin approval workflow** with rejection reasons and event assignment
- **File uploads** for event attachments (posters, documents)
- Secure validation using `express-validator` and password hashing with `bcrypt`

---

## 🧱 Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Validation**: express-validator

---

## 🧩 Repository Structure

- `backend/` – Express API, routes, controllers, models, middleware
- `frontend/` – React SPA with pages, components, and services
- `backend/seeders/` – Sample seed data for development
- `backend/uploads/` – Uploaded event assets (images/documents)

---

## ▶️ Getting Started (Local Development)

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd javascript_event/javascript_event
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file (from `.env.example`) with values for:
   - `PORT` (e.g., `5002`)
   - `MONGODB_URI`
   - `JWT_SECRET`

3. **Frontend setup**

   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file with:
   - `REACT_APP_API_URL` (e.g., `http://localhost:5002/api`)

4. **Run both servers**

   - Backend:
     ```bash
     cd backend
     npm start
     ```

   - Frontend:
     ```bash
     cd frontend
     npm start
     ```

---

## ✅ What Recruiters Should Know

- Built a **full-stack web app** from end-to-end with real-world workflows.
- Implemented **secure authentication** and **fine-grained authorization**.
- Designed and built **REST APIs** with proper validation and error handling.
- Created a **responsive, user-friendly UI** using modern React patterns.
- Structured the codebase for maintainability and scalability.

---

## 📄 API Overview (High Level)

Key endpoints include:

- `POST /api/auth/signup` — register user
- `POST /api/auth/login` — login and get JWT
- `GET /api/events` — list approved events
- `POST /api/events` — create event (organiser only)
- `POST /api/events/:id/submit` — submit event for approval
- `POST /api/events/:id/register` — register for an event (student only)
- `POST /api/admin/events/:id/approve` — approve event (admin only)

---

## 🧪 Testing & Seed Data

- Seed data is available under `backend/seeders/index.js` for quick demo setup.

---

## 📌 Notes

- `.env` files are intentionally excluded from version control.
- Passwords are hashed using `bcrypt`.
- Use strong secrets for `JWT_SECRET` and rotate them regularly in production.

---
