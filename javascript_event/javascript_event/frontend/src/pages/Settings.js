import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [club, setClub] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common engineering branches
  const engineeringBranches = [
    '',
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Science and Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Automobile Engineering',
    'Biomedical Engineering',
    'Environmental Engineering',
    'Industrial Engineering',
    'Materials Science and Engineering',
    'Petroleum Engineering',
    'Robotics Engineering',
    'Software Engineering',
    'Data Science and Engineering',
    'Artificial Intelligence and Machine Learning',
    'Cyber Security',
    'Other'
  ];

  const years = ['1', '2', '3', '4'];
  
  const clubs = ['IEEE', 'ISTE', 'GDSC', 'ASCEND', 'Other'];

  useEffect(() => {
    if (user) {
      // Split the full name into first and last name
      const nameParts = user.name ? user.name.split(' ') : [];
      setFirstName(user.firstName || nameParts[0] || '');
      setLastName(user.lastName || nameParts.slice(1).join(' ') || '');
      setDepartment(user.department || '');
      setYear(user.year || '');
      setClub(user.club || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate required fields
    if (!firstName || !lastName || !department) {
      setError('First name, last name, and department are required');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        firstName,
        lastName,
        department
      };

      // Only include year if it's selected
      if (year) {
        userData.year = year;
      }

      // Only include club for organisers
      if (user.role === 'organiser') {
        userData.club = club;
      }

      console.log('Sending user data:', userData); // For debugging

      const response = await api.put('/user/profile', userData);
      
      // Update the user in context
      setUser(response.data);
      
      setSuccess('Settings updated successfully!');
      setTimeout(() => {
        setSuccess('');
        // Redirect to dashboard after successful update
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.log('Error response:', err.response); // For debugging
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update settings';
      setError(errorMessage);
      console.error('Settings update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Profile Settings</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="firstName" className="block text-lg font-semibold mb-2">First Name *</label>
            <input
              type="text"
              id="firstName"
              className="form-input text-lg"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="lastName" className="block text-lg font-semibold mb-2">Last Name *</label>
            <input
              type="text"
              id="lastName"
              className="form-input text-lg"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="department" className="block text-lg font-semibold mb-2">Department *</label>
            <select
              id="department"
              className="form-input text-lg"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              {engineeringBranches.map((branch, index) => (
                <option key={index} value={branch}>
                  {branch || 'Select Department'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="year" className="block text-lg font-semibold mb-2">Year</label>
            <select
              id="year"
              className="form-input text-lg"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select Year</option>
              {years.map((yr, index) => (
                <option key={index} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          
          {user.role === 'organiser' && (
            <div className="mb-8">
              <label htmlFor="club" className="block text-lg font-semibold mb-2">Club</label>
              <select
                id="club"
                className="form-input text-lg"
                value={club}
                onChange={(e) => setClub(e.target.value)}
              >
                <option value="">Select Club</option>
                {clubs.map((clubOption, index) => (
                  <option key={index} value={clubOption}>
                    {clubOption}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {error && <div className="error-message mb-4">{error}</div>}
          {success && <div className="success-message mb-4">{success}</div>}
          
          <button 
            type="submit" 
            className="btn-primary w-full text-lg py-3"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;