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
      setError('Gym or Franchise Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Owner Email address is required');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError('Please provide a valid email format');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
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
    <div className="xtreme-auth-container">
      <div className="xtreme-auth-card register-wide">
        <div className="auth-header-block">
          <div className="logo-symbol" style={{ margin: '0 auto' }}>
            <Dumbbell size={24} />
          </div>
          <h1 className="auth-headline">
            LAUNCH YOUR <span className="text-red">GYM</span>
          </h1>
          <p className="auth-subtext">Register as GYM_OWNER for full SaaS management</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group-athletic">
            <label htmlFor="name" className="label-athletic">
              Gym / Owner Name
            </label>
            <div className="input-athletic-wrapper">
              <User className="input-icon-athletic" size={18} />
              <input
                id="name"
                type="text"
                name="name"
                className="input-athletic"
                placeholder="Xtreme Power Club"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group-athletic">
            <label htmlFor="email" className="label-athletic">
              Owner Email
            </label>
            <div className="input-athletic-wrapper">
              <Mail className="input-icon-athletic" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                className="input-athletic"
                placeholder="owner@xtremepower.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group-athletic">
            <label htmlFor="password" className="label-athletic">
              Password (min. 6 chars)
            </label>
            <div className="input-athletic-wrapper">
              <Lock className="input-icon-athletic" size={18} />
              <input
                id="password"
                type="password"
                name="password"
                className="input-athletic"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group-athletic">
            <label htmlFor="confirmPassword" className="label-athletic">
              Confirm Password
            </label>
            <div className="input-athletic-wrapper">
              <Lock className="input-icon-athletic" size={18} />
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="input-athletic"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="role-notice-card">
            <CheckCircle2 size={18} className="text-red" />
            <span>Account automatically granted <strong>GYM_OWNER</strong> role & full multi-branch scope</span>
          </div>

          <button
            type="submit"
            className="btn-red"
            style={{ width: '100%' }}
            disabled={isSubmitting}
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Creating Facility Account...</span>
              </>
            ) : (
              <>
                <span>Register Gym & Get Started</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-bottom-links">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-link-red">
              Sign In to Your Facility
            </Link>
          </p>
          <p style={{ marginTop: '12px' }}>
            <Link to="/" style={{ color: '#8b949e', fontSize: '0.82rem' }}>
              ← Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
