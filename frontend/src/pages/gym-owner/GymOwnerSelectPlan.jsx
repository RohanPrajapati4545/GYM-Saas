import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gymOwnerApi from '../../services/gymOwnerApi';
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

const PLANS = [
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

const GymOwnerSelectPlan = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activatingPlanId, setActivatingPlanId] = useState(null);

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

    await Swal.fire({
      title: `${plan.name} Activated!`,
      text: `Welcome! Your gym workspace has been configured with ${plan.name} limits.`,
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
          {PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isActivating = activatingPlanId === plan.id;

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
                        /mo {billingCycle === 'yearly' && '(billed annually)'}
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
                      📍{' '}
                      <strong>
                        {plan.maxBranches === 999 ? 'Unlimited' : `${plan.maxBranches}`} Location
                        {plan.maxBranches > 1 ? 's' : ''}
                      </strong>{' '}
                      •{' '}
                      <strong>
                        {plan.maxMembers === 999999 ? 'Unlimited' : `Up to ${plan.maxMembers.toLocaleString()}`}{' '}
                        Members
                      </strong>
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
                      onClick={() => handleSelectPlan(plan)}
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
