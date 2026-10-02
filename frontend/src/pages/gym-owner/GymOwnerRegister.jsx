import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { setCredentials, setUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import gymOwnerApi from '../../services/gymOwnerApi';
import DynamicLogo from '../../components/DynamicLogo';
import { Dumbbell, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GymOwnerRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: isAdminAuth } = useSelector((state) => state.adminAuth);

  const getInitialPlan = () => {
    if (location.state?.selectedPlan) return location.state.selectedPlan;
    try {
      const stored = sessionStorage.getItem('selectedPlanOnSignup');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [selectedPlan] = useState(getInitialPlan);

  React.useEffect(() => {
    if (isAdminAuth) {
      navigate('/admin/dashboard', { replace: true });
    } else if (isAuthenticated) {
      const hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));
      navigate(hasPlan ? '/dashboard' : '/select-plan', { replace: true });
    }
  }, [isAuthenticated, isAdminAuth, navigate]);

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

        if (selectedPlan) {
          // User already picked a plan before registration -> AUTO-APPLY and go directly to dashboard
          const planPayload = {
            planName: selectedPlan.planName,
            maxBranches: selectedPlan.maxBranches || 1,
            maxMembers: selectedPlan.maxMembers || 500,
            billingCycle: (selectedPlan.billingCycle || 'MONTHLY').toUpperCase(),
            price: selectedPlan.price || 0,
          };

          try {
            await gymOwnerApi.post('/api/owner/gym/select-plan', planPayload);
          } catch (syncErr) {
            console.warn('Backend plan sync warning:', syncErr);
          }

          localStorage.setItem(
            'gymSelectedPlan',
            JSON.stringify({
              ...planPayload,
              activatedAt: new Date().toISOString(),
            })
          );
          sessionStorage.removeItem('selectedPlanOnSignup');

          try {
            const meResponse = await api.get('/api/auth/me');
            dispatch(setUser(meResponse.data));
          } catch (meError) {
            console.warn('Could not fetch /me, using registration user:', meError);
          }

          navigate('/dashboard', { replace: true });
        } else {
          // Only condition to ask for plan: direct visit to register without selecting a plan
          localStorage.removeItem('gymSelectedPlan');
          localStorage.setItem('isFirstTimeRegistration', 'true');

          try {
            const meResponse = await api.get('/api/auth/me');
            dispatch(setUser(meResponse.data));
          } catch (meError) {
            console.warn('Could not fetch /me, using registration user:', meError);
          }

          navigate('/select-plan', { replace: true });
        }
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
        <div className="auth-header-block d-flex flex-column align-items-center">
          <DynamicLogo size="large" subtitle="FACILITY ONBOARDING" />
          <h1 className="auth-headline mt-3">
            LAUNCH YOUR <span className="text-red">GYM</span>
          </h1>
          <p className="auth-subtext">Register as GYM_OWNER for full SaaS management</p>
        </div>

        {selectedPlan && (
          <div
            className="p-3 mb-3 d-flex align-items-center justify-content-between text-start"
            style={{
              background: 'rgba(255, 42, 42, 0.08)',
              border: '1px solid rgba(255, 42, 42, 0.3)',
              borderRadius: '8px',
            }}
          >
            <div>
              <span className="text-red fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                Selected Plan
              </span>
              <div className="fw-bold text-white fs-6">
                {selectedPlan.planName} • ${selectedPlan.price}/mo ({selectedPlan.billingCycle || 'MONTHLY'})
              </div>
            </div>
            <span className="badge bg-danger text-white px-2 py-1" style={{ fontSize: '0.72rem' }}>
              14-Day Free Trial
            </span>
          </div>
        )}

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

export default GymOwnerRegister;
