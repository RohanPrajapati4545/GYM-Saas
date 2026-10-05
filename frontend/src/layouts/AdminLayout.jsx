import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAdminAuth } from '../store/slices/adminAuthSlice';
import DynamicLogo from '../components/DynamicLogo';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Users,
  CreditCard,
  MessageSquare,
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Search,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.adminAuth);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to end your Super Admin session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      cancelButtonColor: '#1e2433',
      confirmButtonText: 'Yes, Sign Out',
      background: '#10141d',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearAdminAuth());
        navigate('/admin/login', { replace: true });
      }
    });
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/gyms', label: 'Gyms', icon: Building2 },
    { to: '/admin/branches', label: 'Branches', icon: GitBranch },
    { to: '/admin/users', label: 'Platform Users', icon: Users },
    { to: '/admin/plans', label: 'Plans & Pricing', icon: CreditCard },
    { to: '/admin/inquiries', label: 'Inquiries & CRM', icon: MessageSquare },
    { to: '/admin/cms/landing', label: 'Landing Page CMS', icon: Globe },
    { to: '/admin/settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="d-flex vh-100 overflow-hidden" style={{ backgroundColor: '#08090d', color: '#ffffff' }}>
      <aside className="d-none d-lg-flex flex-column border-end flex-shrink-0 h-100" style={{ width: '270px', backgroundColor: '#0c0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <DynamicLogo size="medium" subtitle="SUPER ADMIN PORTAL" />
        </div>

        <div className="p-3 border-bottom d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(255,42,42,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="rounded d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '38px', height: '38px', backgroundColor: '#ff2a2a' }}>
            SA
          </div>
          <div className="overflow-hidden">
            <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{admin?.name || 'Super Admin'}</div>
            <div className="badge badge-owner" style={{ fontSize: '0.65rem' }}>PLATFORM ROOT</div>
          </div>
        </div>

        <nav className="p-2 flex-grow-1 overflow-auto d-flex flex-column gap-1">
          <div className="px-3 pt-2 pb-1 text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
            PLATFORM MANAGEMENT
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none fw-semibold transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-secondary hover-white'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(255,42,42,0.18)' : 'transparent',
                  borderLeft: isActive ? '3px solid #ff2a2a' : '3px solid transparent',
                  fontSize: '0.92rem',
                })}
              >
                <Icon size={18} color="#ff2a2a" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-danger fw-bold" style={{ backgroundColor: 'rgba(255,42,42,0.1)', border: '1px solid rgba(255,42,42,0.3)', borderRadius: '6px' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {mobileDrawerOpen && (
        <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100 z-3" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={() => setMobileDrawerOpen(false)}>
          <div className="position-absolute top-0 start-0 h-100 d-flex flex-column" style={{ width: '280px', backgroundColor: '#0c0e14' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <DynamicLogo size="small" subtitle="SUPER ADMIN" />
              <button className="btn text-white p-1" onClick={() => setMobileDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="p-2 flex-grow-1 overflow-auto d-flex flex-column gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none fw-semibold ${
                        isActive ? 'text-white bg-danger bg-opacity-25' : 'text-secondary'
                      }`
                    }
                  >
                    <Icon size={18} color="#ff2a2a" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <header className="p-3 border-bottom d-flex align-items-center justify-content-between flex-shrink-0" style={{ backgroundColor: '#0c0e14', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="d-flex align-items-center gap-2">
            <button className="btn text-white d-lg-none p-1" onClick={() => setMobileDrawerOpen(true)}>
              <Menu size={22} />
            </button>
            <span className="badge badge-red d-none d-sm-inline-flex">
              <ShieldCheck size={14} /> SUPER ADMIN ENVIRONMENT
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 px-3 py-1 rounded" style={{ backgroundColor: '#151a26', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '28px', height: '28px', backgroundColor: '#ff2a2a', fontSize: '0.75rem' }}>
                {admin?.name ? admin.name[0].toUpperCase() : 'A'}
              </div>
              <div className="d-none d-md-flex flex-column text-start">
                <span className="fw-bold text-white" style={{ fontSize: '0.82rem', lineHeight: 1.2 }}>{admin?.name || 'Administrator'}</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{admin?.email || 'admin@gymsaas.com'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 p-md-4 flex-grow-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
