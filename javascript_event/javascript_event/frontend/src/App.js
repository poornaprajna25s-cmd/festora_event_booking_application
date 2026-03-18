import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EventReminderPopup from './components/EventReminderPopup';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import MyRegistrations from './pages/MyRegistrations';
import ManageRegistrations from './pages/ManageRegistrations';
import AssignedEvents from './pages/AssignedEvents';
import MyCompletedEvents from './pages/MyCompletedEvents';
import AssignedCompletedEvents from './pages/AssignedCompletedEvents';
import MyCompletedRegistrations from './pages/MyCompletedRegistrations';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <EventReminderPopup />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/events/:id/registrations" element={<ProtectedRoute requiredRole="organiser"><ManageRegistrations /></ProtectedRoute>} />
              <Route path="/create-event" element={<ProtectedRoute requiredRole="organiser"><CreateEvent /></ProtectedRoute>} />
              <Route path="/my-events" element={<ProtectedRoute requiredRole="organiser"><MyEvents /></ProtectedRoute>} />
              <Route path="/my-registrations" element={<ProtectedRoute requiredRole="student"><MyRegistrations /></ProtectedRoute>} />
              <Route path="/assigned-events" element={<ProtectedRoute requiredRole="admin"><AssignedEvents /></ProtectedRoute>} />
              <Route path="/completed-events" element={<ProtectedRoute requiredRole="organiser"><MyCompletedEvents /></ProtectedRoute>} />
              <Route path="/assigned-completed-events" element={<ProtectedRoute requiredRole="admin"><AssignedCompletedEvents /></ProtectedRoute>} />
              <Route path="/completed-registrations" element={<ProtectedRoute requiredRole="student"><MyCompletedRegistrations /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute requiredRole="student"><Notifications /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;