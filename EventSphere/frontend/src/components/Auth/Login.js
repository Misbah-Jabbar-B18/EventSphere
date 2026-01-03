import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateEmail(formData.email);
    if (!formData.password) {
      setErrors({ email: emailError, password: 'Password is required' });
      return;
    }
    if (emailError) {
      setErrors({ email: emailError, password: '' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ submit: data.message || 'Invalid email or password' });
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

      console.log('Login successful:', data.user);
      alert(`Welcome back, ${data.user?.name || 'User'}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(forgotEmail);
    if (emailError) {
      alert(emailError);
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || 'Failed to send reset email');
        return;
      }

      alert('Password reset link has been sent to your email!');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err) {
      console.error(err);
      alert('Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Header Section */}
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Main Form */}
        {!showForgotPassword ? (
          <form className="login-form" onSubmit={handleSubmit}>
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
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                  className="forgot-link"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                value={formData.password}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Submit Error */}
            {errors.submit && <div className="submit-error">{errors.submit}</div>}

            {/* Submit Button */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          /* Forgot Password Form */
          <div className="forgot-password">
            <div className="forgot-header">
              <h2>Reset Password</h2>
              <p>Enter your email to receive a reset link</p>
            </div>
            
            <form className="login-form" onSubmit={handleForgotPassword}>
              <div className="input-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="Enter your email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="login-btn" disabled={forgotLoading}>
                {forgotLoading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              
              <button 
                type="button" 
                className="back-btn"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                }}
              >
                ← Back to Login
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>Don't have an account? <a href="/register" className="register-link">Create Account</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;