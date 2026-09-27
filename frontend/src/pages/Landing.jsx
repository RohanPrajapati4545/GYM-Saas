import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Dumbbell,
  ArrowRight,
  Play,
  Shield,
  Building2,
  Activity,
  Flame,
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="xtreme-landing">
      {/* Top Navbar */}
      <header className="xtreme-navbar">
        <Link to="/" className="xtreme-logo">
          <div className="logo-symbol">
            <Dumbbell size={24} />
          </div>
          <div className="logo-text-block">
            <span className="logo-title">XTREME FITNESS</span>
            <span className="logo-subtitle">SaaS GYM PLATFORM</span>
          </div>
        </Link>

        <nav className="xtreme-nav-links">
          <a href="#home" className="active">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
          <a href="#features">Pages</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="xtreme-nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-red">
              <span>Dashboard ({user?.name?.split(' ')[0] || 'Owner'})</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-outline-red">
                Sign In
              </Link>
              <Link to="/register" className="btn-red">
                <span>Join Us Now</span>
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="xtreme-hero" id="home">
        {/* Left Vertical Social Links */}
        <div className="hero-social-sidebar">
          <a href="#facebook" className="social-icon-link" title="Facebook">f</a>
          <a href="#twitter" className="social-icon-link" title="Twitter">t</a>
          <a href="#google" className="social-icon-link" title="Google+">G+</a>
          <a href="#instagram" className="social-icon-link" title="Instagram">in</a>
          <div className="social-divider"></div>
        </div>

        {/* Main Hero Content */}
        <div className="hero-content-wrapper">
          <div className="hero-left-text">
            <span className="hero-brand-tag">XTREME FITNESS</span>
            <h1 className="hero-headline-massive">
              BE <span className="text-gradient-red">STRONG</span>
            </h1>
            <p className="hero-subheadline">
              Best GYM & Fitness Center Build Your Health. Next-gen multi-branch management for Gym Owners.
            </p>

            <div className="hero-actions-row">
              <Link to="/register" className="btn-red">
                <span>Join Us Now</span>
                <ArrowRight size={18} />
              </Link>

              <div className="hero-play-action" onClick={() => window.open('https://youtube.com', '_blank')}>
                <button className="btn-circle-play" aria-label="Play tour video">
                  <Play size={20} fill="#ffffff" />
                </button>
                <span className="play-text">Watch Video</span>
              </div>
            </div>
          </div>

          {/* Center / Right Hero Athlete Visual */}
          <div className="hero-right-visual">
            <div className="athlete-stage">
              <div className="athlete-glow-backdrop"></div>
              <img
                src="/hero-athlete.png"
                alt="XTREME Fitness Athlete Overhead Barbell Squat"
                className="athlete-img"
              />
            </div>
          </div>
        </div>

        {/* Hero Slider Dashes */}
        <div className="hero-slider-dashes">
          <span className="dash-item active"></span>
          <span className="dash-item"></span>
          <span className="dash-item"></span>
          <span className="dash-item"></span>
        </div>
      </section>

      {/* Features & SaaS Grid */}
      <section className="xtreme-section" id="services">
        <div className="section-title-wrap">
          <p className="section-tag">UNLEASH POWER</p>
          <h2 className="section-heading-huge">POWERFUL CAPABILITIES FOR YOUR GYM</h2>
        </div>

        <div className="xtreme-features-grid">
          <div className="xtreme-feature-card">
            <div className="feature-icon-badge">
              <Building2 size={28} />
            </div>
            <h3 className="feature-title">Multi-Branch Facilities</h3>
            <p className="feature-desc">
              Manage unlimited gym branches under one master franchise roof. Track capacity, room equipment, and manager rosters.
            </p>
          </div>

          <div className="xtreme-feature-card">
            <div className="feature-icon-badge">
              <Flame size={28} />
            </div>
            <h3 className="feature-title">Athletic Memberships</h3>
            <p className="feature-desc">
              Offer customized pass tiers, automated recurring subscription billings, day passes, and personal trainer add-ons.
            </p>
          </div>

          <div className="xtreme-feature-card">
            <div className="feature-icon-badge">
              <Activity size={28} />
            </div>
            <h3 className="feature-title">RFID & Biometric Gates</h3>
            <p className="feature-desc">
              Sub-second gate turnstile verification, IoT attendance telemetry, and live facility headcounts in real-time.
            </p>
          </div>

          <div className="xtreme-feature-card">
            <div className="feature-icon-badge">
              <Shield size={28} />
            </div>
            <h3 className="feature-title">Role-Based Security</h3>
            <p className="feature-desc">
              Dedicated GYM_OWNER administration with microservices JWT isolation ensuring ironclad tenant data security.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
