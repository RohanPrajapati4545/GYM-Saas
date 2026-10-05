import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSettings } from '../store/slices/settingsSlice';
import { setLandingCMS } from '../store/slices/cmsSlice';
import adminApi from '../services/adminApi';
import DynamicLogo from '../components/DynamicLogo';
import OrbitImages from '../components/OrbitImages/OrbitImages';
import AuthLoginModal from '../components/modals/AuthLoginModal';
import AuthRegisterModal from '../components/modals/AuthRegisterModal';
import {
  ArrowRight,
  Shield,
  Building2,
  Activity,
  Flame,
  CheckCircle2,
  HelpCircle,
  Send,
  Loader2,
  Sparkles,
  Users,
  CreditCard,
  Smartphone,
  BarChart3,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'ALL-IN-ONE GYM MANAGEMENT SAAS',
    titlePrefix: 'Your Gym.',
    titleHighlight: 'One Powerful Dashboard.',
    subtitle: 'Stop juggling spreadsheets, WhatsApp messages, and multiple tools. GymSaaS brings your entire gym operation together in one simple platform.',
    primaryButtonText: 'Book Free Live Demo',
    primaryButtonLink: '#contact',
    secondaryButtonText: 'Explore Platform',
    secondaryButtonLink: '#features',
    image: '/slide-1.jpg',
    trustPoints: ['Members → Memberships', 'Payments → Attendance', 'Trainers → Analytics'],
  },
  {
    id: 2,
    badge: 'MULTI-LOCATION EXPANSION',
    titlePrefix: 'SCALE UNLIMITED',
    titleHighlight: 'BRANCHES & MEMBER ROAMING',
    subtitle: 'Manage multiple gym centers effortlessly. Centralize member roaming privileges, staff payroll hierarchies, and branch P&L in real time.',
    primaryButtonText: 'Start 14-Day Free Trial',
    primaryButtonLink: '/register',
    secondaryButtonText: 'View SaaS Pricing',
    secondaryButtonLink: '#pricing',
    image: '/slide-2.jpg',
    trustPoints: ['Central Member Roaming', 'Staff Permission Hierarchy', 'Consolidated P&L Ledger'],
  },
  {
    id: 3,
    badge: 'ZERO REVENUE LEAKAGE',
    titlePrefix: 'STOP REVENUE LOSS WITH',
    titleHighlight: 'AUTOMATED BILLING & RENEWALS',
    subtitle: 'Send automated WhatsApp invoices, collect payments via instant UPI QR, and automatically lock turnstile access upon plan expiry.',
    primaryButtonText: 'Calculate Your ROI',
    primaryButtonLink: '#calculator',
    secondaryButtonText: 'See Billing Demo',
    secondaryButtonLink: '#features',
    image: '/slide-3.jpg',
    trustPoints: ['WhatsApp Invoicing Engine', 'Auto Gate Lockout', 'Instant UPI Collections'],
  },
  {
    id: 4,
    badge: 'TRAINER & ATHLETE PORTAL',
    titlePrefix: 'BOOST RETENTION WITH',
    titleHighlight: 'DIGITAL COACHING & ROSTERS',
    subtitle: 'Empower personal trainers with workout chart builders, diet planners, and automated commission payouts calculated per session.',
    primaryButtonText: 'Get Started Free',
    primaryButtonLink: '/register',
    secondaryButtonText: 'Talk to Sales',
    secondaryButtonLink: '#contact',
    image: '/slide-4.jpg',
    trustPoints: ['Trainer Commission Splits', 'Diet & Workout Charts', 'Live Check-In Logs'],
  },
  {
    id: 5,
    badge: 'PLUG & PLAY HARDWARE SYNC',
    titlePrefix: 'SUB-SECOND SYNC',
    titleHighlight: 'BIOMETRIC TURNSTILES & POS',
    subtitle: 'Plug-and-play API gateways for facial recognition, fingerprint readers, and RFID turnstiles with front-desk POS billing in under 10 seconds.',
    primaryButtonText: 'Book Hardware Demo',
    primaryButtonLink: '#contact',
    secondaryButtonText: 'View Integrations',
    secondaryButtonLink: '#features',
    image: '/slide-5.jpg',
    trustPoints: ['Facial Recognition & RFID', 'Sub-Second Gate Sync', 'Thermal POS Receipts'],
  },
  {
    id: 6,
    badge: 'MEMBER RETENTION & APP',
    titlePrefix: 'INCREASE RETENTION BY',
    titleHighlight: 'UP TO 35% WITH MEMBER APP',
    subtitle: 'Give your members a branded mobile web app with attendance streak badges, macro diet tracking, and 1-tap instant renewals.',
    primaryButtonText: 'Claim Free Trial',
    primaryButtonLink: '/register',
    secondaryButtonText: 'Compare Plans',
    secondaryButtonLink: '#pricing',
    image: '/slide-6.jpg',
    trustPoints: ['Branded Member QR Check-In', 'Workout Streak Gamification', '1-Tap Mobile Renewals'],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading: authLoading } = useSelector((state) => state.auth);
  const { isAuthenticated: isAdminAuth, admin, loading: adminLoading } = useSelector((state) => state.adminAuth);
  const { settings } = useSelector((state) => state.settings);
  const { landingCMS } = useSelector((state) => state.cms);

  useEffect(() => {
    if (isAdminAuth || admin || user?.role === 'SUPER_ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (isAuthenticated || user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdminAuth, user, admin, navigate]);

  // Popups State (Sign In & Book Free Demo)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedTrialPlan, setSelectedTrialPlan] = useState(null);

  useEffect(() => {
    const authAction = searchParams.get('auth') || searchParams.get('openAuth');
    if (authAction === 'login') {
      setIsLoginModalOpen(true);
    } else if (authAction === 'register' || authAction === 'demo') {
      setIsRegisterModalOpen(true);
    }
  }, [searchParams]);

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
    if (searchParams.get('auth') || searchParams.get('openAuth')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleCloseRegister = () => {
    setIsRegisterModalOpen(false);
    setSelectedTrialPlan(null);
    sessionStorage.removeItem('selectedPlanOnSignup');
    if (searchParams.get('auth') || searchParams.get('openAuth')) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSelectPlan = (plan) => {
    sessionStorage.setItem('selectedPlanOnSignup', JSON.stringify(plan));
    setSelectedTrialPlan(plan);
    setIsRegisterModalOpen(true);
  };

  // Navbar dynamic scroll state (transparent on 0px, blurred dark on scroll)
  const [isScrolled, setIsScrolled] = useState(false);

  // Slider State (2 seconds auto slide)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Calculator State
  const [calcMembers, setCalcMembers] = useState(350);
  const [calcFee, setCalcFee] = useState(45);

  // Pricing billing cycle toggle ('monthly' | 'yearly')
  const [pricingCycle, setPricingCycle] = useState('monthly');

  // FAQ open index state
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inquiry form
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Features Slider Horizontal Scroll Handler
  const featuresScrollRef = useRef(null);
  const scrollFeatures = (direction) => {
    if (featuresScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      featuresScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Header Navigation Items & Active Tab State
  const NAV_ITEMS = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'ecosystem', label: 'Ecosystem' },
    { id: 'calculator', label: 'ROI Calculator' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];
  const [activeNav, setActiveNav] = useState('home');

  // Helper to extract SaaS plans configured by Super Admin
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

  const [dynamicPlans, setDynamicPlans] = useState(() => {
    const stored = getStoredAdminPlans();
    return stored.length > 0 ? stored : [];
  });

  // Scroll listener for smooth transparent-to-dark navbar & active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Scroll Spy for active nav tab (lights up glowing red line under active tab)
      const scrollPos = window.scrollY + 160;
      const sectionIds = ['contact', 'faq', 'pricing', 'calculator', 'ecosystem', 'features', 'home'];
      for (const id of sectionIds) {
        const el = document.getElementById(id) || (id === 'home' ? document.getElementById('home-mobile') : null);
        if (el && el.offsetTop <= scrollPos) {
          setActiveNav(id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Public CMS Data & Dynamic Super Admin Pricing Plans with instant real-time sync
  useEffect(() => {
    const refreshPlans = () => {
      const stored = getStoredAdminPlans();
      if (stored && stored.length > 0) {
        setDynamicPlans(stored);
      }
    };

    const fetchPublicData = async () => {
      try {
        const [settingsRes, cmsRes] = await Promise.allSettled([
          adminApi.get('/api/public/settings'),
          adminApi.get('/api/public/landing'),
        ]);

        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.success) {
          dispatch(setSettings(settingsRes.value.data.data));
        }
        if (cmsRes.status === 'fulfilled' && cmsRes.value.data?.success) {
          dispatch(setLandingCMS(cmsRes.value.data.data));
        }

        let fetched = null;
        try {
          const plansRes = await adminApi.get('/api/public/plans');
          if (plansRes.data?.data && Array.isArray(plansRes.data.data)) {
            fetched = plansRes.data.data.filter((p) => p.isActive !== false);
          }
        } catch (pubErr) {
          // fallback to /api/admin/plans if public route returned 404
          try {
            const adminPlansRes = await adminApi.get('/api/admin/plans');
            if (adminPlansRes.data?.data && Array.isArray(adminPlansRes.data.data)) {
              fetched = adminPlansRes.data.data.filter((p) => p.isActive !== false);
            }
          } catch (admErr) {}
        }
        
        if (fetched && fetched.length > 0) {
          setDynamicPlans(fetched);
          try {
            localStorage.setItem('admin_plans', JSON.stringify(fetched));
            localStorage.setItem('admin_custom_plans', JSON.stringify(fetched));
          } catch (e) {}
        } else {
          const stored = getStoredAdminPlans();
          if (stored && stored.length > 0) {
            setDynamicPlans(stored);
          }
        }
      } catch (err) {
        console.error('Failed to load public landing data:', err);
      }
    };

    fetchPublicData();

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('superadmin_plans_channel');
        bc.onmessage = (event) => {
          if (event.data?.plans && Array.isArray(event.data.plans)) {
            const activePlans = event.data.plans.filter((p) => p.isActive !== false);
            setDynamicPlans(activePlans);
          } else {
            refreshPlans();
          }
        };
      } catch (e) {}
    }

    window.addEventListener('storage', refreshPlans);
    window.addEventListener('adminPlansUpdated', refreshPlans);
    window.addEventListener('focus', fetchPublicData);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', refreshPlans);
      window.removeEventListener('adminPlansUpdated', refreshPlans);
      window.removeEventListener('focus', fetchPublicData);
    };
  }, [dispatch]);

  // Automated Hero Slider Interval (6 Seconds auto-slide)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Scroll Reveal Animations Hook (Smooth Trigger for all sections)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [landingCMS]);

  const customCmsTitle =
    landingCMS?.hero?.title && landingCMS.hero.title !== 'BE STRONG'
      ? landingCMS.hero.title
      : null;

  const activeSlide = HERO_SLIDES[currentSlideIndex] || HERO_SLIDES[0];

  // If CMS has custom hero override, merge it gracefully into first slide
  const displaySlide = {
    ...activeSlide,
    ...(currentSlideIndex === 0 && landingCMS?.hero
      ? {
        badge: landingCMS.hero.badge || activeSlide.badge,
        titlePrefix: customCmsTitle ? '' : activeSlide.titlePrefix,
        titleHighlight: customCmsTitle || activeSlide.titleHighlight,
        subtitle: landingCMS.hero.subtitle || activeSlide.subtitle,
        primaryButtonText: landingCMS.hero.primaryButtonText || activeSlide.primaryButtonText,
        primaryButtonLink: landingCMS.hero.primaryButtonLink || activeSlide.primaryButtonLink,
        secondaryButtonText: landingCMS.hero.secondaryButtonText || activeSlide.secondaryButtonText,
      }
      : {}),
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.email || !inquiryData.message) {
      Swal.fire({
        title: 'Missing Details',
        text: 'Please fill name, email, and message.',
        icon: 'warning',
        background: '#10141d',
        color: '#fff',
      });
      return;
    }

    setSubmittingInquiry(true);
    try {
      const res = await adminApi.post('/api/public/inquiries', inquiryData);
      if (res.data?.success) {
        Swal.fire({
          title: 'Inquiry Submitted!',
          text: 'Thank you! Our platform team will contact you shortly.',
          icon: 'success',
          background: '#10141d',
          color: '#fff',
        });
        setInquiryData({ name: '', email: '', phone: '', company: '', message: '' });
      }
    } catch (error) {
      Swal.fire({
        title: 'Submission Failed',
        text: error.response?.data?.message || 'Could not submit inquiry. Please try again.',
        icon: 'error',
        background: '#10141d',
        color: '#fff',
      });
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const features = landingCMS?.features?.filter((f) => f.isActive) || [
    {
      icon: 'Building2',
      title: 'Multi-Branch Franchise Hub',
      description: 'Manage unlimited gym locations, franchise accounts, and member roaming with unified consolidated accounting.',
    },
    {
      icon: 'Shield',
      title: 'Biometric RFID Turnstiles',
      description: 'Zero-latency sync with hardware gates. Automatically denies entry when a member subscription expires.',
    },
    {
      icon: 'CreditCard',
      title: 'Automated WhatsApp Billing & POS',
      description: '1-click invoices, automated WhatsApp payment links, instant UPI QR collections, and GST tax management.',
    },
    {
      icon: 'Users',
      title: 'Coach & PT Commission Engine',
      description: 'Track trainer shifts, automated per-session personal training commission calculations, and staff payroll.',
    },
    {
      icon: 'Smartphone',
      title: 'Branded Member Mobile Web Portal',
      description: 'Digital check-in QR, workout logs, nutrition macro plans, and 1-tap in-app membership renewal checkout.',
    },
    {
      icon: 'BarChart3',
      title: 'Executive P&L Analytics',
      description: 'Real-time multi-branch revenue comparisons, churn forecasting, and cash collection breakdown dashboards.',
    },
  ];

  const stats = landingCMS?.stats?.filter((s) => s.isActive) || [
    { value: '500+', label: 'Active Gym Franchises' },
    { value: '1.2M+', label: 'Monthly Check-ins' },
    { value: '99.98%', label: 'Cloud Uptime SLA' },
    { value: '$45M+', label: 'Dues Processed' },
  ];

  const pricing = landingCMS?.pricing || [];
  const faqList = landingCMS?.faq?.filter((q) => q.isActive) || [
    {
      question: 'How quickly can I set up my gym with this software?',
      answer: 'You can be up and running in less than 15 minutes! Import existing member CSV files, configure membership plans, and connect your biometric gates with our guided onboarding.',
    },
    {
      question: 'Does it support multiple gym branches in different cities?',
      answer: 'Yes! Our architecture is built ground-up for multi-branch gym owners. You get a central consolidated dashboard with separate logins and permission controls for individual branch managers.',
    },
    {
      question: 'How does the hardware/turnstile gate integration work?',
      answer: 'We provide plug-and-play API gateways for RFID scanners, biometric fingerprint readers, and facial recognition turnstiles with sub-second cloud sync.',
    },
    {
      question: 'Can members book personal training sessions and diet charts?',
      answer: 'Absolutely. Trainers can assign customized workout and nutrition plans directly to member accounts, tracking adherence and progress in real time.',
    },
    {
      question: 'Is my gym financial data secure and backed up?',
      answer: 'All data is encrypted with AES-256 bank-grade protocols, hosted in secure Tier-4 data centers with automated hourly off-site backups.',
    },
  ];

  const getFeatureIcon = (name) => {
    switch (name) {
      case 'Building2': return <Building2 size={26} />;
      case 'Shield': return <Shield size={26} />;
      case 'CreditCard': return <CreditCard size={26} />;
      case 'Users': return <Users size={26} />;
      case 'Smartphone': return <Smartphone size={26} />;
      case 'BarChart3': return <BarChart3 size={26} />;
      case 'Activity': return <Activity size={26} />;
      default: return <Flame size={26} />;
    }
  };

  // Calculations for ROI Calculator
  const estimatedMonthlyRevenue = calcMembers * calcFee;
  const estimatedRecoveredRevenue = Math.round(estimatedMonthlyRevenue * 0.14);
  const estimatedHoursSaved = Math.round(calcMembers * 0.12 + 15);

  return (
    <div className="xtreme-landing">
      {/* =========================================================================
          DYNAMIC NAVBAR (100% TRANSPARENT ON TOP, SMOOTH BLURRED DARK ON SCROLL)
          ========================================================================= */}
      <header className={`xtreme-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="text-decoration-none">
          <DynamicLogo size="medium" subtitle="FITNESS SAAS PLATFORM" />
        </Link>

        <nav className="xtreme-nav-links d-none d-lg-flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeNav === item.id ? 'active' : ''}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="xtreme-nav-actions d-none d-md-flex align-items-center gap-2">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-red">
              <span>Dashboard ({user?.name?.split(' ')[0] || 'Owner'})</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <button
                type="button"
                className="btn-outline-red"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn-red d-flex align-items-center gap-2"
                onClick={() => {
                  setSelectedTrialPlan(null);
                  setIsRegisterModalOpen(true);
                }}
              >
                <span>Book Free Demo</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="btn btn-outline-secondary d-lg-none p-2 border-0 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>☰</span>
        </button>
      </header>

      {/* Mobile Drawer Navigation (Smooth Slide-In with Backdrop Blur) */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay d-lg-none open"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-content d-flex flex-column p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-dark">
              <DynamicLogo size="small" subtitle="FITNESS PLATFORM" />
              <button
                type="button"
                className="btn text-white p-1 fs-4"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Mobile Menu"
              >
                ✕
              </button>
            </div>

            <nav className="d-flex flex-column gap-3 mb-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`text-decoration-none fw-semibold fs-5 py-2 border-bottom border-dark d-flex align-items-center justify-content-between ${
                    activeNav === item.id ? 'text-red fw-bold' : 'text-silver'
                  }`}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  {activeNav === item.id && (
                    <span
                      className="badge bg-danger rounded-pill"
                      style={{ width: '8px', height: '8px', padding: 0 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            <div className="mt-auto d-flex flex-column gap-2 pt-3 border-top border-dark">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-red w-100 text-center justify-content-center" onClick={() => setMobileMenuOpen(false)}>
                  <span>Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-outline-red w-100 text-center justify-content-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn-red w-100 text-center justify-content-center d-flex align-items-center gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSelectedTrialPlan(null);
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    <span>Book Free Demo</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION (DESKTOP: DYNAMIC SLIDER | MOBILE: CLEAN STATIC PROFESSIONAL HERO)
          ========================================================================= */}

      {/* 1. MOBILE ONLY HERO (Static professional text & static background image - NO SLIDER) */}
      <section className="xtreme-hero mobile-static-hero d-md-none" id="home-mobile">
        <div
          className="mobile-hero-bg"
          style={{
            backgroundImage: 'url(/slide-1.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.2,
          }}
        />
        <div className="mobile-hero-gradient-overlay" />

        <div className="position-relative z-2 text-center px-2 py-3">
          <div className="hero-brand-pill mx-auto mb-3">
            <span className="hero-brand-pill-dot"></span>
            <span>{landingCMS?.hero?.badge || 'ALL-IN-ONE GYM SAAS PLATFORM'}</span>
          </div>

          <h1 className="hero-headline-massive text-white mb-3" style={{ fontSize: '2.05rem', lineHeight: '1.22' }}>
            {customCmsTitle ? (
              <span className="text-gradient-red">{customCmsTitle}</span>
            ) : (
              <>
                Your Gym.{' '}
                <span className="text-gradient-red">One Powerful Dashboard.</span>
              </>
            )}
          </h1>

          <p className="hero-subheadline text-silver mx-auto mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.55' }}>
            {landingCMS?.hero?.subtitle || (
              <>
                Stop juggling spreadsheets, WhatsApp messages, and multiple tools.
                <br className="d-none d-sm-block" />
                <span className="text-white fw-semibold"> GymSaaS brings your entire gym operation together in one simple platform.</span>
              </>
            )}
          </p>

          {/* Operational Flow Ribbon */}
          <div className="hero-flow-ribbon mx-auto mb-4" style={{ maxWidth: '420px' }}>
            <span className="hero-flow-item">Members</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-item">Memberships</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-item">Payments</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-item">Attendance</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-item">Trainers</span>
            <span className="hero-flow-arrow">→</span>
            <span className="hero-flow-item">Analytics</span>
          </div>

          <div className="d-flex flex-column gap-2.5 mx-auto mb-3" style={{ maxWidth: '340px' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedTrialPlan(null);
                setIsRegisterModalOpen(true);
              }}
              className="btn-hero-primary justify-content-center w-100 py-3"
            >
              <span>{landingCMS?.hero?.primaryButtonText || 'Book Free Live Demo'}</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="btn-hero-secondary justify-content-center w-100 py-2.5"
            >
              <Sparkles size={16} className="text-red" />
              <span>Owner Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. DESKTOP & TABLET HERO (Original Dynamic 6-Slide Slider) */}
      <section className="xtreme-hero d-none d-md-flex" id="home">
        {/* Multi-Image Background Slider (Seamless Right-Side BG) */}
        <div className="hero-slider-bg-wrapper">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`hero-slide-bg-item ${idx === currentSlideIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>

        {/* Seamless Soft Gradient Overlay */}
        <div className="hero-gradient-overlay"></div>
        <div className="hero-ambient-glow"></div>

        {/* Hero Content Area */}
        <div className="w-100">
          <div className="hero-content-container">
            {/* Left Content Column with Smooth Grid-Stacked Crossfade */}
            <div className="hero-text-slider-wrapper">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === currentSlideIndex;
                const isFirstSlide = idx === 0 && landingCMS?.hero;
                const itemBadge = isFirstSlide ? (landingCMS.hero.badge || slide.badge) : slide.badge;
                const itemPrefix = isFirstSlide ? (customCmsTitle ? '' : slide.titlePrefix) : slide.titlePrefix;
                const itemHighlight = isFirstSlide ? (customCmsTitle || slide.titleHighlight) : slide.titleHighlight;
                const itemSubtitle = isFirstSlide ? (landingCMS.hero.subtitle || slide.subtitle) : slide.subtitle;
                const itemPrimaryText = isFirstSlide ? (landingCMS.hero.primaryButtonText || slide.primaryButtonText) : slide.primaryButtonText;
                const itemPrimaryLink = isFirstSlide ? (landingCMS.hero.primaryButtonLink || slide.primaryButtonLink) : slide.primaryButtonLink;
                const itemSecondaryText = isFirstSlide ? (landingCMS.hero.secondaryButtonText || slide.secondaryButtonText) : slide.secondaryButtonText;
                const itemSecondaryLink = isFirstSlide ? (landingCMS.hero.secondaryButtonLink || slide.secondaryButtonLink) : slide.secondaryButtonLink;

                return (
                  <div
                    key={slide.id}
                    className={`hero-slide-text-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="hero-brand-pill">
                      <span className="hero-brand-pill-dot"></span>
                      <span>{itemBadge}</span>
                    </div>

                    <h1 className="hero-headline-massive">
                      {itemPrefix}{' '}
                      <span className="text-gradient-red">{itemHighlight}</span>
                    </h1>

                    <p className="hero-subheadline">
                      {itemSubtitle}
                    </p>

                    <div className="hero-actions-row">
                      <button
                        type="button"
                        onClick={() => {
                          if (itemPrimaryLink === '#contact') {
                            const el = document.getElementById('contact');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            setSelectedTrialPlan(null);
                            setIsRegisterModalOpen(true);
                          }
                        }}
                        className="btn-hero-primary"
                      >
                        <span>{itemPrimaryText}</span>
                        <ArrowRight size={18} />
                      </button>

                      <a href={itemSecondaryLink} className="btn-hero-secondary">
                        <Sparkles size={18} className="text-red" />
                        <span>{itemSecondaryText}</span>
                      </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="hero-trust-indicators mt-4 d-flex align-items-center gap-3 flex-wrap">
                      {slide.trustPoints.map((tp, pidx) => (
                        <div key={pidx} className="hero-trust-badge">
                          <CheckCircle2 size={16} className="text-red" />
                          <span>{tp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Side spacer allowing clear framed view of gym photography */}
            <div className="d-none d-lg-block"></div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY SAAS METRICS STRIP (ANIMATED & 90% SCALED)
          ========================================================================= */}
      {stats.length > 0 && (
        <section className="py-3 border-top border-bottom border-dark reveal-on-scroll" style={{ backgroundColor: '#090d14' }}>
          <div className="container">
            <div className="row g-3 text-center">
              {stats.map((st, i) => (
                <div key={i} className={`col-6 col-md-3 reveal-on-scroll stagger-${i + 1}`}>
                  <div className="fw-bold font-hero stats-number-glow text-red" style={{ fontSize: '2.1rem' }}>{st.value}</div>
                  <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.74rem', letterSpacing: '0.08em' }}>
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          CORE CAPABILITIES / FEATURES SECTION (1-ROW SMOOTH SLIDER WITH NAV ICONS)
          ========================================================================= */}
      <section className="xtreme-section reveal-on-scroll" id="features">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <p className="section-tag mb-2">ALL-IN-ONE GYM OS</p>
            <h2 className="section-heading-huge m-0">EVERYTHING YOU NEED TO SCALE YOUR GYM</h2>
            <p className="section-subtext m-0 mt-2 text-start">
              Engineered specifically for single-gym owners and multi-branch fitness franchise chains.
            </p>
          </div>

          {/* Left / Right Slide Navigation Buttons */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              type="button"
              className="feature-slide-arrow-btn"
              onClick={() => scrollFeatures('left')}
              aria-label="Previous Features"
              title="Previous Features"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="feature-slide-arrow-btn"
              onClick={() => scrollFeatures('right')}
              aria-label="Next Features"
              title="Next Features"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* 1-Row Smooth Horizontal Slider Track */}
        <div className="features-slider-track-container" ref={featuresScrollRef}>
          <div className="features-slider-track">
            {features.map((f, i) => (
              <div key={i} className={`xtreme-feature-card feature-slider-item reveal-on-scroll stagger-${(i % 6) + 1}`}>
                <div className="feature-icon-badge">
                  {getFeatureIcon(f.icon)}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE ATHLETE & EQUIPMENT CLOUD ORBIT SHOWCASE
          ========================================================================= */}
      <section className="xtreme-section border-top border-dark position-relative overflow-hidden reveal-on-scroll" id="ecosystem">
        <div className="section-title-wrap">
          <p className="section-tag">UNIFIED SAAS HARDWARE & ATHLETE HUB</p>
          <h2 className="section-heading-huge">SYNCHRONIZE ATHLETES, DUMBBELLS & GATES</h2>
          <p className="section-subtext">
            From heavy free weights and member workout routines to biometric turnstiles — every piece of your gym operates in perfect cloud sync.
          </p>
        </div>

        <div className="d-flex justify-content-center align-items-center position-relative my-3">
          <div style={{ width: '100%', maxWidth: '920px' }} className="position-relative d-flex justify-content-center align-items-center">
            <OrbitImages
              images={[
                '/orbit/dumbbell-1.jpg',
                '/orbit/bodybuilder-1.jpg',
                '/orbit/dumbbell-2.jpg',
                '/orbit/bodybuilder-2.jpg',
                '/orbit/barbell-1.jpg',
                '/orbit/hardware-1.jpg',
              ]}
              shape="ellipse"
              baseWidth={900}
              baseHeight={380}
              aspectRatio="2.35 / 1"
              radiusX={375}
              radiusY={130}
              rotation={-7}
              duration={20}
              itemSize={68}
              responsive={true}
              showPath={true}
              pathColor="rgba(255, 42, 42, 0.28)"
              pathWidth={2}
              centerContent={
                <div className="d-flex flex-column align-items-center justify-content-center text-center position-relative">
                  <div className="orbit-radar-ring" />
                  <div className="orbit-radar-ring orbit-radar-ring-2" />
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle position-relative"
                    style={{
                      width: '66px',
                      height: '66px',
                      background: 'radial-gradient(circle, #ff2a2a 0%, #a80000 100%)',
                      boxShadow: '0 0 30px rgba(255, 42, 42, 0.8), inset 0 0 10px rgba(255,255,255,0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      zIndex: 2,
                    }}
                  >
                    <Flame size={32} color="#ffffff" />
                  </div>
                  <div
                    className="mt-2 px-3 py-1 rounded-pill position-relative"
                    style={{
                      background: 'rgba(13, 17, 23, 0.94)',
                      border: '1px solid rgba(255, 42, 42, 0.5)',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                      zIndex: 2,
                    }}
                  >
                    CLOUD CORE OS
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE LIVE ROI & REVENUE CALCULATOR
          ========================================================================= */}
      <section className="xtreme-section border-top border-dark reveal-on-scroll" id="calculator">
        <div className="section-title-wrap">
          <p className="section-tag">BUSINESS IMPACT & ROI</p>
          <h2 className="section-heading-huge">CALCULATE YOUR UNCOLLECTED REVENUE RECOVERY</h2>
          <p className="section-subtext">
            See how automating WhatsApp renewal links & biometric gate lockouts directly adds thousands to your bottom line.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="roi-calculator-card reveal-on-scroll">
              <div className="row g-4 align-items-center">
                {/* Sliders Input */}
                <div className="col-12 col-lg-6">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="fw-bold text-white fs-6">Active Gym Members</label>
                      <span className="badge badge-red">{calcMembers} Members</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="25"
                      value={calcMembers}
                      onChange={(e) => setCalcMembers(Number(e.target.value))}
                      className="roi-slider"
                    />
                    <div className="d-flex justify-content-between text-muted fs-7 mt-1">
                      <span>50 Members</span>
                      <span>1,500+ Members</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="fw-bold text-white fs-6">Average Monthly Fee / Member</label>
                      <span className="badge badge-red">${calcFee} / mo</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="5"
                      value={calcFee}
                      onChange={(e) => setCalcFee(Number(e.target.value))}
                      className="roi-slider"
                    />
                    <div className="d-flex justify-content-between text-muted fs-7 mt-1">
                      <span>$15/mo</span>
                      <span>$180/mo</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-dark border border-secondary text-silver fs-7">
                    💡 <strong>Pro Insight:</strong> Automating WhatsApp payment reminders & locking turnstiles upon expiration recovers an average of <strong>14% to 18%</strong> in uncollected membership dues.
                  </div>
                </div>

                {/* Calculation Outputs */}
                <div className="col-12 col-lg-6">
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="roi-metric-box" style={{ borderColor: 'rgba(255,42,42,0.4)', background: 'rgba(255,42,42,0.06)' }}>
                        <div className="text-muted fs-7 text-uppercase fw-bold mb-1">Monthly Gross Subscription Pool</div>
                        <div className="fs-2 fw-bold font-hero text-white">
                          ${estimatedMonthlyRevenue.toLocaleString()}
                          <span className="fs-7 text-muted font-main"> / month</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="roi-metric-box">
                        <div className="text-muted fs-7 text-uppercase fw-bold mb-1">Prevented Leakage</div>
                        <div className="fs-4 fw-bold font-hero text-red">
                          +${estimatedRecoveredRevenue.toLocaleString()}
                        </div>
                        <div className="text-muted fs-7">Estimated recovery / mo</div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="roi-metric-box">
                        <div className="text-muted fs-7 text-uppercase fw-bold mb-1">Admin Time Saved</div>
                        <div className="fs-4 fw-bold font-hero text-white">
                          {estimatedHoursSaved} hrs
                        </div>
                        <div className="text-muted fs-7">Desk hours saved / mo</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <a href="#contact" className="btn-red w-100 py-2">
                      <span>Book Free 1-on-1 Platform Walkthrough</span>
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TRANSPARENT PRICING PLANS
          ========================================================================= */}
      <section className="xtreme-section border-top border-dark reveal-on-scroll" id="pricing">
        <div className="section-title-wrap">
          <p className="section-tag">TRANSPARENT & SCALABLE TIERS</p>
          <h2 className="section-heading-huge">PRICING PACKAGES BUILT FOR REAL GYM ROI</h2>
          <p className="section-subtext">
            No long-term lock-in. No hidden per-gate licensing fees. Start with a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
            <button
              type="button"
              className={`btn btn-sm ${pricingCycle === 'monthly' ? 'btn-red' : 'btn-dark text-silver'}`}
              style={{ borderRadius: '30px', padding: '7px 20px', fontWeight: '600' }}
              onClick={() => setPricingCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`btn btn-sm position-relative ${pricingCycle === 'yearly' ? 'btn-red' : 'btn-dark text-silver'}`}
              style={{ borderRadius: '30px', padding: '7px 20px', fontWeight: '600' }}
              onClick={() => setPricingCycle('yearly')}
            >
              Annual Billing
              <span
                className="badge ms-2"
                style={{
                  background: '#22c55e',
                  color: '#000',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                }}
              >
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        <div className="row g-4 justify-content-center mt-2">
          {((dynamicPlans && dynamicPlans.length > 0)
            ? dynamicPlans
            : [
                {
                  id: 'starter',
                  _id: 'starter',
                  name: 'Starter Gym',
                  tagline: 'SINGLE BOUTIQUE CLUB',
                  description: 'Ideal for standalone fitness studios, iron gyms, and single-owner clubs.',
                  price: 49,
                  yearlyPrice: 39,
                  maxBranches: 1,
                  maxMembers: 300,
                  features: [
                    'WhatsApp Automated Billing & Reminders',
                    'Branded Member Digital Pass Web App',
                    'POS Invoicing & GST Tax Management',
                    'Trainer & Staff Attendance Logs',
                    'Standard Email & Chat Support',
                  ],
                  isPopular: false,
                },
                {
                  id: 'growth-pro',
                  _id: 'growth-pro',
                  name: 'Growth Pro',
                  tagline: 'MULTI-BRANCH & HARDWARE',
                  description: 'For growing fitness brands requiring automated turnstile gates & multi-branch roaming.',
                  price: 99,
                  yearlyPrice: 79,
                  maxBranches: 5,
                  maxMembers: 1500,
                  features: [
                    'Everything in Starter, plus:',
                    'Biometric & RFID Turnstile Gate Sync',
                    'Automated Overdue Gate Lockout System',
                    'Trainer PT Session Commission Calculator',
                    'Multi-Branch Consolidated P&L Analytics',
                    'Priority 24/7 WhatsApp & Phone Support',
                  ],
                  isPopular: true,
                },
                {
                  id: 'enterprise',
                  _id: 'enterprise',
                  name: 'Enterprise',
                  tagline: 'FRANCHISE & CHAINS',
                  description: 'For multi-city gym chains, franchises, and fitness centers with custom requirements.',
                  price: 199,
                  yearlyPrice: 159,
                  maxBranches: 999,
                  maxMembers: 999999,
                  features: [
                    'Everything in Growth Pro, plus:',
                    'Unlimited Turnstile & Facial Recognition Sync',
                    'Custom White-Label Domain & Branding',
                    'Dedicated Platform Success Manager',
                    'Custom Hardware API & ERP Webhooks',
                    '99.99% Guaranteed Cloud SLA Agreement',
                  ],
                  isPopular: false,
                },
              ]
          ).map((plan, idx) => {
            const isFeatured =
              plan.isPopular ||
              plan.isFeatured ||
              idx === 1 ||
              plan.name?.toLowerCase().includes('growth') ||
              plan.name?.toLowerCase().includes('pro') ||
              plan.name?.toLowerCase().includes('premium');
            const planMonthlyPrice = Number(plan.price) || 49;
            const isLongDuration = (plan.durationDays && plan.durationDays >= 365) || plan.type === 'ANNUAL';
            const calculatedYearly = plan.yearlyPrice || (isLongDuration ? planMonthlyPrice : Math.round(planMonthlyPrice * 0.8));
            const currentDisplayPrice = pricingCycle === 'monthly' ? planMonthlyPrice : calculatedYearly;

            const durationSuffix = plan.durationDays
              ? plan.durationDays === 30
                ? '/30 Days'
                : plan.durationDays === 365
                ? '/year'
                : `/${plan.durationDays} Days`
              : '/month';

            const branchesText =
              plan.maxBranches !== undefined && plan.maxBranches !== null
                ? plan.maxBranches >= 50
                  ? 'Unlimited Branches'
                  : `${plan.maxBranches} Gym Location${plan.maxBranches > 1 ? 's' : ''}`
                : plan.durationDays
                ? `${plan.durationDays} Days Validity`
                : 'All Branches Access';

            const membersText =
              plan.maxMembers !== undefined && plan.maxMembers !== null
                ? plan.maxMembers >= 10000
                  ? 'Unlimited Members'
                  : `Up to ${Number(plan.maxMembers).toLocaleString()} Members`
                : 'Turnstile RFID Sync';

            const featuresList = Array.isArray(plan.features)
              ? plan.features
              : typeof plan.features === 'string'
              ? plan.features.split(',').map((f) => f.trim()).filter(Boolean)
              : ['Standard Gym Floor Access', 'Locker Access', 'Member App'];

            return (
              <div
                key={plan._id || plan.id || idx}
                className={`col-12 col-md-6 col-lg-4 reveal-on-scroll stagger-${(idx % 3) + 1}`}
              >
                <div
                  className={`plan-card h-100 d-flex flex-column justify-content-between position-relative ${
                    isFeatured ? 'featured' : ''
                  }`}
                >
                  {isFeatured && (
                    <span
                      className="badge position-absolute top-0 end-0 m-3 px-3 py-1"
                      style={{
                        background: 'linear-gradient(135deg, #ff2a2a 0%, #b80000 100%)',
                        color: '#fff',
                        fontWeight: '800',
                        letterSpacing: '0.06em',
                        borderRadius: '20px',
                        boxShadow: '0 0 14px rgba(255,42,42,0.6)',
                      }}
                    >
                      🔥 MOST POPULAR
                    </span>
                  )}

                  <div>
                    <span className="plan-badge">
                      {plan.tagline ||
                        (plan.type
                          ? `${plan.type} TIER`
                          : isFeatured
                          ? 'MULTI-BRANCH & HARDWARE'
                          : idx === 0
                          ? 'SINGLE BOUTIQUE CLUB'
                          : 'FRANCHISE & CHAINS')}
                    </span>
                    <h3 className="font-display fs-4 m-0 mt-1">{plan.name}</h3>
                    <p className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                      {plan.description || 'Comprehensive all-in-one gym management package.'}
                    </p>

                    <div className={`plan-price my-3 ${isFeatured ? 'text-red' : ''}`}>
                      ${currentDisplayPrice}
                      <span className={isFeatured ? 'text-silver' : ''}>
                        {durationSuffix} {pricingCycle === 'yearly' && !plan.durationDays && '(billed annually)'}
                      </span>
                    </div>

                    <div
                      className="p-2 mb-3 rounded bg-dark border text-silver small"
                      style={{
                        borderColor: isFeatured ? 'rgba(255,42,42,0.4)' : 'rgba(255,255,255,0.1)',
                        background: isFeatured ? 'rgba(255,42,42,0.08)' : '#10141d',
                      }}
                    >
                      📍 <strong>{branchesText}</strong> • <strong>{membersText}</strong>
                    </div>

                    <ul className="plan-features">
                      {featuresList.map((feature, fIdx) => {
                        const isPlusHeader =
                          typeof feature === 'string' &&
                          feature.toLowerCase().includes('everything in');
                        return (
                          <li
                            key={fIdx}
                            className={`d-flex align-items-center gap-2 ${
                              isPlusHeader ? 'fw-semibold text-white' : ''
                            }`}
                          >
                            {isPlusHeader ? (
                              <Sparkles size={15} color="#ff2a2a" />
                            ) : (
                              <CheckCircle2 size={15} color="#ff2a2a" />
                            )}
                            <span>{feature}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className={`${
                        isFeatured ? 'btn-red' : 'btn-outline-red'
                      } w-100 d-flex align-items-center justify-content-center gap-2`}
                      onClick={() =>
                        handleSelectPlan({
                          id: plan._id || plan.id,
                          planName: plan.name,
                          monthlyPrice: planMonthlyPrice,
                          yearlyPrice: calculatedYearly,
                          price: currentDisplayPrice,
                          billingCycle: pricingCycle.toUpperCase(),
                          maxBranches: plan.maxBranches || 1,
                          maxMembers: plan.maxMembers || 300,
                        })
                      }
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="row justify-content-center mt-4">
          <div className="col-12 col-lg-9">
            <div className="d-flex flex-wrap align-items-center justify-content-around p-3 rounded-pill bg-dark border border-dark text-center text-muted fs-7 gap-2">
              <span className="d-flex align-items-center gap-1 text-silver">
                <CheckCircle2 size={14} color="#22c55e" /> 14-Day Full Free Access
              </span>
              <span className="d-flex align-items-center gap-1 text-silver">
                <CheckCircle2 size={14} color="#22c55e" /> No Credit Card Required
              </span>
              <span className="d-flex align-items-center gap-1 text-silver">
                <CheckCircle2 size={14} color="#22c55e" /> Plug-and-Play Hardware Setup
              </span>
              <span className="d-flex align-items-center gap-1 text-silver">
                <CheckCircle2 size={14} color="#22c55e" /> Cancel Anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TESTIMONIALS / GYM OWNERS SUCCESS
          ========================================================================= */}
      <section className="xtreme-section border-top border-dark reveal-on-scroll">
        <div className="section-title-wrap">
          <p className="section-tag">PROVEN BY GYM LEADERS</p>
          <h2 className="section-heading-huge">WHY GYM OWNERS LOVE OUR SAAS</h2>
          <p className="section-subtext">Hear from fitness clubs scaling their multi-branch operations effortlessly.</p>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-4 reveal-on-scroll stagger-1">
            <div className="testimonial-card">
              <div>
                <div className="d-flex text-warning mb-2 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="text-silver fs-6" style={{ lineHeight: 1.55 }}>
                  "We expanded from 2 to 7 gym branches across the state in under 18 months. The centralized billing and RFID gate sync eliminated all front-desk leakages."
                </p>
              </div>
              <div className="pt-2 border-top border-dark mt-3">
                <div className="fw-bold text-white fs-6">Vikramaditya S.</div>
                <div className="text-red fs-7">Founder, Apex Iron Club (7 Branches)</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4 reveal-on-scroll stagger-2">
            <div className="testimonial-card">
              <div>
                <div className="d-flex text-warning mb-2 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="text-silver fs-6" style={{ lineHeight: 1.55 }}>
                  "The automated WhatsApp renewal notifications alone recovered over $4,000 in overdue fees in the very first month. Trainer commission tracking is flawless."
                </p>
              </div>
              <div className="pt-2 border-top border-dark mt-3">
                <div className="fw-bold text-white fs-6">Sarah Jenkins</div>
                <div className="text-red fs-7">Managing Director, Pulse Fitness HQ</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4 reveal-on-scroll stagger-3">
            <div className="testimonial-card">
              <div>
                <div className="d-flex text-warning mb-2 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="text-silver fs-6" style={{ lineHeight: 1.55 }}>
                  "The cleanest dark gym UI on the market. Our staff needed zero training to master the POS and member admission flows. Exceptional uptime and speed."
                </p>
              </div>
              <div className="pt-2 border-top border-dark mt-3">
                <div className="fw-bold text-white fs-6">Rohan Mehra</div>
                <div className="text-red fs-7">Co-Founder, Titan Strength Studios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE FAQ ACCORDION
          ========================================================================= */}
      <section className="xtreme-section border-top border-dark reveal-on-scroll" id="faq">
        <div className="section-title-wrap">
          <p className="section-tag">GOT QUESTIONS?</p>
          <h2 className="section-heading-huge">FREQUENTLY ASKED QUESTIONS</h2>
          <p className="section-subtext">Everything you need to know about our fitness SaaS software & onboarding.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-interactive-card ${isOpen ? 'open' : ''} reveal-on-scroll stagger-${(idx % 4) + 1}`}>
                  <button
                    type="button"
                    className="faq-header-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  >
                    <span className="d-flex align-items-center gap-2">
                      <HelpCircle size={16} className="text-red" />
                      {item.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className="text-silver"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="faq-body-content">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTACT & LIVE DEMO BOOKING FORM
          ========================================================================= */}
      <section className="xtreme-section border-top border-dark reveal-on-scroll" id="contact">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-6 reveal-on-scroll">
            <span className="badge badge-red mb-2">BOOK A 1-ON-1 DEMO</span>
            <h2 className="font-hero fs-1 text-uppercase m-0 mb-3">
              READY TO SCALE YOUR FITNESS EMPIRE?
            </h2>
            <p className="text-muted fs-6 mb-3">
              Schedule a live demonstration of RFID gates, multi-branch accounts, and automated subscription engines tailored to your gym size.
            </p>

            <div className="d-flex flex-column gap-2 text-silver">
              <div className="d-flex align-items-center gap-3">
                <div className="feature-icon-badge m-0" style={{ width: '38px', height: '38px' }}>
                  <Building2 size={18} />
                </div>
                <div className="fs-7">
                  <strong>Headquarters:</strong> {settings?.address || 'Silicon Valley Tech Park, Bangalore, India'}
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="feature-icon-badge m-0" style={{ width: '38px', height: '38px' }}>
                  <Activity size={18} />
                </div>
                <div className="fs-7">
                  <strong>Support Email:</strong> {settings?.supportEmail || 'support@xtremefitness.com'}
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="feature-icon-badge m-0" style={{ width: '38px', height: '38px' }}>
                  <Shield size={18} />
                </div>
                <div className="fs-7">
                  <strong>Security Guarantee:</strong> 99.98% SLA Uptime & Daily Encrypted Cloud Backups
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 reveal-on-scroll stagger-2">
            <div className="content-card p-3 p-md-4 rounded-4" style={{ border: '1px solid rgba(255, 42, 42, 0.4)', background: 'rgba(18, 24, 36, 0.9)' }}>
              <h3 className="font-display fs-4 mb-1">Request Live Guided Demo</h3>
              <p className="text-muted fs-7 mb-3">Our gym enterprise specialists will set up a sandbox test account for your club.</p>

              <form onSubmit={handleInquirySubmit}>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      className="input-athletic"
                      placeholder="Your Full Name *"
                      value={inquiryData.name}
                      onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="email"
                      className="input-athletic"
                      placeholder="Work Email *"
                      value={inquiryData.email}
                      onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      className="input-athletic"
                      placeholder="Phone / WhatsApp Number"
                      value={inquiryData.phone}
                      onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="text"
                      className="input-athletic"
                      placeholder="Gym Brand / Franchise Name"
                      value={inquiryData.company}
                      onChange={(e) => setInquiryData({ ...inquiryData, company: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <textarea
                      className="input-athletic"
                      rows={2}
                      placeholder="Number of branches, hardware gate requirements, etc. *"
                      value={inquiryData.message}
                      onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn-red w-100 py-2"
                      disabled={submittingInquiry}
                    >
                      {submittingInquiry ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                      <span>Submit Demo Request</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LANDING FOOTER
          ========================================================================= */}
      <footer className="landing-footer py-4" style={{ backgroundColor: '#05070a', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container text-center">
          <div className="d-flex justify-content-center mb-2">
            <DynamicLogo size="small" subtitle="GYM SAAS PLATFORM" />
          </div>
          <p className="text-muted m-0 fs-7">
            {settings?.footerText || '© 2026 XTREME FITNESS SaaS Platform. All Rights Reserved.'}
          </p>
          <div className="mt-2 d-flex justify-content-center gap-3">
            <Link to="/admin/login" className="text-muted fs-7 text-decoration-none hover-white">
              Super Admin Portal
            </Link>
            <span className="text-muted">•</span>
            <Link to="/login" className="text-muted fs-7 text-decoration-none hover-white">
              Gym Owner Login
            </Link>
            <span className="text-muted">•</span>
            <Link to="/register" className="text-muted fs-7 text-decoration-none hover-white">
              Create Free Account
            </Link>
          </div>
        </div>
      </footer>

      {/* Auth Modals for Sign In & Book Free Demo */}
      <AuthLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLogin}
        onSwitchToRegister={() => {
          handleCloseLogin();
          setIsRegisterModalOpen(true);
        }}
      />

      <AuthRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegister}
        onSwitchToLogin={() => {
          handleCloseRegister();
          setIsLoginModalOpen(true);
        }}
        preselectedPlan={selectedTrialPlan}
      />
    </div>
  );
};

export default Landing;
