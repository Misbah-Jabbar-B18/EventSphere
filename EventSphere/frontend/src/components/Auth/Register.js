import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.length > 50) {
      return 'Name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const roleError = !formData.role ? 'Please select a role' : '';

    if (nameError || emailError || passwordError || roleError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        role: roleError
      });
      return;
    }

    setLoading(true);
    try {
      // Map frontend role labels to backend roles
      const mappedRole =
        formData.role === 'Organizer'
          ? 'organizer'
          : 'user';

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: mappedRole,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ submit: data.message || 'Registration failed' });
        setLoading(false);
        return;
      }

      // Save token + user coming from backend (MongoDB)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }

      alert(`Registration successful! Welcome ${data.user?.name || formData.name}`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, text: '', color: '#9ca3af' };
    let strength = 0;
    const requirements = [
      formData.password.length >= 8,
      /[a-z]/.test(formData.password),
      /[A-Z]/.test(formData.password),
      /[0-9]/.test(formData.password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
    ];
    strength = requirements.filter(req => req).length;
    
    if (strength <= 2) return { strength, text: 'Weak', color: '#ef4444' };
    if (strength <= 4) return { strength, text: 'Medium', color: '#f59e0b' };
    return { strength, text: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength();

  // Password requirement checklist
  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'One number', met: /[0-9]/.test(formData.password) },
    { text: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) }
  ];

  return (
    <div className="register-page">
      <div className="register-container">
        
        {/* Header Section */}
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join our community to get started</p>
        </div>

        {/* Main Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          
          {/* Name Input */}
          <div className="input-group">
            <label htmlFor="name">
              Full Name
              <span className="hint">(Letters and spaces only)</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              onChange={handleChange}
              value={formData.name}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email Input */}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              onChange={handleChange}
              value={formData.password}
              className={errors.password ? 'error' : ''}
            />
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{
                      width: `${passwordStrength.strength * 20}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}

            {/* Password Requirements Checklist */}
            <div className="requirements-list">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="requirement-item">
                  <span className={`check-icon ${req.met ? 'met' : ''}`}>
                    {req.met ? '✓' : '○'}
                  </span>
                  <span className={`requirement-text ${req.met ? 'met' : ''}`}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
            
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Role Selection */}
          <div className="input-group">
            <label htmlFor="role">Select Your Role</label>
            <select
              id="role"
              name="role"
              onChange={handleChange}
              value={formData.role}
              className={`role-select ${errors.role ? 'error' : ''}`}
            >
              <option value="">Choose your role</option>
              <option value="Organizer">Organizer</option>
              <option value="Attendee">Attendee</option>
            </select>
            
            {/* Role Descriptions */}
            <div className="role-descriptions">
              
              <div className="role-desc">
                <strong>Organizer:</strong> Create and manage events
              </div>
              <div className="role-desc">
                <strong>Attendee:</strong> Browse and register for events
              </div>
            </div>
            
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          {/* Submit Error */}
          {errors.submit && <div className="submit-error">{errors.submit}</div>}

          {/* Submit Button */}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p>Already have an account? <a href="/login" className="login-link">Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;