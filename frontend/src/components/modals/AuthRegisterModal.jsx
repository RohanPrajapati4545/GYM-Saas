import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import gymOwnerApi from '../../services/gymOwnerApi';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Dumbbell,
  Building2,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter Gym',
    tagline: 'SINGLE BOUTIQUE CLUB',
    description: 'Perfect for standalone gym clubs and single-owner studios.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    maxBranches: 1,
    maxMembers: 300,
    features: [
      '1 Gym Location Branch',
      'Up to 300 Active Members',
      'WhatsApp Invoicing & Reminders',
      'Branded Member QR Pass Web App',
      'Standard POS Desk Billing',
    ],
    buttonText: 'Select Starter Plan',
    isPopular: false,
  },
  {
    id: 'GROWTH_PRO',
    name: 'Growth Pro',
    tagline: 'MULTI-BRANCH & BIOMETRIC GATE',
    description: 'Our #1 plan for growing gyms with turnstile gates & multi-branch roaming.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    maxBranches: 5,
    maxMembers: 1500,
    features: [
      'Up to 5 Gym Branches',
      'Up to 1,500 Active Members',
      'Biometric & RFID Turnstile Gate Cloud Sync',
      'Automated Expired Member Gate Lockout',
      'Coach & Trainer PT Commission Engine',
      'Multi-Branch Consolidated P&L Analytics',
    ],
    buttonText: 'Select Growth Pro',
    isPopular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Scale',
    tagline: 'FRANCHISE CHAINS & CHAINS',
    description: 'For multi-city fitness chains needing custom white-label branding & hardware API.',
    monthlyPrice: 199,
    yearlyPrice: 159,
    maxBranches: 999,
    maxMembers: 999999,
    features: [
      'Unlimited Gym Branches',
      'Unlimited Active Members',
      'Unlimited Turnstile & Face Recognition Gates',
      'Custom White-Label Domain & Branding',
      'Dedicated Platform Success Manager',
      '99.99% Cloud Uptime SLA Agreement',
    ],
    buttonText: 'Select Enterprise Plan',
    isPopular: false,
  },
];

