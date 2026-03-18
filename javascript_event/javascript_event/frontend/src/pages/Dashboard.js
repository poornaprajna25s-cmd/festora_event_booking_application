import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', 1);
      params.append('limit', 6);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchAssignedEvents = useCallback(async () => {
    if (user && user.role === 'admin') {
      try {
        const response = await api.get('/admin/events/assigned?page=1&limit=3');
        setAssignedEvents(response.data.events);
      } catch (err) {
        console.error('Failed to fetch assigned events:', err);
      }
    }
  }, [user]);

  const fetchAllEvents = useCallback(async () => {
    if (user && user.role === 'admin') {
      try {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 6);
        if (selectedCategory) params.append('category', selectedCategory);
        
        const response = await api.get(`/admin/events?${params.toString()}`);
        setAllEvents(response.data.events);
      } catch (err) {
        console.error('Failed to fetch all events:', err);
      }
    }
  }, [user, selectedCategory]);

  const fetchMyEvents = useCallback(async () => {
    if (user && user.role === 'organiser') {
      try {
        const params = new URLSearchParams();
        params.append('page', 1);
        params.append('limit', 3);
        if (selectedCategory) params.append('category', selectedCategory);
        
        const response = await api.get(`/events/my-events?${params.toString()}`);
        setMyEvents(response.data.events);
      } catch (err) {
        console.error('Failed to fetch my events:', err);
      }
    }
  }, [user, selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchEvents();
      fetchAssignedEvents();
      fetchAllEvents();
      fetchMyEvents();
    }
  }, [user, fetchEvents, fetchAssignedEvents, fetchAllEvents, fetchMyEvents]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/events/categories');
      setCategories(response.data.categories);
    } catch (err) {
      // Fallback to default categories
      setCategories([
        'Technical',
        'Cultural',
        'Literary',
        'Sports',
        'Entrepreneurial',
        'Social Service',
        'Informal'
      ]);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Function to get the first image attachment from an event
  const getEventImageUrl = (event) => {
    if (event.attachments && event.attachments.length > 0) {
      const imageAttachment = event.attachments.find(attachment => attachment.type === 'image');
      if (imageAttachment) {
        // Check if the URL is already absolute or needs the base URL
        if (imageAttachment.url.startsWith('http')) {
          return imageAttachment.url;
        } else {
          return `http://localhost:5001${imageAttachment.url}`;
        }
      }
    }
    return null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Welcome, {user.name}!</h1>
      <p className="text-lg mb-8 text-center">Role: <span className="font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>{user.role}</span></p>
      
      {/* For Organizers: Show action cards first */}
      {user.role === 'organiser' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Create Event</h3>
            <p className="mb-4">Create a new event and submit it for admin approval.</p>
            <Link to="/create-event" className="btn-primary inline-block">
              Create Event
            </Link>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>My Events</h3>
            <p className="mb-4">View and manage all events you've created.</p>
            <Link to="/my-events" className="btn-primary inline-block">
              View My Events
            </Link>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Completed Events</h3>
            <p className="mb-4">View all events you've organized that have been completed.</p>
            <Link to="/completed-events" className="btn-primary inline-block">
              View Completed Events
            </Link>
          </div>
        </div>
      )}
      
      {/* For Students: Show action cards before category filter */}
      {user.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Browse Events</h3>
            <p className="mb-4">View all upcoming events and register for ones that interest you.</p>
            <Link to="/events" className="btn-primary inline-block">
              View Events
            </Link>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>My Registrations</h3>
            <p className="mb-4">View all events you've registered for and your attendance status.</p>
            <Link to="/my-registrations" className="btn-primary inline-block">
              View Registrations
            </Link>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Completed Events</h3>
            <p className="mb-4">View events you've registered for that have been completed.</p>
            <Link to="/completed-registrations" className="btn-primary inline-block">
              View Completed Events
            </Link>
          </div>
        </div>
      )}
      
      {/* Category Navigation Bar */}
      <div className="card mb-8 glow">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === '' 
                ? 'bg-primary-btn text-white shadow-lg' 
                : 'bg-card-bg text-text-color hover:bg-accent-color hover:text-white'
            }`}
          >
            All Events
          </button>
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryChange(category)}
              className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === category 
                  ? 'bg-primary-btn text-white shadow-lg' 
                  : 'bg-card-bg text-text-color hover:bg-accent-color hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {user.role === 'student' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>
              {selectedCategory ? `${selectedCategory} Events` : 'Upcoming Events'}
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="card text-center py-8">
              <p>No upcoming events found.</p>
              <Link to="/events" className="btn-primary inline-block mt-4">
                View All Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                      {event.category}
                    </span>
                  </div>
                  
                  {getEventImageUrl(event) && (
                    <div className="mb-3">
                      <img 
                        src={getEventImageUrl(event)} 
                        alt={event.title}
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <p className="text-text-color mb-2">{event.shortDescription}</p>
                  <p className="mb-2">
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Location:</span> {event.location}
                  </p>
                  <Link 
                    to={`/events/${event._id}`} 
                    className="btn-primary inline-block mt-2"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* For Organizers: Show my events section first */}
      {user.role === 'organiser' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {selectedCategory ? `My ${selectedCategory} Events` : 'My Events'}
          </h2>
          {myEvents.length === 0 ? (
            <div className="card text-center py-8">
              <p>You haven't created any events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div key={event._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      event.status === 'approved' ? 'text-green-600' :
                      event.status === 'pending' ? 'text-yellow-600' :
                      event.status === 'rejected' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  {getEventImageUrl(event) && (
                    <div className="mb-3">
                      <img 
                        src={getEventImageUrl(event)} 
                        alt={event.title}
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <p className="text-text-color mb-2 text-sm">{event.shortDescription}</p>
                  <p className="mb-1">
                    <span className="font-semibold">Category:</span> {event.category}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  
                  <Link 
                    to={`/events/${event._id}`} 
                    className="btn-primary inline-block w-full text-center mt-2"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user.role === 'admin' && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-primary">Assigned Events</h3>
              <p className="mb-4">Review and approve events assigned to you for approval.</p>
              <Link to="/assigned-events" className="btn-primary inline-block">
                View Assigned Events
              </Link>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-2 text-primary">Completed Events</h3>
              <p className="mb-4">View events assigned to you that have been completed.</p>
              <Link to="/assigned-completed-events" className="btn-primary inline-block">
                View Completed Events
              </Link>
            </div>
          </>
        )}
      </div>
      
      {/* For Admins: Show all events section with images */}
      {user.role === 'admin' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {selectedCategory ? `${selectedCategory} Events` : 'All Events'}
          </h2>
          {allEvents.length === 0 ? (
            <div className="card text-center py-8">
              <p>No events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((event) => (
                <div key={event._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      event.status === 'approved' ? 'text-green-600' :
                      event.status === 'pending' ? 'text-yellow-600' :
                      event.status === 'rejected' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  {getEventImageUrl(event) && (
                    <div className="mb-3">
                      <img 
                        src={getEventImageUrl(event)} 
                        alt={event.title}
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <p className="text-text-color mb-2 text-sm">{event.shortDescription}</p>
                  <p className="mb-1">
                    <span className="font-semibold">Category:</span> {event.category}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Organiser:</span> {event.organiser.name}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  
                  {event.assignedAdmin && (
                    <p className="mb-3">
                      <span className="font-semibold">Assigned Admin:</span> {event.assignedAdmin.name}
                    </p>
                  )}
                  
                  <Link 
                    to={`/events/${event._id}`} 
                    className="btn-primary inline-block w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* For Admins: Show assigned events section */}
      {user.role === 'admin' && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-white" style={{ textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Events Assigned to You</h2>
          {assignedEvents.length === 0 ? (
            <div className="card text-center py-8">
              <p>No events assigned for your approval.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedEvents.map((event) => (
                <div key={event._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white" style={{ textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>{event.title}</h3>
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                      {event.category}
                    </span>
                  </div>
                  <p className="text-text-color mb-2">{event.shortDescription}</p>
                  <p className="mb-2">
                    <span className="font-semibold">Organiser:</span> {event.organiser.name}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <Link 
                      to={`/events/${event._id}`} 
                      className="btn-primary inline-block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;