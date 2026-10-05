import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gymOwnerApi from '../../services/gymOwnerApi';
import adminApi from '../../services/adminApi';
import DynamicLogo from '../../components/DynamicLogo';
import Swal from 'sweetalert2';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Zap,
  Loader2,
  Flame,
  Clock,
  HelpCircle,
} from 'lucide-react';

const DEFAULT_PLANS = [
  {
    id: 'STARTER',
    name: 'Starter Gym',
    tagline: 'SINGLE BOUTIQUE CLUB',
    description: 'Perfect for standalone gym clubs, iron studios, and single-owner facilities.',
    monthlyPrice: 49,
    yearlyPrice: 39,
    maxBranches: 1,
    maxMembers: 300,
    features: [
      '1 Gym Location Branch',
      'Up to 300 Active Members',
      'WhatsApp Automated Invoicing & Reminders',
      'Branded Member QR Digital Pass Web App',
      'POS Desk Billing & GST Tax Receipts',
      'Trainer & Staff Attendance Logs',
      'Standard Email & Chat Support',
    ],
    buttonText: 'Activate Starter Plan',
    isPopular: false,
  },
  {
    id: 'GROWTH_PRO',
    name: 'Growth Pro',
    tagline: 'MULTI-BRANCH & BIOMETRIC HARDWARE',
    description: 'Our flagship plan for growing gym franchises requiring turnstile gate control & roaming.',
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
      'Priority 24/7 WhatsApp & Phone Support',
    ],
    buttonText: 'Activate Growth Pro (Recommended)',
    isPopular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Scale',
    tagline: 'FRANCHISE CHAINS & NETWORKS',
    description: 'For large multi-city gym networks requiring custom branding and dedicated hardware APIs.',
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
      'Custom Hardware API & ERP Webhooks',
      '99.99% Guaranteed Cloud SLA Agreement',
    ],
    buttonText: 'Activate Enterprise Plan',
    isPopular: false,
  },
];

const normalizeSelectPlan = (p, idx) => {
  const isFeatured =
    p.isPopular ||
    p.isFeatured ||
    idx === 1 ||
    p.name?.toLowerCase().includes('growth') ||
    p.name?.toLowerCase().includes('pro') ||
    p.name?.toLowerCase().includes('premium');
  const monthlyPrice = Number(p.monthlyPrice || p.price) || 49;
  const isLongDuration = (p.durationDays && p.durationDays >= 365) || p.type === 'ANNUAL';
  const yearlyPrice = Number(p.yearlyPrice) || (isLongDuration ? monthlyPrice : Math.round(monthlyPrice * 0.8));

  const features = Array.isArray(p.features)
    ? p.features
    : typeof p.features === 'string'
    ? p.features.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Full Gym Floor Access', 'Locker Room & Shower', 'Branded Member App'];

  return {
    id: p._id || p.id || `plan_${idx}`,
    name: p.name || 'Standard Gym',
    tagline:
      p.tagline ||
      (p.type
        ? `${p.type} TIER`
        : isFeatured
        ? 'MULTI-BRANCH & BIOMETRIC HARDWARE'
        : idx === 0
        ? 'SINGLE BOUTIQUE CLUB'
        : 'FRANCHISE & NETWORKS'),
    description: p.description || 'All-in-one gym management & attendance solution.',
    monthlyPrice,
    yearlyPrice,
    price: monthlyPrice,
    durationDays: p.durationDays,
    maxBranches: p.maxBranches !== undefined ? p.maxBranches : 5,
    maxMembers: p.maxMembers !== undefined ? p.maxMembers : 1500,
    features,
    buttonText: p.buttonText || `Activate ${p.name || 'Plan'}`,
    isPopular: isFeatured,
  };
};

const getStoredAdminPlans = () => {
  try {
    const adminPlans = localStorage.getItem('admin_plans') || localStorage.getItem('admin_custom_plans');
    if (adminPlans) {
      const parsed = JSON.parse(adminPlans);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter((p) => p.isActive !== false);
    }
  } catch (e) {
    console.error('Error reading stored admin plans:', e);
  }
  return [];
};

