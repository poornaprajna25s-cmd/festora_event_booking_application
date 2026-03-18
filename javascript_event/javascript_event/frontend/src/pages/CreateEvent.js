import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { uploadApi } from '../services/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    longDescription: '',
    location: '',
    category: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    capacity: '',
    assignedAdmin: '',
    submitForApproval: false
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Track uploaded files

  useEffect(() => {
    fetchAdmins();
    fetchCategories();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/events/admins');
      setAdmins(response.data.admins);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      // Show error message to user
      setError('Failed to load admins. Please try again later.');
      // Don't use fallback data - let the user know there's an issue
      setAdmins([]);
    }
  };

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.post('/uploads', formData);
      
      // Add uploaded file to the list in the correct format for the backend
      const uploadedFile = {
        type: response.data.file.type,
        url: response.data.file.url,
        filename: response.data.file.filename
      };
      
      setUploadedFiles(prev => [...prev, uploadedFile]);
      setFile(null); // Clear the file input
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      setUploading(false);
    }
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // If submitting for approval immediately, validate that an admin is assigned
      if (formData.submitForApproval && !formData.assignedAdmin) {
        setError('Please assign an admin for approval when submitting immediately');
        setLoading(false);
        return;
      }
      
      const eventData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        attachments: uploadedFiles
      };
      
      // If not submitting for approval immediately, remove assignedAdmin from the request
      if (!formData.submitForApproval) {
        delete eventData.assignedAdmin;
      }
      
      const response = await api.post('/events', eventData);
      setSuccess(true);
      
      // Redirect to event details page
      setTimeout(() => {
        navigate(`/events/${response.data._id}`);
      }, 1500);
    } catch (err) {
      console.error('Create event error:', err);
      // Check if there are validation errors
      if (err.response?.data?.errors) {
        // Format validation errors into a readable message
        const validationErrors = err.response.data.errors.map(error => error.msg).join(', ');
        setError(`Validation failed: ${validationErrors}`);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create event');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Create New Event</h1>
      
      <div className="card glow">
        {error && <div className="error-message mb-6 text-lg">{error}</div>}
        {success && <div className="success-message mb-6 text-lg">Event created successfully!</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <label htmlFor="title" className="block text-xl font-semibold mb-3">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input text-lg"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-xl font-semibold mb-3">Category</label>
              <select
                id="category"
                name="category"
                className="form-input text-lg"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="lg:col-span-2">
              <label htmlFor="shortDescription" className="block text-xl font-semibold mb-3">Short Description</label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                className="form-input text-lg"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                placeholder="Brief summary of the event (max 250 characters)"
              />
            </div>
            
            <div className="lg:col-span-2">
              <label htmlFor="longDescription" className="block text-xl font-semibold mb-3">Full Description</label>
              <textarea
                id="longDescription"
                name="longDescription"
                className="form-input text-lg"
                rows="6"
                value={formData.longDescription}
                onChange={handleChange}
                required
                placeholder="Detailed description of the event, including objectives, activities, and other relevant information"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-xl font-semibold mb-3">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-input text-lg"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-xl font-semibold mb-3">Start Date & Time</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                className="form-input text-lg"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-xl font-semibold mb-3">End Date & Time</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                className="form-input text-lg"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="registrationDeadline" className="block text-xl font-semibold mb-3">Registration Deadline</label>
              <input
                type="datetime-local"
                id="registrationDeadline"
                name="registrationDeadline"
                className="form-input text-lg"
                value={formData.registrationDeadline}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-xl font-semibold mb-3">Capacity (optional)</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                className="form-input text-lg"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="lg:col-span-2">
              <label htmlFor="assignedAdmin" className="block text-xl font-semibold mb-3">Assign Admin for Approval</label>
              <select
                id="assignedAdmin"
                name="assignedAdmin"
                className="form-input text-lg"
                value={formData.assignedAdmin}
                onChange={handleChange}
                required={formData.submitForApproval} // Only required if submitting for approval immediately
                disabled={!formData.submitForApproval} // Disable if not submitting for approval
              >
                <option value="">Select an admin</option>
                {admins.map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.name}
                  </option>
                ))}
              </select>
              {!formData.submitForApproval && (
                <p className="text-sm text-text-color mt-1">
                  Admin assignment will be required when submitting for approval later
                </p>
              )}
            </div>
            
            <div className="lg:col-span-2">
              <label className="flex items-center text-lg">
                <input
                  type="checkbox"
                  name="submitForApproval"
                  checked={formData.submitForApproval}
                  onChange={handleChange}
                  className="mr-3 w-5 h-5"
                />
                <span>Submit for approval immediately</span>
              </label>
              <p className="text-sm text-text-color mt-1">
                {formData.submitForApproval 
                  ? "Event will be submitted for approval and assigned to the selected admin" 
                  : "Event will be saved as draft and can be submitted for approval later"}
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <label className="block text-xl font-semibold mb-3">Attachments (optional)</label>
            <input
              type="file"
              className="form-input text-lg"
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            {file && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-secondary"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}
            
            {/* Display uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Uploaded Files:</h3>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center bg-card-bg p-3 rounded-lg border border-accent-color/30">
                      <span className="text-lg">{file.filename}</span>
                      <button
                        type="button"
                        onClick={() => removeUploadedFile(index)}
                        className="text-red-400 hover:text-red-300 font-bold text-xl"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/my-events')}
              className="btn-secondary px-6 py-3 text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-3 text-lg"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;