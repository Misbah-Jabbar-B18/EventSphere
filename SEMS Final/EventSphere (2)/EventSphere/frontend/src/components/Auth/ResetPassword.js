import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      alert('Invalid reset link. Please request a new password reset.');
      navigate('/login');
    }
  }, [token, navigate]);

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
      return 'Password must contain at least one special character (!@#$%^&* etc.)';
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
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors({ password: passwordError, confirmPassword: '' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ password: '', confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ submit: data.message || 'Failed to reset password' });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, text: '' };
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) strength++;
    
    if (strength <= 2) return { strength, text: 'Weak', color: '#ef4444' };
    if (strength <= 4) return { strength, text: 'Medium', color: '#f59e0b' };
    return { strength, text: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="auth-container">
        <h2>✅ Password Reset Successful!</h2>
        <p style={{ textAlign: 'center', color: '#10b981', marginTop: '20px' }}>
          Your password has been reset successfully. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <input
            type="password"
            name="password"
            placeholder="New Password (Min 8 chars: uppercase, lowercase, number, special char)"
            required
            onChange={handleChange}
            value={formData.password}
            className={errors.password ? 'error' : ''}
          />
          {formData.password && (
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              <span style={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                Password Strength: {passwordStrength.text}
              </span>
            </div>
          )}
          {errors.password && <span className="error-message">{errors.password}</span>}
          <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
            ✓ At least 8 characters<br />
            ✓ One uppercase letter<br />
            ✓ One lowercase letter<br />
            ✓ One number<br />
            ✓ One special character (!@#$%^&* etc.)
          </div>
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            required
            onChange={handleChange}
            value={formData.confirmPassword}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        {errors.submit && <div className="error-message" style={{ textAlign: 'center', marginBottom: '10px' }}>{errors.submit}</div>}

        <button type="submit" disabled={loading || !token}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
      <p>
        <a href="/login">Back to Login</a>
      </p>
    </div>
  );
};

export default ResetPassword;
