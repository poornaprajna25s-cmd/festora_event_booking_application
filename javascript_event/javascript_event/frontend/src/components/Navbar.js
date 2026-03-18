import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const { user, unreadNotificationsCount } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar sticky top-0 z-50" style={{ backgroundColor: '#303030' }}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-3xl font-bold flex items-center">
            <span className="mr-2">🎪</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              FESTORA
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <span className="text-lg px-4 py-3 rounded-lg">Welcome, {user.name}</span>
                <Link to="/dashboard" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link to="/my-registrations" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                      My Registrations
                    </Link>
                    <Link to="/notifications" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg relative">
                      Notifications
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                {user.role === 'organiser' && (
                  <>
                    <Link to="/create-event" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                      Create Event
                    </Link>
                    <Link to="/my-events" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                      My Events
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/assigned-events" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                    Assigned Events
                  </Link>
                )}
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                  Login
                </Link>
                <Link to="/signup" className="hover:bg-white/10 px-4 py-3 rounded-lg transition-all text-lg">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;