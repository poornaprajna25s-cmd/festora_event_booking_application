import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MyCompletedRegistrations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRegistrations();
  }, [currentPage]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/completed/my-registrations?page=${currentPage}&limit=10`);
      setRegistrations(response.data.registrations);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch completed event registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-8 text-black">Loading completed event registrations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message text-black">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>My Completed Event Registrations</h1>
      
      {registrations.length === 0 ? (
        <div className="card text-center py-8">
          <p style={{ color: '#000000' }}>You have not registered for any completed events.</p>
        </div>
      ) : (
        <>
          <div className="card mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-black">
                  <tr>
                    <th className="py-3 px-4 text-left" style={{ color: '#FFFFFF' }}>Event</th>
                    <th className="py-3 px-4 text-left" style={{ color: '#FFFFFF' }}>Organiser</th>
                    <th className="py-3 px-4 text-left" style={{ color: '#FFFFFF' }}>Start Date</th>
                    <th className="py-3 px-4 text-left" style={{ color: '#FFFFFF' }}>End Date</th>
                    <th className="py-3 px-4 text-left" style={{ color: '#FFFFFF' }}>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration._id} className="border-b border-gray-300">
                      <td className="py-3 px-4">
                        <div className="font-semibold" style={{ color: '#000000' }}>{registration.eventId.title}</div>
                        <div className="text-sm" style={{ color: '#000000' }}>{registration.eventId.shortDescription}</div>
                      </td>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>{registration.eventId.organiser.name}</td>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>{formatDate(registration.eventId.startDate)}</td>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>{formatDate(registration.eventId.endDate)}</td>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>{formatDate(registration.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                
                <span className="px-4" style={{ color: '#000000' }}>
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
          </div>
        </>
      )}
    </div>
  );
};

export default MyCompletedRegistrations;