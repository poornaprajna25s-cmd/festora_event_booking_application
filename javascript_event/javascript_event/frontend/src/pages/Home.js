import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center py-12">
      <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
        Campus Event Hub
      </h1>
      <p className="text-xl mb-12 text-white max-w-3xl mx-auto drop-shadow-md">
        Welcome to the comprehensive event management platform for our college community. 
        Discover, create, and manage exciting events with a fiery, modern interface.
      </p>
      
      {!user ? (
        <div className="flex justify-center space-x-6 mb-16">
          <Link to="/login" className="btn-primary text-lg px-8 py-4">
            Login
          </Link>
          <Link to="/signup" className="btn-secondary text-lg px-8 py-4">
            Signup
          </Link>
        </div>
      ) : (
        <div className="card max-w-2xl mx-auto mb-16 glow">
          <h2 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h2>
          <p className="text-lg mb-6">
            You are logged in as a <span className="font-bold text-accent-color">{user.role}</span>.
          </p>
          <Link to="/dashboard" className="btn-primary inline-block">
            Go to Dashboard
          </Link>
        </div>
      )}
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="card glow hover:scale-105">
          <div className="bg-accent-color w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3">For Students</h3>
          <p className="mb-4">Browse and register for upcoming events. View your registrations and attendance records.</p>
          <Link to="/events" className="btn-primary inline-block mt-2">
            Browse Events
          </Link>
        </div>
        
        <div className="card glow hover:scale-105">
          <div className="bg-primary-btn w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3">For Organisers</h3>
          <p className="mb-4">Create and manage events. View registrations and mark attendance for your events.</p>
          <Link to="/create-event" className="btn-primary inline-block mt-2">
            Create Event
          </Link>
        </div>
        
        <div className="card glow hover:scale-105">
          <div className="bg-secondary-btn w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3">For Admins</h3>
          <p className="mb-4">Review and approve events. Manage the entire event ecosystem for the college.</p>
          <Link to="/assigned-events" className="btn-primary inline-block mt-2">
            Review Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;