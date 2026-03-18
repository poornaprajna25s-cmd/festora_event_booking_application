import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [usn, setUsn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    // For students, department and USN are required
    if (role === 'student' && (!department || !usn)) {
      setError('Department and USN are required for students');
      setLoading(false);
      return;
    }
    
    const result = await signup(name, email, password, role, department, usn);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto card glow">
      <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-lg font-semibold mb-2">Full Name</label>
          <input
            type="text"
            id="name"
            className="form-input text-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block text-lg font-semibold mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="form-input text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-lg font-semibold mb-2">Password</label>
          <input
            type="password"
            id="password"
            className="form-input text-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
            placeholder="Minimum 8 characters with capital letter and special character"
          />
          <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long and contain at least one capital letter and one special character</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input text-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="8"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="role" className="block text-lg font-semibold mb-2">Role</label>
          <select
            id="role"
            className="form-input text-lg"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="organiser">Organiser</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        {role === 'student' && (
          <>
            <div className="mb-6">
              <label htmlFor="department" className="block text-lg font-semibold mb-2">Department</label>
              <select
                id="department"
                className="form-input text-lg"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required={role === 'student'}
              >
                {engineeringBranches.map((branch, index) => (
                  <option key={index} value={branch}>
                    {branch || 'Select Department'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-8">
              <label htmlFor="usn" className="block text-lg font-semibold mb-2">USN</label>
              <input
                type="text"
                id="usn"
                className="form-input text-lg"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                required={role === 'student'}
                placeholder="University Seat Number"
              />
            </div>
          </>
        )}
        
        <button 
          type="submit" 
          className="btn-primary w-full text-lg py-3"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-lg">
          Already have an account?{' '}
          <Link to="/login" className="font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;