import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setAdminCredentials, setAdmin } from '../../store/slices/adminAuthSlice';
import { setCredentials, setUser } from '../../store/slices/authSlice';
import adminApi from '../../services/adminApi';
import api from '../../services/api';
import DynamicLogo from '../../components/DynamicLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  GitBranch,
  UserCheck,
  Users,
  User,
} from 'lucide-react';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated: isAdminAuth } = useSelector((state) => state.adminAuth);
  const { isAuthenticated: isUserAuth } = useSelector((state) => state.auth);

  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAdminAuth && selectedRole === 'SUPER_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (isUserAuth && selectedRole !== 'SUPER_ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdminAuth, isUserAuth, selectedRole, navigate]);

  const roleOptions = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldCheck, desc: 'Platform Master Owner' },
    { id: 'GYM_OWNER', label: 'Gym Owner', icon: Building2, desc: 'Gym & Multi-Branch Root' },
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
        }

        navigate('/admin/dashboard', { replace: true });
      } else {
        const loginResponse = await api.post('/api/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        const { token, user } = loginResponse.data;

        localStorage.setItem('token', token);
        dispatch(setCredentials({ user, token }));

        try {
          const meResponse = await api.get('/api/auth/me');
          dispatch(setUser(meResponse.data));
        } catch (meError) {
          // continue
        }

        const hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));
        navigate(hasPlan ? '/dashboard' : '/select-plan', { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Invalid email or password. Please verify credentials and selected role.';
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
            <DynamicLogo size="large" subtitle="PORTAL ACCESS" />
          </div>
          <h1 className="auth-headline fs-2">
            PORTAL <span className="text-red">LOGIN</span>
          </h1>
          <p className="auth-subtext">Select role below to enter your specialized dashboard</p>
        </div>

        <div className="mb-4">
          <label className="label-athletic d-block mb-2">Select Your Role</label>
          <div className="row g-2">
            {roleOptions.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <div key={r.id} className="col-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      if (error) setError('');
                    }}
                    className={`btn w-100 p-2 text-start d-flex align-items-center gap-2 rounded transition-all ${
                      isSelected ? 'btn-danger' : 'btn-outline-dark text-white'
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
            <label htmlFor="admin-email" className="label-athletic">
              {selectedRole === 'SUPER_ADMIN' ? 'Super Admin Email' : 'Gym Owner Email'}
            </label>
            <div className="input-athletic-wrapper">
              <Mail className="input-icon-athletic" size={18} />
              <input
                id="admin-email"
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
            <label htmlFor="admin-password" className="label-athletic">
              Password
            </label>
            <div className="input-athletic-wrapper">
              <Lock className="input-icon-athletic" size={18} />
              <input
                id="admin-password"
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
            id="admin-login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Verifying {roleOptions.find((r) => r.id === selectedRole)?.label}...</span>
              </>
            ) : (
              <>
                <span>Sign In as {roleOptions.find((r) => r.id === selectedRole)?.label}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-bottom-links">
          {selectedRole === 'GYM_OWNER' ? (
            <p>
              New franchise owner?{' '}
              <Link to="/register" className="auth-link-red">
                Register Gym Franchise
              </Link>
            </p>
          ) : selectedRole === 'SUPER_ADMIN' ? (
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Root environment restricted to authorized master platform administrators.
            </p>
          ) : (
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              Accounts created and authorized by your gym administrator.
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

export default AdminLogin;
