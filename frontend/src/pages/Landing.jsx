import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Dumbbell,
  ArrowRight,
  Shield,
  Users,
  Activity,
  Building2,
  Sparkles,
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="landing-layout">
      {/* Navigation */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="brand-logo-badge">
            <Dumbbell size={24} className="brand-icon" />
          </div>
          <span className="landing-brand-title">IronPulse SaaS</span>
        </div>

        <div className="landing-nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">
              <span>Go to Dashboard ({user?.name || 'Owner'})</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <div className="auth-btn-group">
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                <span>Start Free Trial</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={16} className="text-amber" />
          <span>Next-Generation Multi-Tenant Gym Architecture</span>
        </div>
        <h1 className="hero-title">
          Scale Your Fitness Empire with <span className="text-gradient">Intelligent SaaS</span>
        </h1>
        <p className="hero-description">
          The all-in-one platform built specifically for Gym Owners, Franchise Chains, and Fitness Studios.
          Manage multi-location branches, memberships, trainers, payments, and real-time attendance effortlessly.
        </p>

        <div className="hero-cta-group">
          <Link to="/register" className="btn-primary hero-btn">
            <span>Register Gym Owner Account</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary hero-btn">
            <span>Access Existing Facility</span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <div className="section-header-centered">
          <h2 className="section-title">Built for Performance & Scale</h2>
          <p className="section-subtitle">Everything a Gym Owner needs in a single unified dashboard</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon cyan">
              <Building2 size={24} />
            </div>
            <h3>Multi-Branch Control</h3>
            <p>Centrally administer multiple locations, staff permissions, and room capacities with tenant isolation.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon emerald">
              <Users size={24} />
            </div>
            <h3>Member Subscriptions</h3>
            <p>Automate recurring billing, freeze passes, and manage custom plans with integrated Stripe auto-pay.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon amber">
              <Activity size={24} />
            </div>
            <h3>Real-Time IoT Attendance</h3>
            <p>Connect turnstiles, biometric scanners, and RFID readers with millisecond verification telemetry.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <Shield size={24} />
            </div>
            <h3>Role-Based Security</h3>
            <p>JWT protected RBAC with microservices authentication ensuring zero privilege leaks across tenants.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 IronPulse SaaS Platform. Built with Redux Toolkit & Express Microservices.</p>
      </footer>
    </div>
  );
};

export default Landing;
