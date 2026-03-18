import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch unread notifications count for students
  const fetchUnreadNotificationsCount = async () => {
    if (user && user.role === 'student') {
      try {
        const response = await api.get('/notifications/unread-count');
        setUnreadNotificationsCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      }
    }
  };

  // Update unread notifications count
  const updateUnreadNotificationsCount = (count) => {
    setUnreadNotificationsCount(count);
  };

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchUnreadNotificationsCount();
      // Set up interval to periodically check for new notifications
      const interval = setInterval(fetchUnreadNotificationsCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password, role, department, usn) => {
    try {
      // Prepare request data
      const requestData = { name, email, password, role };
      
      // Add department and USN for students
      if (role === 'student') {
        requestData.department = department;
        requestData.usn = usn;
      }
      
      const response = await api.post('/auth/signup', requestData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUnreadNotificationsCount(0);
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    loading,
    unreadNotificationsCount,
    updateUnreadNotificationsCount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};