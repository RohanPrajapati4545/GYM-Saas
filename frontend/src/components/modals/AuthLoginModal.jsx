import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import gymOwnerApi from '../../services/gymOwnerApi';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AuthLoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

      onClose();
      Swal.fire({
        title: `Welcome back, ${user.name || 'Owner'}!`,
        text: 'Signed in successfully.',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
        background: '#10141d',
        color: '#ffffff',
      });

      navigate(hasPlan ? '/dashboard' : '/select-plan', { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div
        className="auth-modal-window position-relative"
        style={{
          maxWidth: '430px',
          width: '100%',
          backgroundColor: '#0f1420',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '2.2rem 2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 42, 42, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn text-muted position-absolute top-0 end-0 m-3 p-1 rounded-circle border-0 d-flex align-items-center justify-content-center"
          style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.06)' }}
          aria-label="Close Modal"
        >
          <X size={16} className="text-silver hover-red" />
        </button>

        {/* Modal Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(255, 42, 42, 0.2) 0%, rgba(255, 42, 42, 0.05) 100%)',
              border: '1px solid rgba(255, 42, 42, 0.3)',
              color: '#ff2a2a',
            }}
          >
            <Lock size={22} />
          </div>
          <div>
            <h3 className="fw-bold text-white m-0 fs-5" style={{ letterSpacing: '-0.02em' }}>
              Portal Login
            </h3>
            <p className="text-muted m-0 small" style={{ fontSize: '0.8rem' }}>
              Ro-Fitness Gym Owner Workspace
            </p>
          </div>
        </div>

        {error && (
          <div
            className="auth-error-banner py-2 px-3 mb-3 d-flex align-items-center gap-2 rounded"
            role="alert"
            style={{ fontSize: '0.82rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-3">
            <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.8rem' }}>
              Email Address
            </label>
            <div
              className="d-flex align-items-center rounded px-3 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'border-color 0.2s',
              }}
            >
              <input
                id="login-modal-email"
                type="email"
                name="email"
                className="bg-transparent border-0 text-white w-100"
                style={{ outline: 'none', fontSize: '0.9rem' }}
                placeholder="owner@gymsaas.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.8rem' }}>
              Password
            </label>
            <div
              className="d-flex align-items-center rounded px-3 py-2"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <input
                id="login-modal-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="bg-transparent border-0 text-white w-100"
                style={{ outline: 'none', fontSize: '0.9rem' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn text-muted p-0 border-0 ms-2"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-red w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded"
            style={{ fontWeight: '600', fontSize: '0.92rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-3 pt-3 border-top border-dark">
          <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
            New gym owner?{' '}
            <button
              type="button"
              onClick={() => {
                if (onSwitchToRegister) {
                  onSwitchToRegister();
                } else {
                  onClose();
                  navigate('/register');
                }
              }}
              className="btn btn-link p-0 text-danger fw-semibold text-decoration-none"
              style={{ fontSize: '0.82rem' }}
            >
              Register Facility
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLoginModal;
