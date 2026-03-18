import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AssignedEvents = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAssignedEvents();
  }, [currentPage, categoryFilter]);

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

  const fetchAssignedEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', 6);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await api.get(`/admin/events/assigned?${params.toString()}`);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch assigned events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await api.post(`/admin/events/${eventId}/approve`);
      // Refresh the list
      fetchAssignedEvents();
    } catch (err) {
      setError('Failed to approve event');
      console.error(err);
    }
  };

  const handleReject = async (eventId, reason) => {
    try {
      await api.post(`/admin/events/${eventId}/reject`, { rejectionReason: reason });
      // Refresh the list
      fetchAssignedEvents();
    } catch (err) {
      setError('Failed to reject event');
      console.error(err);
    }
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assigned events...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>Events Assigned for Approval</h1>
        <div>
          <label htmlFor="assignedEventsCategoryFilter" className="mr-2 text-white">Filter by category:</label>
          <select
            id="assignedEventsCategoryFilter"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
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
          <p>No events assigned for your approval.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {events.map((event) => (
              <div key={event._id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-primary mr-2">{event.title}</h3>
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
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(event._id)}
                      className="btn-primary px-4 py-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleReject(event._id, reason);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  event.status === 'approved' ? 'text-green-600' :
                  event.status === 'pending' ? 'text-yellow-600' :
                  event.status === 'rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <Link 
                  to={`/events/${event._id}`} 
                  className="btn-secondary inline-block mt-4"
                >
                  View Event Details
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

export default AssignedEvents;