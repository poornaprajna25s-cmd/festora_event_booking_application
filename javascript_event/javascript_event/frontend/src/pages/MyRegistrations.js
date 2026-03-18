import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMyRegistrations();
  }, [currentPage]);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/my-registrations?page=${currentPage}&limit=6`);
      setRegistrations(response.data.registrations);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch your registrations');
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
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading your registrations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>My Event Registrations</h1>
      
      {registrations.length === 0 ? (
        <div className="card text-center py-8">
          <p>You haven't registered for any events yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left" style={{ color: '#000000' }}>Event</th>
                  <th className="py-3 px-4 text-left" style={{ color: '#000000' }}>Registration Date</th>
                  <th className="py-3 px-4 text-left" style={{ color: '#000000' }}>Status</th>
                  <th className="py-3 px-4 text-left" style={{ color: '#000000' }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration._id} className="border-b border-gray-200">
                    <td className="py-3 px-4">
                      <Link 
                        to={`/events/${registration.eventId._id}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {registration.eventId.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium" style={{ color: '#000000' }}>{formatDate(registration.registeredAt)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                        Registered
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {registration.attendance === null ? (
                        <span className="px-2 py-1 rounded bg-gray-100 text-text-color">
                          Not Marked
                        </span>
                      ) : registration.attendance ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-800">
                          Present
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-800">
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default MyRegistrations;