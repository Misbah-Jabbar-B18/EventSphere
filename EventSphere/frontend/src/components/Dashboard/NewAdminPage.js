import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NewAdminPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    // Validate name
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setError('Name can only contain letters and spaces.');
      return;
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create admin.');
        setLoading(false);
        return;
      }

      alert('New admin created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating admin:', err);
      setError('An error occurred while creating the admin. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="new-admin-page">
      <div className="new-admin-header">
        <h2>Create New Admin</h2>
        <button className="delete-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
      <form onSubmit={handleCreateAdmin} className="modal-form new-admin-form">
        <label>Name
          <input name="name" required />
        </label>
        <label>Email
          <input name="email" type="email" required />
        </label>
        <label>Password
          <input name="password" type="password" required />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div style={{display:'flex',gap:'1rem',marginTop:'1rem'}}>
          <button type="submit" className="approve-btn" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
          <button type="button" className="delete-btn" onClick={() => navigate('/dashboard')} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default NewAdminPage; 