const GymOwnerSelectPlan = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activatingPlanId, setActivatingPlanId] = useState(null);

  const [plansList, setPlansList] = useState(() => {
    const stored = getStoredAdminPlans();
    if (stored.length > 0) {
      return stored.map((p, idx) => normalizeSelectPlan(p, idx));
    }
    return DEFAULT_PLANS;
  });

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await adminApi.get('/api/public/plans');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const active = res.data.data.filter((p) => p.isActive !== false);
          if (active.length > 0) {
            setPlansList(active.map((p, idx) => normalizeSelectPlan(p, idx)));
            try {
              localStorage.setItem('admin_plans', JSON.stringify(active));
            } catch (e) {}
          }
        } else {
          const stored = getStoredAdminPlans();
          if (stored.length > 0) {
            setPlansList(stored.map((p, idx) => normalizeSelectPlan(p, idx)));
          }
        }
      } catch (err) {
        const stored = getStoredAdminPlans();
        if (stored.length > 0) {
          setPlansList(stored.map((p, idx) => normalizeSelectPlan(p, idx)));
        }
      }
    };

    fetchPlans();

    const handlePlansUpdated = () => {
      const stored = getStoredAdminPlans();
      if (stored.length > 0) {
        setPlansList(stored.map((p, idx) => normalizeSelectPlan(p, idx)));
      }
    };

    window.addEventListener('storage', handlePlansUpdated);
    window.addEventListener('adminPlansUpdated', handlePlansUpdated);

    return () => {
      window.removeEventListener('storage', handlePlansUpdated);
      window.removeEventListener('adminPlansUpdated', handlePlansUpdated);
    };
  }, []);

  const confirmAndSelectPlan = async (plan) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const cycleLabel = billingCycle === 'monthly' ? 'Monthly' : 'Annual (20% OFF)';

    const result = await Swal.fire({
      title: `Select ${plan.name}?`,
      html: `
        <div style="font-size:0.95rem; color:#cbd5e1; margin-top:8px; line-height:1.6;">
          <p style="margin-bottom:6px;">
            <strong>Plan Tier:</strong> <span style="color:#ff4444; font-weight:700;">${plan.name}</span>
          </p>
          <p style="margin-bottom:6px;">
            <strong>Price:</strong> <span style="color:#ffffff; font-weight:700;">$${price}/month</span> (${cycleLabel})
          </p>
          <p style="margin-bottom:0; color:#94a3b8; font-size:0.85rem;">
            Includes 14-day free trial. Do you want to proceed and activate this plan?
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Select Plan',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ff2a2a',
      cancelButtonColor: '#2b354f',
      background: '#10141d',
      color: '#ffffff',
      reverseButtons: true,
      focusConfirm: true,
    });

    if (result.isConfirmed) {
      await handleSelectPlan(plan);
    }
  };

  const handleSelectPlan = async (plan) => {
    setActivatingPlanId(plan.id);

    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const planPayload = {
      planName: plan.name,
      maxBranches: plan.maxBranches,
      maxMembers: plan.maxMembers,
      billingCycle: billingCycle.toUpperCase(),
      price,
    };

    try {
      // Call gymOwnerApi to activate plan in backend
      await gymOwnerApi.post('/api/owner/gym/select-plan', planPayload);
    } catch (err) {
      console.warn('Backend plan sync warning (proceeding with local grant):', err);
    }

    // Save in localStorage for persistent client access
    localStorage.setItem(
      'gymSelectedPlan',
      JSON.stringify({
        ...planPayload,
        activatedAt: new Date().toISOString(),
      })
    );

    const gymTitle = user?.gymName || user?.gym?.name || user?.name || 'Your Gym';

    await Swal.fire({
      title: `${plan.name} Activated!`,
      text: `Welcome ${gymTitle}! Your gym workspace has been configured with ${plan.name} limits and 14-Day Free Trial.`,
      icon: 'success',
      confirmButtonText: 'Enter Gym Dashboard',
      confirmButtonColor: '#ff2a2a',
      background: '#10141d',
      color: '#fff',
    });

    setActivatingPlanId(null);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div
      className="min-vh-100 py-5 px-3 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: 'radial-gradient(circle at top, #141824 0%, #090c10 100%)',
        color: '#fff',
      }}
    >
      <div className="container" style={{ maxWidth: '1120px' }}>
        {/* Header Block */}
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center mb-3">
            <DynamicLogo size="large" subtitle="FACILITY ONBOARDING" />
          </div>

          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3"
            style={{
              background: 'rgba(255, 42, 42, 0.12)',
              border: '1px solid rgba(255, 42, 42, 0.4)',
              color: '#ff4a4a',
              fontSize: '0.78rem',
              fontWeight: '700',
              letterSpacing: '0.06em',
            }}
          >
            <Sparkles size={14} />
            <span>STEP 2 OF 2: CHOOSE YOUR SUBSCRIPTION PLAN</span>
          </div>

          <h1 className="fw-bold font-hero display-5 mb-2">
            SELECT YOUR <span className="text-red">GYM SAAS PLAN</span>
          </h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '620px', fontSize: '0.95rem' }}>
            Choose a plan to instantly activate your gym dashboard, turnstile biometric gateway, and member database.
          </p>

          {/* Billing Cycle Switch */}
          <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
            <button
              type="button"
              className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-red' : 'btn-dark text-silver'}`}
              style={{ borderRadius: '30px', padding: '8px 22px', fontWeight: '600' }}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`btn btn-sm position-relative ${billingCycle === 'yearly' ? 'btn-red' : 'btn-dark text-silver'}`}
              style={{ borderRadius: '30px', padding: '8px 22px', fontWeight: '600' }}
              onClick={() => setBillingCycle('yearly')}
            >
              Annual Billing
              <span
                className="badge ms-2"
                style={{
                  background: '#22c55e',
                  color: '#000',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                }}
              >
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="row g-4 justify-content-center align-items-stretch">
          {plansList.map((plan) => {
            const price = billingCycle === 'monthly' ? (plan.monthlyPrice || plan.price) : (plan.yearlyPrice || plan.price);
            const isActivating = activatingPlanId === plan.id;
            const durationSuffix = plan.durationDays
              ? plan.durationDays === 30
                ? '/30 Days'
                : `/${plan.durationDays} Days`
              : '/mo';

            const branchesText =
              plan.maxBranches !== undefined && plan.maxBranches !== null
                ? plan.maxBranches >= 50
                  ? 'Unlimited Locations'
                  : `${plan.maxBranches} Location${plan.maxBranches > 1 ? 's' : ''}`
                : plan.durationDays
                ? `${plan.durationDays} Days Pass`
                : 'All Locations';

            const membersText =
              plan.maxMembers !== undefined && plan.maxMembers !== null
                ? plan.maxMembers >= 10000
                  ? 'Unlimited Members'
                  : `Up to ${Number(plan.maxMembers).toLocaleString()} Members`
                : 'Turnstile RFID Sync';

            return (
              <div key={plan.id} className="col-12 col-md-6 col-lg-4">
                <div
                  className={`plan-card h-100 d-flex flex-column justify-content-between position-relative ${
                    plan.isPopular ? 'featured' : ''
                  }`}
                  style={{
                    backgroundColor: plan.isPopular ? 'rgba(25, 18, 24, 0.92)' : 'rgba(18, 24, 36, 0.85)',
                    border: plan.isPopular ? '2px solid #ff2a2a' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: plan.isPopular
                      ? '0 0 32px rgba(255, 42, 42, 0.28), 0 12px 30px rgba(0,0,0,0.7)'
                      : '0 8px 24px rgba(0,0,0,0.5)',
                  }}
                >
                  {plan.isPopular && (
                    <span
                      className="badge position-absolute top-0 end-0 m-3 px-3 py-1"
                      style={{
                        background: 'linear-gradient(135deg, #ff2a2a 0%, #a80000 100%)',
                        color: '#fff',
                        fontWeight: '800',
                        letterSpacing: '0.06em',
                        borderRadius: '20px',
                        boxShadow: '0 0 16px rgba(255,42,42,0.65)',
                      }}
                    >
                      🔥 RECOMMENDED
                    </span>
                  )}

                  <div>
                    <span className="plan-badge">{plan.tagline}</span>
                    <h3 className="font-display fs-3 m-0 mt-1">{plan.name}</h3>
                    <p className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                      {plan.description}
                    </p>

                    <div className={`plan-price my-3 ${plan.isPopular ? 'text-red' : 'text-white'}`}>
                      ${price}
                      <span className="text-silver fs-6">
                        {durationSuffix} {billingCycle === 'yearly' && !plan.durationDays && '(billed annually)'}
                      </span>
                    </div>

                    <div
                      className={`p-2 mb-3 rounded small ${
                        plan.isPopular
                          ? 'bg-dark border border-danger text-silver'
                          : 'bg-dark border border-dark text-silver'
                      }`}
                      style={plan.isPopular ? { background: 'rgba(255,42,42,0.08)' } : {}}
                    >
                      📍 <strong>{branchesText}</strong> • <strong>{membersText}</strong>
                    </div>

                    <ul className="plan-features">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="d-flex align-items-center gap-2">
                          <CheckCircle2 size={15} color="#ff2a2a" className="flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => confirmAndSelectPlan(plan)}
                      disabled={activatingPlanId !== null}
                      className={`w-100 ${plan.isPopular ? 'btn-red' : 'btn-outline-red'}`}
                      style={{ padding: '12px 20px', fontWeight: '700' }}
                    >
                      {isActivating ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Granting Access...</span>
                        </>
                      ) : (
                        <>
                          <span>{plan.buttonText}</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee & Quick Skip */}
        <div className="mt-5 text-center">
          <div className="d-inline-flex flex-wrap align-items-center justify-content-center p-3 rounded-pill bg-dark border border-dark text-muted fs-7 gap-3 mb-3">
            <span className="d-flex align-items-center gap-1 text-silver">
              <ShieldCheck size={15} color="#22c55e" /> 14-Day Free Access
            </span>
            <span className="d-flex align-items-center gap-1 text-silver">
              <CheckCircle2 size={15} color="#22c55e" /> No Credit Card Required Today
            </span>
            <span className="d-flex align-items-center gap-1 text-silver">
              <Zap size={15} color="#22c55e" /> Instant Dashboard Activation
            </span>
          </div>

          <div>
            <Link
              to="/dashboard"
              className="text-secondary small text-decoration-none hover-red"
              style={{ transition: 'color 0.2s ease' }}
            >
              Already chosen a plan? Continue to Gym Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymOwnerSelectPlan;
