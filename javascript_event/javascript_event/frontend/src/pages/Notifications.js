import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Notifications = () => {
  const navigate = useNavigate();
  const { user, updateUnreadNotificationsCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notifications?page=${currentPage}&limit=10`);
      setNotifications(response.data.notifications);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Update the notification in the state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update the unread notifications count
      updateUnreadNotificationsCount(prev => prev - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      // Update all notifications in the state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset the unread notifications count
      updateUnreadNotificationsCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-primary px-4 py-2"
          >
            Mark All as Read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="card text-center py-8">
          <p>You have no notifications.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`card p-4 ${!notification.read ? 'border-l-4 border-primary' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="mb-2">
                      <p className="text-lg font-semibold">{notification.message}</p>
                    </div>
                    {notification.eventId && (
                      <div className="text-sm">
                        <p><strong>Event:</strong> {notification.eventId.title}</p>
                        <p><strong>Location:</strong> {notification.eventId.location}</p>
                        <p><strong>Start:</strong> {formatDate(notification.eventId.startDate)}</p>
                        <p><strong>End:</strong> {formatDate(notification.eventId.endDate)}</p>
                      </div>
                    )}
                    {!notification.read && (
                      <p className="text-green-600 font-bold mt-2">New notification - please acknowledge</p>
                    )}
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="btn-secondary px-3 py-1 text-sm ml-4"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary px-4 py-2"
              >
                Previous
              </button>
              
              <span className="px-4" style={{ color: '#FFFFFF' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-secondary px-4 py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;