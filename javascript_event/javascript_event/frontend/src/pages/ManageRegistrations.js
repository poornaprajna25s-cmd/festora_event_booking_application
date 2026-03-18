import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ManageRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to fetch event details');
      console.error(err);
    }
  }, [id]);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}/registrations?page=${currentPage}&limit=10`);
      console.log('Full response data:', response.data); // Debug log
      console.log('Registrations array:', response.data.registrations); // Debug log
      response.data.registrations.forEach((reg, index) => {
        console.log(`Registration ${index}:`, reg);
        console.log(`Student ID object:`, reg.studentId);
      });
      setRegistrations(response.data.registrations);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to fetch event registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, currentPage]);

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
  }, [fetchEvent, fetchRegistrations]);

  const handleAttendanceChange = (registrationId, present) => {
    // Check if attendance has already been marked
    const registration = registrations.find(reg => reg._id === registrationId);
    if (registration && registration.attendance !== null) {
      // Attendance already marked, don't allow changes
      return;
    }
    
    setRegistrations(prev => 
      prev.map(reg => 
        reg._id === registrationId 
          ? { ...reg, attendance: present } 
          : reg
      )
    );
  };

  const handleMarkAttendance = async () => {
    try {
      setAttendanceLoading(true);
      setSuccess('');
      
      // Prepare attendance data for only unmarked registrations
      const attendanceData = registrations
        .filter(reg => reg.attendance !== null && reg.attendance !== undefined)
        .map(reg => ({
          registrationId: reg._id,
          present: reg.attendance
        }));
      
      // If no attendance data to save, show message
      if (attendanceData.length === 0) {
        setSuccess('No attendance changes to save');
        setTimeout(() => setSuccess(''), 3000);
        setAttendanceLoading(false);
        return;
      }
      
      await api.post(`/events/${id}/attendance`, { registrations: attendanceData });
      
      setSuccess('Attendance marked successfully!');
      // Refresh registrations to show updated attendance
      fetchRegistrations();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setAttendanceLoading(false);
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

  // Helper function to safely access student data
  const getStudentData = (registration, field) => {
    if (!registration || !registration.studentId) {
      return 'N/A';
    }
    
    if (typeof registration.studentId === 'string') {
      // If studentId is a string, it means population failed
      return 'N/A';
    }
    
    return registration.studentId[field] || 'N/A';
  };

  if (loading) {
    return <div className="text-center py-8">Loading event registrations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message">{error}</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-black mb-2">Manage Registrations</h1>
      <h2 className="text-2xl font-semibold mb-6 text-black">{event.title}</h2>
      
      {success && (
        <div className="card mb-6 success-message">
          {success}
        </div>
      )}
      
      {registrations.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-black">No registrations found for this event.</p>
        </div>
      ) : (
        <>
          <div className="card mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-black font-bold">Student</th>
                    <th className="py-3 px-4 text-left text-black font-bold">Email</th>
                    <th className="py-3 px-4 text-left text-black font-bold">Department</th>
                    <th className="py-3 px-4 text-left text-black font-bold">USN</th>
                    <th className="py-3 px-4 text-left text-black font-bold">Registration Date</th>
                    <th className="py-3 px-4 text-left text-black font-bold">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration._id} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-black">{getStudentData(registration, 'name')}</td>
                      <td className="py-3 px-4 text-black">{getStudentData(registration, 'email')}</td>
                      <td className="py-3 px-4 text-black">{getStudentData(registration, 'department')}</td>
                      <td className="py-3 px-4 text-black">{getStudentData(registration, 'usn')}</td>
                      <td className="py-3 px-4 text-black">{formatDate(registration.registeredAt)}</td>
                      <td className="py-3 px-4">
                        {registration.attendance === null || registration.attendance === undefined ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAttendanceChange(registration._id, true)}
                              className="px-3 py-1 rounded text-sm bg-gray-200 text-black hover:bg-gray-300"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(registration._id, false)}
                              className="px-3 py-1 rounded text-sm bg-gray-200 text-black hover:bg-gray-300"
                            >
                              Absent
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            registration.attendance 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {registration.attendance ? 'Present' : 'Absent'}
                          </span>
                        )}
                      </td>
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
                
                <span className="px-4 text-black">
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
          
          <div className="card mb-6">
            <h3 className="text-xl font-semibold mb-4 text-black">Mark Attendance</h3>
            <p className="mb-4 text-black">
              Select Present or Absent for each student, then click "Save Attendance" to record attendance.
              Note: Once attendance is saved, it cannot be changed.
            </p>
            <button
              onClick={handleMarkAttendance}
              disabled={attendanceLoading}
              className="btn-primary px-4 py-2"
            >
              {attendanceLoading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary px-4 py-2 text-black"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ManageRegistrations;