const AuthRegisterModal = ({ isOpen, onClose, onSwitchToLogin, preselectedPlan = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState('REGISTER'); // 'REGISTER' | 'SELECT_PLAN'
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activatingPlanId, setActivatingPlanId] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Account Details
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Gym Details
    gymName: '',
    gymPhone: '',
    gymEmail: '',
    gymAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('REGISTER');
      setError('');
    }
  }, [isOpen]);

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      gymName,
      gymPhone,
      gymEmail,
      gymAddress,
      city,
      state,
      pincode,
    } = formData;

    // Validation
    if (!name.trim()) {
      setError('Owner Full Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Owner Email address is required');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError('Please provide a valid account email format');
      return;
    }
    if (!phone.trim()) {
      setError('Owner Mobile Number is required');
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
    if (!gymName.trim()) {
      setError('Gym Name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create User Account in Auth Service
      let token = null;
      let user = null;

      try {
        const response = await api.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
        });
        token = response.data?.token;
        user = response.data?.user;
      } catch (regErr) {
        // If email was already registered, attempt auto-login with same password
        const isEmailTaken =
          regErr.response?.status === 409 ||
          regErr.response?.data?.message?.toLowerCase().includes('already registered') ||
          regErr.response?.data?.message?.toLowerCase().includes('already exists');

        if (isEmailTaken) {
          try {
            const loginRes = await api.post('/api/auth/login', {
              email: email.trim().toLowerCase(),
              password,
            });
            token = loginRes.data?.token;
            user = loginRes.data?.user;
          } catch (loginErr) {
            throw new Error('This email is already registered. Please click "Sign In" below or use another email.');
          }
        } else {
          throw new Error(regErr.response?.data?.message || 'Registration failed. Please check your credentials.');
        }
      }

      if (token) {
        localStorage.setItem('token', token);
        localStorage.removeItem('gymSelectedPlan');
        dispatch(setCredentials({ user, token }));

        try {
          const meResponse = await api.get('/api/auth/me');
          if (meResponse.data) {
            dispatch(setUser(meResponse.data));
          }
        } catch (meError) {
          // ignore
        }

        // 2. Save Gym Details in Gym Owner Service
        try {
          await gymOwnerApi.put(
            '/api/owner/gym/profile',
            {
              name: gymName.trim(),
              email: gymEmail.trim() || email.trim().toLowerCase(),
              phone: gymPhone.trim() || phone.trim(),
              address: gymAddress.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode: pincode.trim(),
              ownerName: name.trim(),
              ownerPhone: phone.trim(),
              ownerEmail: email.trim().toLowerCase(),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (gymErr) {
          console.warn('Gym profile save note:', gymErr);
        }

        // 3. If a plan was ALREADY selected on the landing page pricing table, activate it directly!
        let chosenPlan = preselectedPlan;
        if (!chosenPlan) {
          try {
            chosenPlan = JSON.parse(sessionStorage.getItem('selectedPlanOnSignup'));
          } catch (e) {
            chosenPlan = null;
          }
        }

        if (chosenPlan && (chosenPlan.name || chosenPlan.planName || chosenPlan.id)) {
          const matchedPlan =
            PLANS.find(
              (p) =>
                p.id?.toLowerCase() === (chosenPlan.id || '').toLowerCase() ||
                p.name?.toLowerCase() === (chosenPlan.name || chosenPlan.planName || '').toLowerCase() ||
                (chosenPlan.name || chosenPlan.planName || '').toLowerCase().includes(p.name?.toLowerCase())
            ) || chosenPlan;

          await handleActivatePlan(matchedPlan, token);
          return;
        }

        // Otherwise advance to Step 2 (Plan Selection inside popup)
        setIsSubmitting(false);
        setCurrentStep('SELECT_PLAN');
      } else {
        onClose();
        navigate('/', { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.message || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleActivatePlan = async (plan, explicitToken = null) => {
    const planId = plan?.id || 'GROWTH_PRO';
    setActivatingPlanId(planId);

    const planTitle = plan?.name || plan?.planName || 'Growth Pro';
    const monthlyPrice = plan?.monthlyPrice || plan?.price || 49;
    const yearlyPrice = plan?.yearlyPrice || plan?.price || 39;
    const price = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
    const maxBranches = plan?.maxBranches || (planTitle.toLowerCase().includes('starter') ? 1 : 5);
    const maxMembers = plan?.maxMembers || (planTitle.toLowerCase().includes('starter') ? 300 : 1500);

    const planPayload = {
      planName: planTitle,
      maxBranches,
      maxMembers,
      billingCycle: billingCycle.toUpperCase(),
      price,
    };

    try {
      const activeToken = explicitToken || localStorage.getItem('token');
      if (activeToken) {
        await gymOwnerApi.post('/api/owner/gym/select-plan', planPayload, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
      }
    } catch (err) {
      console.warn('Backend plan sync warning:', err);
    }

    localStorage.setItem(
      'gymSelectedPlan',
      JSON.stringify({
        ...planPayload,
        activatedAt: new Date().toISOString(),
      })
    );
    sessionStorage.removeItem('selectedPlanOnSignup');

    setActivatingPlanId(null);
    onClose();

    try {
      await Swal.fire({
        title: `${planTitle} Activated!`,
        text: `Welcome to Ro-Fitness SaaS! Your gym facility workspace is live with 14-Day Free Trial.`,
        icon: 'success',
        confirmButtonText: 'Enter Gym Dashboard',
        confirmButtonColor: '#ff2a2a',
        background: '#10141d',
        color: '#ffffff',
      });
    } catch (swalErr) {
      // ignore
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div
        className="auth-modal-window position-relative"
        style={{
          maxWidth: currentStep === 'SELECT_PLAN' ? '920px' : '740px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#0f1420',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: currentStep === 'SELECT_PLAN' ? '2.2rem 2rem' : '2rem 2.2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 42, 42, 0.15)',
          transition: 'all 0.3s ease',
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

        {/* ==================== STEP 1: REGISTRATION (ACCOUNT & GYM DETAILS) ==================== */}
        {currentStep === 'REGISTER' && (
          <div>
            {/* Modal Header */}
            <div className="d-flex align-items-center gap-3 mb-3">
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
                <Dumbbell size={22} />
              </div>
              <div>
                <h3 className="fw-bold text-white m-0 fs-5" style={{ letterSpacing: '-0.02em' }}>
                  Register Gym & Owner Account
                </h3>
                <p className="text-muted m-0 small" style={{ fontSize: '0.8rem' }}>
                  Complete your basic owner and facility profile to start your 14-day trial
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

            <form onSubmit={handleRegisterSubmit} noValidate>
              {/* --- SECTION 1: BASIC ACCOUNT DETAILS --- */}
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-secondary border-opacity-25">
                  <User size={15} className="text-red" />
                  <span className="text-white fw-bold small text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.78rem' }}>
                    1. Basic Account Details
                  </span>
                </div>

                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <User size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="text"
                        name="name"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Account Email <span className="text-danger">*</span>
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Mail size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="email"
                        name="email"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="owner@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Phone size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="tel"
                        name="phone"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Password <span className="text-danger">*</span>
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Lock size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="min 6 chars"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn text-muted p-0 border-0 ms-1"
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Lock size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: GYM FACILITY DETAILS --- */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom border-secondary border-opacity-25">
                  <Building2 size={15} className="text-red" />
                  <span className="text-white fw-bold small text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.78rem' }}>
                    2. Gym Facility Details
                  </span>
                </div>

                <div className="row g-2">
                  <div className="col-12">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Gym / Brand Name <span className="text-danger">*</span>
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Building2 size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="text"
                        name="gymName"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. Ro-Fitness Iron Club"
                        value={formData.gymName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Gym Official Phone Number
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Phone size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="tel"
                        name="gymPhone"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. +91 91234 56789"
                        value={formData.gymPhone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Gym Official Email
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <Mail size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="email"
                        name="gymEmail"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. contact@rofitness.com"
                        value={formData.gymEmail}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Gym Street Address
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <MapPin size={15} className="text-muted me-2 flex-shrink-0" />
                      <input
                        type="text"
                        name="gymAddress"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. Plot 42, Ring Road, Near City Mall"
                        value={formData.gymAddress}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      City
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <input
                        type="text"
                        name="city"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. Mumbai"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      State
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <input
                        type="text"
                        name="state"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. Maharashtra"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="text-silver small fw-semibold d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      Pincode
                    </label>
                    <div
                      className="d-flex align-items-center rounded px-2.5 py-1.5"
                      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <input
                        type="text"
                        name="pincode"
                        className="bg-transparent border-0 text-white w-100 py-1"
                        style={{ outline: 'none', fontSize: '0.86rem' }}
                        placeholder="e.g. 400001"
                        value={formData.pincode}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-red w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 rounded"
                style={{ fontWeight: '600', fontSize: '0.92rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Registering Facility & Saving Details...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Select Plan</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3 pt-3 border-top border-dark">
              <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="btn btn-link p-0 text-danger fw-semibold text-decoration-none"
                  style={{ fontSize: '0.82rem' }}
                >
                  Sign In to Your Facility
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: PLAN SELECTION POPUP ==================== */}
        {currentStep === 'SELECT_PLAN' && (
          <div className="text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
              <Sparkles size={20} className="text-red" />
              <span className="badge bg-danger text-white px-3 py-1 text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                Step 2 of 2: Select SaaS Tier
              </span>
            </div>
            <h3 className="fw-bold text-white fs-3 mt-2 mb-1">
              CHOOSE YOUR <span className="text-red">SUBSCRIPTION PLAN</span>
            </h3>
            <p className="text-muted small mb-3">
              All plans include a <strong>14-Day Full Free Trial</strong>. No immediate card charge.
            </p>

            {/* Billing Toggle */}
            <div className="d-flex justify-content-center align-items-center mb-4 gap-2">
              <button
                type="button"
                className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-danger' : 'btn-dark text-silver'}`}
                style={{ borderRadius: '20px', padding: '5px 16px', fontSize: '0.78rem', fontWeight: '600' }}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`btn btn-sm ${billingCycle === 'yearly' ? 'btn-danger' : 'btn-dark text-silver'}`}
                style={{ borderRadius: '20px', padding: '5px 16px', fontSize: '0.78rem', fontWeight: '600' }}
                onClick={() => setBillingCycle('yearly')}
              >
                Annual Billing
                <span className="badge bg-success text-dark ms-1" style={{ fontSize: '0.62rem' }}>
                  SAVE 20%
                </span>
              </button>
            </div>

            {/* Plans Grid */}
            <div className="row g-3 text-start">
              {PLANS.map((plan) => {
                const isActivating = activatingPlanId === plan.id;
                const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

                return (
                  <div key={plan.id} className="col-12 col-md-4">
                    <div
                      className={`h-100 d-flex flex-column justify-content-between p-3 rounded position-relative ${
                        plan.isPopular ? 'border-danger' : 'border-secondary'
                      }`}
                      style={{
                        background: plan.isPopular
                          ? 'linear-gradient(180deg, rgba(255,42,42,0.12) 0%, rgba(15,20,32,0.95) 100%)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: plan.isPopular
                          ? '1.5px solid #ff2a2a'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: plan.isPopular ? '0 0 20px rgba(255,42,42,0.2)' : 'none',
                      }}
                    >
                      {plan.isPopular && (
                        <span
                          className="badge position-absolute top-0 end-0 m-2 px-2 py-1"
                          style={{
                            background: '#ff2a2a',
                            color: '#fff',
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            borderRadius: '12px',
                          }}
                        >
                          🔥 POPULAR
                        </span>
                      )}

                      <div>
                        <span className="text-muted fw-bold d-block" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
                          {plan.tagline}
                        </span>
                        <h4 className="fw-bold text-white fs-5 mt-1 mb-1">{plan.name}</h4>
                        <p className="text-muted mb-2" style={{ fontSize: '0.74rem', minHeight: '34px' }}>
                          {plan.description}
                        </p>

                        <div className="my-2">
                          <span className="fs-3 fw-bold text-white">${price}</span>
                          <span className="text-muted small">/mo</span>
                        </div>

                        <ul className="list-unstyled mb-3" style={{ fontSize: '0.75rem' }}>
                          {plan.features.map((feat, fidx) => (
                            <li key={fidx} className="d-flex align-items-center gap-2 mb-1 text-silver">
                              <CheckCircle2 size={13} className="text-red flex-shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleActivatePlan(plan)}
                        disabled={isActivating || activatingPlanId !== null}
                        className={`w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded ${
                          plan.isPopular ? 'btn-red' : 'btn-outline-red'
                        }`}
                        style={{ fontSize: '0.82rem', fontWeight: '600' }}
                      >
                        {isActivating ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Activating...</span>
                          </>
                        ) : (
                          <>
                            <span>{plan.buttonText}</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthRegisterModal;
