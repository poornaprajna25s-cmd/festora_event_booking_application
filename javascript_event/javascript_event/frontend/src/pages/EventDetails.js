import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState('');

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setError('');
    } catch (err) {
      // Provide more specific error messages
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError('Event not found');
            break;
          case 403:
            setError('Access denied. You do not have permission to view this event.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(err.response.data?.message || 'Failed to fetch event details');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/events/admins');
      setAdmins(response.data.admins);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      // Fallback to sample data
      setAdmins([
        { _id: 'admin1', name: 'Admin User 1' },
        { _id: 'admin2', name: 'Admin User 2' }
      ]);
    }
  };

  useEffect(() => {
    fetchEvent();
    // Fetch admins if user is organiser and event is in draft or rejected status
    if (user && user.role === 'organiser') {
      fetchAdmins();
    }
  }, [fetchEvent, user]);

  const handleRegister = async () => {
    try {
      setRegisterLoading(true);
      await api.post(`/events/${id}/register`);
      setRegisterSuccess(true);
      setShowRegisterModal(false);
      // Refresh event data to show registration status
      fetchEvent();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to register for event';
      
      // Show specific messages for common registration errors
      if (errorMessage === 'Event is full') {
        setError('This event has reached its capacity limit. Please try registering for another event.');
      } else if (errorMessage === 'Already registered for this event') {
        setError('You are already registered for this event.');
      } else if (errorMessage === 'Registration deadline has passed') {
        setError('The registration deadline for this event has passed.');
      } else if (errorMessage === 'Event is not approved for registration') {
        setError('This event is not currently open for registration.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await api.post(`/admin/events/${id}/approve`);
      // Refresh event data to show updated status
      fetchEvent();
      // Show success message
      alert('Event approved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      await api.post(`/admin/events/${id}/reject`, { rejectionReason });
      // Refresh event data to show updated status
      fetchEvent();
      // Close modal and clear reason
      setShowRejectModal(false);
      setRejectionReason('');
      // Show success message
      alert('Event rejected successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setActionLoading(true);
      if (!selectedAdmin) {
        setError('Please select an admin for approval');
        return;
      }
      
      await api.post(`/events/${id}/submit`, { assignedAdmin: selectedAdmin });
      // Refresh event data to show updated status
      fetchEvent();
      // Close modal
      setShowSubmitModal(false);
      setSelectedAdmin('');
      // Show success message
      alert('Event submitted for approval successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit event for approval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/events/${id}/export-csv`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event?.title?.replace(/\s+/g, '_') || 'event'}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export CSV');
      console.error(err);
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
    hours = hours ? hours : 12;
    hours = String(hours).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  if (loading) {
    return <div className="text-center py-8 text-xl">Loading event details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 error-message text-lg" style={{ color: '#FFFFFF', textShadow: '0 0 2px rgba(0, 0, 0, 0.5)' }}>{error}</div>;
  }

  if (!event) {
    return <div className="text-center py-8 text-xl">Event not found</div>;
  }

  const isOrganiser = user && user.role === 'organiser';
  const isAdmin = user && user.role === 'admin';
  const isStudent = user && user.role === 'student';
  const isEventApproved = event.status === 'approved';
  const isEventPending = event.status === 'pending';
  const isRegistrationOpen = 
    isEventApproved && 
    new Date() < new Date(event.registrationDeadline);

  // Check if this admin is assigned to this event
  // Only assigned admins can approve/reject events
  const isAdminAssigned = isAdmin && isEventPending && event.assignedAdmin && 
    (event.assignedAdmin._id === user.id || event.assignedAdmin._id === user._id || 
     event.assignedAdmin.toString() === user.id || event.assignedAdmin.toString() === user._id);
    
  // Check if this organiser owns this event
  const isOrganiserOwner = isOrganiser && event.organiser && 
    (event.organiser._id === user.id || event.organiser._id === user._id ||
     event.organiser.toString() === user.id || event.organiser.toString() === user._id);

  // Check if current user can export (organiser or assigned admin)
  const canExport = (isOrganiserOwner) || 
                    (isAdmin && event.assignedAdmin && 
                     (event.assignedAdmin._id === user.id || event.assignedAdmin._id === user._id || 
                      event.assignedAdmin.toString() === user.id || event.assignedAdmin.toString() === user._id));
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">{event.title}</h1>
      <p className="text-xl text-center mb-8 text-text-color">{event.shortDescription}</p>
      
      <div className="card mb-8 glow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-accent-color">Event Details</h2>
            <div className="space-y-4">
              <p className="text-lg"><span className="font-bold">Location:</span> {event.location}</p>
              <p className="text-lg"><span className="font-bold">Start:</span> {formatDate(event.startDate)}</p>
              <p className="text-lg"><span className="font-bold">End:</span> {formatDate(event.endDate)}</p>
              <p className="text-lg"><span className="font-bold">Registration Deadline:</span> {formatDate(event.registrationDeadline)}</p>
              {event.capacity && (
                <p className="text-lg"><span className="font-bold">Capacity:</span> {event.capacity} people</p>
              )}
              <p className="text-lg">
                <span className="font-bold">Status:</span>{' '}
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  event.status === 'approved' ? 'text-green-600' :
                  event.status === 'pending' ? 'text-yellow-600' :
                  event.status === 'rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
                </span>
              </p>
              {event.status === 'rejected' && event.rejectionReason && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h3 className="font-bold text-red-300 mb-2">Rejection Reason:</h3>
                  <p className="text-red-200">{event.rejectionReason}</p>
                </div>
              )}
              {event.organiser && (
                <p className="text-lg"><span className="font-bold">Organiser:</span> {event.organiser.name}</p>
              )}
              {event.assignedAdmin && (
                <p className="text-lg"><span className="font-bold">Assigned Admin:</span> {event.assignedAdmin.name}</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 text-accent-color">Description</h2>
            <p className="text-text-color">{event.longDescription}</p>
            
            {event.attachments && event.attachments.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Attachments</h3>
                <ul className="space-y-2">
                  {event.attachments.map((attachment, index) => (
                    <li key={index}>
                      {attachment.type === 'image' ? (
                        <div>
                          <p className="text-sm text-text-color mb-1">{attachment.filename}</p>
                          <img 
                            src={attachment.url.startsWith('http') ? attachment.url : `http://localhost:5001${attachment.url}`} 
                            alt={attachment.filename}
                            className="max-w-full h-auto rounded border"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      ) : (
                        <a 
                          href={attachment.url.startsWith('http') ? attachment.url : `http://localhost:5001${attachment.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {attachment.filename} ({attachment.type.toUpperCase()})
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Organiser Actions - Only show for event owners */}
      {isOrganiserOwner && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Organiser Actions</h2>
          <div className="flex flex-wrap gap-3">
            {/* Show submit for approval button for draft or rejected events */}
            {(event.status === 'draft' || event.status === 'rejected') && (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn-primary px-4 py-2"
              >
                Submit for Approval
              </button>
            )}
            
            {/* Show manage registrations button for approved or pending events */}
            {(event.status === 'approved' || event.status === 'pending') && (
              <Link
                to={`/events/${event._id}/registrations`}
                className="btn-primary px-4 py-2"
              >
                Manage Registrations
              </Link>
            )}
            
            <button
              onClick={handleExportCSV}
              className="btn-secondary px-4 py-2"
            >
              Export as CSV
            </button>
          </div>
        </div>
      )}
      
      {/* Submit for Approval Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold text-primary mb-4">Submit Event for Approval</h3>
            <p className="mb-4">
              Please select an admin to review and approve your event "{event.title}":
            </p>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="form-input w-full mb-4"
            >
              <option value="">Select an admin</option>
              {admins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForApproval}
                disabled={actionLoading || !selectedAdmin}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin Actions - Show for assigned admins */}
      {isAdmin && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
          <div className="flex flex-wrap gap-3">
            {isAdminAssigned && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="btn-primary px-4 py-2"
                >
                  {actionLoading ? 'Processing...' : 'Approve Event'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  {actionLoading ? 'Processing...' : 'Reject Event'}
                </button>
              </>
            )}
            <button
              onClick={handleExportCSV}
              className="btn-secondary px-4 py-2"
            >
              Export as CSV
            </button>
            {!isAdminAssigned && (
              <span className="text-sm text-text-color self-center">
                Only assigned admins can approve/reject events
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Back Button - Always show for all users */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary px-4 py-2"
        >
          Back
        </button>
      </div>
      
      {isStudent && isEventApproved && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Registration</h2>
          {registerSuccess ? (
            <div className="success-message">
              Successfully registered for this event!
            </div>
          ) : (
            <>
              <p className="mb-4">
                {isRegistrationOpen 
                  ? "Click the button below to register for this event." 
                  : "Registration is closed for this event."}
              </p>
              {event.capacity && (
                // Check if event is full by comparing with existing registrations
                <p className="mb-4 text-sm text-text-color">
                  {/* This is just for display - actual capacity check happens on backend */}
                  Event capacity: {event.capacity} spots available
                </p>
              )}
              <button
                onClick={() => setShowRegisterModal(true)}
                disabled={!isRegistrationOpen}
                className={`btn-primary ${!isRegistrationOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Register for Event
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Registration Confirmation Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold text-primary mb-4">Confirm Registration</h3>
            <p className="mb-6">
              Are you sure you want to register for "{event.title}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={registerLoading}
                className="btn-primary px-4 py-2"
              >
                {registerLoading ? 'Registering...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Event Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold text-primary mb-4">Reject Event</h3>
            <p className="mb-4">
              Please provide a reason for rejecting the event "{event.title}":
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="form-input w-full mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
              required
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;