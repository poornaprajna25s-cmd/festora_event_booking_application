import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const EventReminderPopup = ({ onAcknowledge }) => {
  const [event, setEvent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [notificationType, setNotificationType] = useState('reminder'); // 'reminder', 'started', 'registration', or 'today'

  useEffect(() => {
    // Connect to socket.io server
    const newSocket = io('http://localhost:5001');
    
    newSocket.on('eventReminder', (data) => {
      setEvent(data);
      setNotificationType(data.type === '24h' ? '24h' : '1h');
      setShowPopup(true);
    });

    newSocket.on('eventStarted', (data) => {
      setEvent(data);
      setNotificationType('started');
      setShowPopup(true);
    });

    newSocket.on('registrationConfirmation', (data) => {
      setEvent(data);
      setNotificationType('registration');
      setShowPopup(true);
    });

    newSocket.on('eventToday', (data) => {
      setEvent(data);
      setNotificationType('today');
      setShowPopup(true);
    });

    return () => newSocket.close();
  }, []);

  const handleAcknowledge = () => {
    setShowPopup(false);
    setEvent(null);
    setNotificationType('reminder');
    if (onAcknowledge) {
      onAcknowledge();
    }
  };

  if (!showPopup || !event) {
    return null;
  }

  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full">
        <h3 className="text-xl font-bold text-primary mb-4">
          {notificationType === 'started' ? 'Event Started' : 
           notificationType === 'registration' ? 'Registration Confirmation' : 
           notificationType === 'today' ? 'Event Reminder' :
           'Event Reminder'}
        </h3>
        <p className="mb-2"><strong>Event:</strong> {event.eventName}</p>
        {notificationType === 'started' ? (
          <p className="mb-4 text-green-500 font-bold">The event has started!</p>
        ) : notificationType === 'registration' ? (
          <p className="mb-4 text-blue-500 font-bold">Registration successful!</p>
        ) : notificationType === 'today' ? (
          <div>
            <p className="mb-2 text-yellow-500 font-bold">This event is happening today!</p>
            <p className="mb-4">{event.message}</p>
          </div>
        ) : notificationType === '24h' ? (
          <p className="mb-4"><strong>Starts in:</strong> 24 hours</p>
        ) : (
          <p className="mb-4"><strong>Starts in:</strong> 1 hour</p>
        )}
        {(event.eventStartTime || event.eventEndTime) && (
          <div className="mb-4">
            {event.eventStartTime && (
              <p className="mb-1"><strong>Start Time:</strong> {formatDateTime(event.eventStartTime)}</p>
            )}
            {event.eventEndTime && (
              <p><strong>End Time:</strong> {formatDateTime(event.eventEndTime)}</p>
            )}
          </div>
        )}
        <button
          onClick={handleAcknowledge}
          className="btn-primary w-full py-2"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default EventReminderPopup;