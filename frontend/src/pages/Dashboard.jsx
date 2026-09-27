import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../store/slices/authSlice';
import {
  Dumbbell,
  LayoutDashboard,
  GitBranch,
  Users,
  CreditCard,
  UserCheck,
  CalendarCheck2,
  Target,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Bell,
  Search,
  PlusCircle,
  TrendingUp,
  Activity,
  Award,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleLogout = () => {
    // 1. Remove JWT from localStorage
    localStorage.removeItem('token');
    // 2. Dispatch clearAuth()
    dispatch(clearAuth());
    // 3. Redirect to landing page
    navigate('/', { replace: true });
  };

  // Role-based navigation definition for GYM_OWNER
  const ownerMenuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Branches', label: 'Branches', icon: GitBranch },
    { id: 'Members', label: 'Members', icon: Users },
    { id: 'Memberships', label: 'Memberships', icon: CreditCard },
    { id: 'Trainers', label: 'Trainers', icon: UserCheck },
    { id: 'Attendance', label: 'Attendance', icon: CalendarCheck2 },
    { id: 'Leads & CRM', label: 'Leads & CRM', icon: Target },
    { id: 'Payments', label: 'Payments', icon: Receipt },
    { id: 'Reports', label: 'Reports', icon: BarChart3 },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  // Dynamic content renderer based on role and active tab
  const renderTabContent = () => {
    if (user?.role !== 'GYM_OWNER') {
      return (
        <div className="empty-state-card">
          <Shield size={48} className="empty-icon" />
          <h3>Role: {user?.role || 'Guest'}</h3>
          <p>Specific interface for {user?.role} will be available in future releases.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Dashboard':
        return (
          <div className="tab-pane-fade">
            {/* KPI Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Active Members</span>
                  <div className="stat-icon-wrapper red">
                    <Users size={20} />
                  </div>
                </div>
                <div className="stat-value">1,428</div>
                <div className="stat-trend positive">
                  <TrendingUp size={14} />
                  <span>+12.4% vs last month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Monthly Revenue</span>
                  <div className="stat-icon-wrapper emerald">
                    <Receipt size={20} />
                  </div>
                </div>
                <div className="stat-value">$48,920</div>
                <div className="stat-trend positive">
                  <TrendingUp size={14} />
                  <span>+8.2% vs target</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Today's Check-ins</span>
                  <div className="stat-icon-wrapper amber">
                    <Activity size={20} />
                  </div>
                </div>
                <div className="stat-value">384</div>
                <div className="stat-trend positive">
                  <Clock size={14} />
                  <span>Peak hours: 5PM - 8PM</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-title">Lead Conversion</span>
                  <div className="stat-icon-wrapper purple">
                    <Target size={20} />
                  </div>
                </div>
                <div className="stat-value">64.8%</div>
                <div className="stat-trend positive">
                  <Award size={14} />
                  <span>42 new trials this week</span>
                </div>
              </div>
            </div>

            {/* Main Action Modules Grid */}
            <div className="dashboard-sections-grid">
              {/* Recent Activity */}
              <div className="content-card">
                <div className="card-header-clean">
                  <div>
                    <h3 className="card-title">Live Facility Feed</h3>
                    <p className="card-subtitle">Real-time member check-ins and renewals</p>
                  </div>
                  <button className="btn-secondary-sm" onClick={() => setActiveTab('Attendance')}>
                    View All
                  </button>
                </div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="avatar-circle">JD</div>
                    <div className="activity-info">
                      <p className="activity-title"><strong>John Doe</strong> checked in at Downtown Branch</p>
                      <span className="activity-time">3 minutes ago • RFID Scanner #2</span>
                    </div>
                    <span className="badge badge-success">Valid Pass</span>
                  </div>
                  <div className="activity-item">
                    <div className="avatar-circle bg-purple">SK</div>
                    <div className="activity-info">
                      <p className="activity-title"><strong>Sarah Khan</strong> upgraded to Annual VIP Plan</p>
                      <span className="activity-time">24 minutes ago • Stripe Auto-Pay</span>
                    </div>
                    <span className="badge badge-primary">$899.00</span>
                  </div>
                  <div className="activity-item">
                    <div className="avatar-circle bg-amber">MR</div>
                    <div className="activity-info">
                      <p className="activity-title"><strong>Marcus Rivera</strong> booked PT with Coach Alex</p>
                      <span className="activity-time">1 hour ago • High Intensity Cardio</span>
                    </div>
                    <span className="badge badge-info">PT Session</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & System Info */}
              <div className="content-card">
                <div className="card-header-clean">
                  <div>
                    <h3 className="card-title">Account & Tenant Info</h3>
                    <p className="card-subtitle">Authenticated session details</p>
                  </div>
                  <span className="badge badge-owner">GYM_OWNER</span>
                </div>

                <div className="info-grid-list">
                  <div className="info-item">
                    <span className="info-label">User ID</span>
                    <span className="info-code">{user?.id || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Email</span>
                    <span className="info-value">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tenant ID</span>
                    <span className="info-code">{user?.tenantId || 'Single-Tenant (Master)'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Branch Scope</span>
                    <span className="info-value">{user?.branchId ? user.branchId : 'All Branches (Owner Scope)'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Role Permissions</span>
                    <span className="info-value text-emerald">Full Multi-Branch Administration</span>
                  </div>
                </div>

                <div className="quick-action-buttons">
                  <button className="btn-primary-sm" onClick={() => setActiveTab('Members')}>
                    <PlusCircle size={16} /> Add Member
                  </button>
                  <button className="btn-secondary-sm" onClick={() => setActiveTab('Branches')}>
                    <GitBranch size={16} /> Manage Branches
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Branches':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Gym Branches</h3>
                  <p className="card-subtitle">Manage multi-location facilities and equipment</p>
                </div>
                <button className="btn-primary-sm"><PlusCircle size={16} /> New Branch</button>
              </div>
              <div className="data-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Branch Name</th>
                      <th>Location</th>
                      <th>Manager</th>
                      <th>Active Members</th>
                      <th>Capacity Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Central Metro Gym</strong></td>
                      <td>Downtown Tower 4</td>
                      <td>Alex Mercer</td>
                      <td>720</td>
                      <td><span className="badge badge-success">72% Optimal</span></td>
                    </tr>
                    <tr>
                      <td><strong>Westside Elite Club</strong></td>
                      <td>West Valley Boulevard</td>
                      <td>Emma Watson</td>
                      <td>510</td>
                      <td><span className="badge badge-info">51% Open</span></td>
                    </tr>
                    <tr>
                      <td><strong>North Hills Fitness</strong></td>
                      <td>Northgate Avenue</td>
                      <td>David Beckham</td>
                      <td>198</td>
                      <td><span className="badge badge-primary">Expanding</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Members':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Gym Members Directory</h3>
                  <p className="card-subtitle">Manage member profiles, lock status, and medical forms</p>
                </div>
                <button className="btn-primary-sm"><PlusCircle size={16} /> Register Member</button>
              </div>
              <div className="data-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Plan</th>
                      <th>Assigned Branch</th>
                      <th>Status</th>
                      <th>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>John Doe</strong><br/><small className="text-muted">john@example.com</small></td>
                      <td>Gold 12-Month</td>
                      <td>Central Metro</td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>Dec 2026</td>
                    </tr>
                    <tr>
                      <td><strong>Elena Rostova</strong><br/><small className="text-muted">elena@example.com</small></td>
                      <td>Platinum VIP</td>
                      <td>Westside Elite</td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>Aug 2027</td>
                    </tr>
                    <tr>
                      <td><strong>Carlos Mendez</strong><br/><small className="text-muted">carlos@example.com</small></td>
                      <td>Monthly Basic</td>
                      <td>Central Metro</td>
                      <td><span className="badge badge-warning">Expiring Soon</span></td>
                      <td>Oct 2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Memberships':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Membership Plans & Pricing</h3>
                  <p className="card-subtitle">Configure recurring packages, discounts, and access limits</p>
                </div>
                <button className="btn-primary-sm"><PlusCircle size={16} /> Create Plan</button>
              </div>
              <div className="plans-grid">
                <div className="plan-card">
                  <div className="plan-badge">Standard</div>
                  <h4>Basic Access</h4>
                  <div className="plan-price">$49<span>/month</span></div>
                  <ul className="plan-features">
                    <li>Single Branch Access</li>
                    <li>Gym Floor & Locker Rooms</li>
                    <li>Mobile App Entry</li>
                  </ul>
                  <button className="btn-secondary-sm full-width">Edit Plan</button>
                </div>
                <div className="plan-card featured">
                  <div className="plan-badge featured-badge">Popular</div>
                  <h4>Gold Multi-Branch</h4>
                  <div className="plan-price">$89<span>/month</span></div>
                  <ul className="plan-features">
                    <li>All 3 Gym Locations</li>
                    <li>Steam & Sauna Access</li>
                    <li>2 Guest Passes / month</li>
                    <li>1 Free PT Assessment</li>
                  </ul>
                  <button className="btn-primary-sm full-width">Edit Plan</button>
                </div>
                <div className="plan-card">
                  <div className="plan-badge">VIP</div>
                  <h4>Diamond Elite</h4>
                  <div className="plan-price">$149<span>/month</span></div>
                  <ul className="plan-features">
                    <li>24/7 VIP Access</li>
                    <li>Unlimited Group Classes</li>
                    <li>Weekly Personal Training</li>
                    <li>Nutritional Counseling</li>
                  </ul>
                  <button className="btn-secondary-sm full-width">Edit Plan</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Trainers':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Personal Trainers & Staff</h3>
                  <p className="card-subtitle">Roster, commissions, schedule allocations, and certifications</p>
                </div>
                <button className="btn-primary-sm"><PlusCircle size={16} /> Add Trainer</button>
              </div>
              <div className="data-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Trainer</th>
                      <th>Specialty</th>
                      <th>Active Clients</th>
                      <th>Rating</th>
                      <th>Branch</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Coach Alex Hunter</strong></td>
                      <td>Strength & Hypertrophy</td>
                      <td>24</td>
                      <td>⭐ 4.95</td>
                      <td>Central Metro</td>
                    </tr>
                    <tr>
                      <td><strong>Coach Maya Lin</strong></td>
                      <td>Functional Yoga & Pilates</td>
                      <td>31</td>
                      <td>⭐ 5.00</td>
                      <td>Westside Elite</td>
                    </tr>
                    <tr>
                      <td><strong>Coach Liam Vance</strong></td>
                      <td>CrossFit & HIIT</td>
                      <td>18</td>
                      <td>⭐ 4.88</td>
                      <td>North Hills</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Attendance':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Attendance & RFID Log</h3>
                  <p className="card-subtitle">Real-time gate and biometric telemetry</p>
                </div>
                <div className="btn-group">
                  <button className="btn-secondary-sm">Export CSV</button>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Member</th>
                      <th>Gate / Device</th>
                      <th>Branch</th>
                      <th>Access Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>20:30:14</td>
                      <td>Marcus Rivera</td>
                      <td>Turnstile Gate A</td>
                      <td>Central Metro</td>
                      <td><span className="badge badge-success"><CheckCircle size={12}/> Granted</span></td>
                    </tr>
                    <tr>
                      <td>20:28:45</td>
                      <td>Samantha Ray</td>
                      <td>RFID Door #1</td>
                      <td>Westside Elite</td>
                      <td><span className="badge badge-success"><CheckCircle size={12}/> Granted</span></td>
                    </tr>
                    <tr>
                      <td>20:15:10</td>
                      <td>Unregistered Tag</td>
                      <td>Back Gym Door</td>
                      <td>North Hills</td>
                      <td><span className="badge badge-danger"><AlertTriangle size={12}/> Denied</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Leads & CRM':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Leads Pipeline & CRM</h3>
                  <p className="card-subtitle">Convert trial visitors into long-term subscribers</p>
                </div>
                <button className="btn-primary-sm"><PlusCircle size={16} /> New Inquiry</button>
              </div>
              <div className="data-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Lead Name</th>
                      <th>Interest</th>
                      <th>Stage</th>
                      <th>Assigned Rep</th>
                      <th>Last Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Jessica Alba</strong></td>
                      <td>1-Day Free Trial</td>
                      <td><span className="badge badge-primary">Trial Completed</span></td>
                      <td>Staff Dave</td>
                      <td>Today</td>
                    </tr>
                    <tr>
                      <td><strong>Tom Hardy</strong></td>
                      <td>Personal Training</td>
                      <td><span className="badge badge-info">Proposal Sent</span></td>
                      <td>Coach Alex</td>
                      <td>Yesterday</td>
                    </tr>
                    <tr>
                      <td><strong>Chris Evans</strong></td>
                      <td>Corporate Membership</td>
                      <td><span className="badge badge-warning">Follow Up</span></td>
                      <td>Owner (You)</td>
                      <td>3 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Payments':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Invoices & Transactions</h3>
                  <p className="card-subtitle">Track payments, auto-renewals, and pending balances</p>
                </div>
                <button className="btn-secondary-sm">Stripe Payouts</button>
              </div>
              <div className="data-table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Member</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#INV-8921</td>
                      <td>Sarah Khan</td>
                      <td>$899.00</td>
                      <td>Credit Card (Stripe)</td>
                      <td><span className="badge badge-success">Paid</span></td>
                      <td>Today</td>
                    </tr>
                    <tr>
                      <td>#INV-8920</td>
                      <td>Liam Smith</td>
                      <td>$89.00</td>
                      <td>Auto-Debit ACH</td>
                      <td><span className="badge badge-success">Paid</span></td>
                      <td>Yesterday</td>
                    </tr>
                    <tr>
                      <td>#INV-8919</td>
                      <td>Rachel Green</td>
                      <td>$49.00</td>
                      <td>Credit Card</td>
                      <td><span className="badge badge-danger">Failed</span></td>
                      <td>Sep 25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Reports':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Analytics & SaaS Reports</h3>
                  <p className="card-subtitle">Revenue run-rate, member retention, and branch utilization</p>
                </div>
                <button className="btn-primary-sm">Generate Full Report</button>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-title">Monthly Churn Rate</span>
                  <div className="stat-value text-emerald">1.8%</div>
                  <p className="text-muted">Industry benchmark: 3.5%</p>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Average Revenue / Member</span>
                  <div className="stat-value">$78.40</div>
                  <p className="text-muted">+14% YoY increase</p>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Class Capacity Ratio</span>
                  <div className="stat-value">84.2%</div>
                  <p className="text-muted">High engagement in HIIT</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Settings':
        return (
          <div className="tab-pane-fade">
            <div className="content-card">
              <div className="card-header-clean">
                <div>
                  <h3 className="card-title">Platform & Tenant Settings</h3>
                  <p className="card-subtitle">Manage branding, tax IDs, notification webhooks, and billing</p>
                </div>
                <button className="btn-primary-sm">Save Changes</button>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Gym Franchise Name</label>
                  <input type="text" className="form-input" defaultValue={user?.name || 'IronPulse Fitness'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input type="email" className="form-input" defaultValue={user?.email || ''} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tenant ID (Global)</label>
                  <input type="text" className="form-input" disabled value={user?.tenantId || 'Single-Tenant Master'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Role</label>
                  <input type="text" className="form-input" disabled value={user?.role || 'GYM_OWNER'} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="logo-symbol">
            <Dumbbell size={20} />
          </div>
          <div className="logo-text-block">
            <span className="logo-title" style={{ fontSize: '1.4rem' }}>XTREME FITNESS</span>
            <span className="logo-subtitle">OWNER PORTAL</span>
          </div>
        </div>

        <div className="sidebar-user-preview">
          <div className="user-avatar-small">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'GO'}
          </div>
          <div className="user-meta-small">
            <p className="user-name-small">{user?.name || 'Gym Owner'}</p>
            <span className="user-role-badge">{user?.role || 'GYM_OWNER'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-title">MANAGEMENT ({user?.role})</p>
          {ownerMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="nav-active-arrow" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn" id="logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h2 className="page-heading">{activeTab}</h2>
            <p className="page-subheading">
              Managing as <span className="highlight-badge">{user?.role}</span> • {user?.name}
            </p>
          </div>

          <div className="topbar-right">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search members, branches, invoices..." className="search-input" />
            </div>

            <button className="icon-action-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile-pill">
              <div className="user-avatar-circle">
                {user?.name ? user.name[0].toUpperCase() : 'O'}
              </div>
              <div className="user-profile-details">
                <span className="user-profile-name">{user?.name}</span>
                <span className="user-profile-email">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="dashboard-body">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
