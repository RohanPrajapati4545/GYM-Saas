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

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      // 1. POST /api/auth/login
      const loginResponse = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = loginResponse.data;

      // 2. Store JWT in localStorage
      localStorage.setItem('token', token);

      // 3. Dispatch Redux action
      dispatch(setCredentials({ user, token }));

      // 4. Call GET /api/auth/me
      try {
        const meResponse = await api.get('/api/auth/me');
        dispatch(setUser(meResponse.data));
      } catch (meError) {
        console.warn('Could not fetch updated /me profile, using login response user:', meError);
      }

      // 5. Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Invalid email or password. Please check and try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="xtreme-auth-container">
      <div className="xtreme-auth-card">
        <div className="auth-header-block">
          <div className="logo-symbol" style={{ margin: '0 auto' }}>
            <Dumbbell size={24} />
          </div>
          <h1 className="auth-headline">
            SIGN IN TO <span className="text-red">XTREME</span>
          </h1>
          <p className="auth-subtext">Access your Gym SaaS Owner Dashboard</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group-athletic">
            <label htmlFor="email" className="label-athletic">
              Owner Email Address
            </label>
            <div className="input-athletic-wrapper">
              <Mail className="input-icon-athletic" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                className="input-athletic"
                placeholder="owner@xtremefitness.com"
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
              Password
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
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-red"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-bottom-links">
          <p>
            Don't have a gym account yet?{' '}
            <Link to="/register" className="auth-link-red">
              Register Gym Owner
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

export default Login;
