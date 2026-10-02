import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setUser } from '../../store/slices/authSlice';
import { setAdminCredentials, setAdmin } from '../../store/slices/adminAuthSlice';
import api from '../../services/api';
import adminApi from '../../services/adminApi';
import gymOwnerApi from '../../services/gymOwnerApi';
import DynamicLogo from '../../components/DynamicLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
} from 'lucide-react';

const GymOwnerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: isAdminAuth } = useSelector((state) => state.adminAuth);

  const [selectedRole, setSelectedRole] = useState('GYM_OWNER');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAdminAuth) {
      navigate('/admin/dashboard', { replace: true });
    } else if (isAuthenticated) {
      const hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));
      navigate(hasPlan ? '/dashboard' : '/select-plan', { replace: true });
    }
  }, [isAuthenticated, isAdminAuth, navigate]);

  const roleOptions = [
    { id: 'GYM_OWNER', label: 'Gym Owner', icon: Building2, desc: 'Gym & Multi-Branch Root' },
    { id: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldCheck, desc: 'Platform Master Control' },
  ];

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
      if (selectedRole === 'SUPER_ADMIN') {
        const adminRes = await adminApi.post('/api/admin/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        const { token, admin } = adminRes.data;
        dispatch(setAdminCredentials({ admin, token }));

        try {
          const meRes = await adminApi.get('/api/admin/auth/me');
          if (meRes.data?.data) {
            dispatch(setAdmin(meRes.data.data));
          }
        } catch (meErr) {
          // continue
        }

        navigate('/admin/dashboard', { replace: true });
      } else {
        const loginResponse = await api.post('/api/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        const { token, user } = loginResponse.data;

        localStorage.removeItem('isFirstTimeRegistration');
        localStorage.setItem('token', token);
        dispatch(setCredentials({ user, token }));

        let hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));

        if (!hasPlan) {
          try {
            const gymRes = await gymOwnerApi.get('/api/owner/gym/profile');
            if (gymRes.data?.data?.planName) {
              const p = gymRes.data.data;
              localStorage.setItem(
                'gymSelectedPlan',
                JSON.stringify({
                  planName: p.planName,
                  maxBranches: p.maxBranches || 1,
                  maxMembers: p.maxMembers || 500,
                  billingCycle: 'MONTHLY',
                  price: 0,
                  activatedAt: p.createdAt || new Date().toISOString(),
                })
              );
              hasPlan = true;
            }
          } catch (gymErr) {
            // fallback
          }
        }

        navigate(hasPlan ? '/dashboard' : '/select-plan', { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials and selected role.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="xtreme-auth-container">
      <div className="xtreme-auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header-block mb-3">
          <div className="d-flex justify-content-center mb-2">
            <DynamicLogo size="large" subtitle="PORTAL LOGIN" />
          </div>
          <h1 className="auth-headline fs-2">
            SIGN IN <span className="text-red">PORTAL</span>
          </h1>
          <p className="auth-subtext">Access your Gym Owner or Super Admin workspace</p>
        </div>

        <div className="mb-4">
          <label className="label-athletic d-block mb-2">Select Your Role</label>
          <div className="row g-2">
            {roleOptions.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <div key={r.id} className="col-12 col-sm-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      if (error) setError('');
                    }}
                    className={`btn w-100 p-2 text-start d-flex align-items-center gap-2 rounded transition-all ${
                      isSelected
                        ? 'btn-danger'
                        : 'btn-outline-dark text-white'
                    }`}
                    style={{
                      backgroundColor: isSelected ? '#ff2a2a' : '#10141d',
                      borderColor: isSelected ? '#ff2a2a' : 'rgba(255,255,255,0.1)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <Icon size={16} className={isSelected ? 'text-white' : 'text-danger'} />
                    <div className="overflow-hidden">
                      <div className="fw-bold text-truncate" style={{ lineHeight: 1.2 }}>{r.label}</div>
                      <div className="text-truncate opacity-75" style={{ fontSize: '0.68rem' }}>{r.desc}</div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
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
              {selectedRole === 'SUPER_ADMIN' ? 'Super Admin Email' : 'Gym Owner Email'}
            </label>
            <div className="input-athletic-wrapper">
              <Mail className="input-icon-athletic" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                className="input-athletic"
                placeholder={
                  selectedRole === 'SUPER_ADMIN'
                    ? 'admin@gymsaas.com'
                    : 'owner@gymsaas.com'
                }
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
            className="btn-red w-100 mt-2"
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Verifying {roleOptions.find(r => r.id === selectedRole)?.label}...</span>
              </>
            ) : (
              <>
                <span>Sign In as {roleOptions.find(r => r.id === selectedRole)?.label}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-bottom-links">
          {selectedRole === 'GYM_OWNER' ? (
            <p>
              New gym franchise owner?{' '}
              <Link to="/register" className="auth-link-red">
                Register Gym Franchise
              </Link>
            </p>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Root environment restricted to authorized master platform administrators.
            </p>
          )}
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

export default GymOwnerLogin;
