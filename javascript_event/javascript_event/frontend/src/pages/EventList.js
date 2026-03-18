import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, selectedCategory]);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 6);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Upcoming Events</h1>
        <div>
          <label htmlFor="categoryFilter" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)', marginRight: '0.5rem' }}>Filter by category:</label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="form-input inline-block w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {events.length === 0 ? (
        <div className="card text-center py-8">
          <p>No events found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <div key={event._id} className="card">
                {/* Display event image if available */}
                {getEventImageUrl(event) && (
                  <div className="mb-3">
                    <img 
                      src={getEventImageUrl(event)} 
                      alt={event.title}
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>{event.title}</h3>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm">
                    {event.category}
                  </span>
                </div>
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
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-secondary px-4 py-2"
              >
                Previous
              </button>
              
              <span className="px-4 text-white">
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

export default EventList;