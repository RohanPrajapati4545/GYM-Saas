import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setUser } from '../store/slices/authSlice';
import api from '../services/api';
import { Dumbbell, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      setError('Gym or Owner Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError('Please provide a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // POST /api/auth/register
      const response = await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        dispatch(setCredentials({ user, token }));

        try {
          const meResponse = await api.get('/api/auth/me');
          dispatch(setUser(meResponse.data));
        } catch (meError) {
          console.warn('Could not fetch /me, using registration user:', meError);
        }

        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper register-card">
        <div className="auth-header">
          <div className="brand-logo-badge">
            <Dumbbell className="brand-icon" size={28} />
          </div>
          <h1 className="auth-title">Register Your Gym</h1>
          <p className="auth-subtitle">Create a Gym Owner account to launch your SaaS platform</p>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Gym / Owner Name
            </label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Titan Fitness Club"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Owner Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="owner@titanfitness.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password (min. 6 characters)
            </label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="role-guarantee-badge">
            <CheckCircle2 size={16} className="badge-icon" />
            <span>Account will be configured with <strong>GYM_OWNER</strong> role & full multi-branch access</span>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isSubmitting}
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner-icon animate-spin" size={18} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-link">
              Sign In to Your Gym
            </Link>
          </p>
          <div className="auth-back-link">
            <Link to="/" className="back-link">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
