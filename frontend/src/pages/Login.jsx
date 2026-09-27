import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setUser } from '../store/slices/authSlice';
import api from '../services/api';
import { Dumbbell, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form local state (only input fields and local UI feedback)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    const { email, password } = formData;

    // Client-side validation
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Step 1: POST /api/auth/login
      const loginResponse = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = loginResponse.data;

      // Step 2: Store JWT in localStorage
      localStorage.setItem('token', token);

      // Step 3: Dispatch Redux action to set authentication state
      dispatch(setCredentials({ user, token }));

      // Step 4: Call GET /api/auth/me to fetch full verified user profile
      try {
        const meResponse = await api.get('/api/auth/me');
        // Step 5: Update Redux user with the response
        dispatch(setUser(meResponse.data));
      } catch (meError) {
        console.warn('Could not fetch updated /me profile, using login response user:', meError);
      }

      // Step 6: Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-header">
          <div className="brand-logo-badge">
            <Dumbbell className="brand-icon" size={28} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage your Gym SaaS platform</p>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="owner@gymsaas.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
            </div>
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
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner-icon animate-spin" size={18} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Register as Gym Owner
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

export default Login;
