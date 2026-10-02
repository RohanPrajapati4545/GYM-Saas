import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Building2,
  GitBranch,
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Server,
  DollarSign,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get('/api/admin/dashboard');
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load real dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-muted" style={{ minHeight: '60vh' }}>
        <div className="spinner-glow mb-3"></div>
        <h5>Loading Platform Real-Time Telemetry...</h5>
      </div>
    );
  }

  const counts = data?.counts || {};
  const recent = data?.recent || {};
  const services = data?.servicesStatus || {};

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
            PLATFORM <span className="text-red">COMMAND CENTER</span>
          </h2>
          <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
            Multi-Tenant Ecosystem Live Real Database Telemetry
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button onClick={fetchDashboardData} className="btn btn-secondary-sm">
            Refresh Metrics
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Gym Franchises</span>
              <div className="stat-icon-wrapper red">
                <Building2 size={20} />
              </div>
            </div>
            <div className="stat-value">{counts.totalGyms ?? 0}</div>
            <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-dark" style={{ fontSize: '0.8rem' }}>
              <span className="text-success">{counts.activeGyms ?? 0} Active</span>
              <span className="text-muted">{counts.inactiveGyms ?? 0} Inactive / Pending</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Active Branches</span>
              <div className="stat-icon-wrapper cyan">
                <GitBranch size={20} />
              </div>
            </div>
            <div className="stat-value">{counts.totalBranches ?? 0}</div>
            <div className="d-flex align-items-center gap-1 mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
              <Activity size={14} color="#00d2ff" />
              <span>Multi-location IoT facilities</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Platform Users</span>
              <div className="stat-icon-wrapper emerald">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{counts.totalUsers ?? 0}</div>
            <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-dark" style={{ fontSize: '0.8rem' }}>
              <span className="text-success">{counts.totalGymOwners ?? 0} Owners</span>
              <span className="text-muted">{counts.totalBranchManagers ?? 0} Managers</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Inquiries & Leads</span>
              <div className="stat-icon-wrapper amber">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="stat-value">{counts.totalInquiries ?? 0}</div>
            <div className="d-flex align-items-center gap-1 mt-2 text-warning" style={{ fontSize: '0.8rem' }}>
              <Clock size={14} />
              <span>Landing Page Submissions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="content-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon-wrapper red">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Subscription Plans</div>
              <div className="fw-bold fs-5">{counts.totalPlans ?? 0} Active Tiers</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="content-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon-wrapper emerald">
              <DollarSign size={20} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Monthly Revenue</div>
              <div className="fw-bold text-muted fs-6">Payment Service Not Configured Yet</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="content-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon-wrapper cyan">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Total Gym Customers</div>
              <div className="fw-bold fs-5">{counts.totalCustomers ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="content-card p-3 d-flex align-items-center gap-3">
            <div className="stat-icon-wrapper amber">
              <Server size={20} />
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Auth Service Status</div>
              <div className="fw-bold" style={{ color: services.authService === 'HEALTHY' ? '#00e676' : '#ff5252' }}>
                {services.authService || 'CONNECTING'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="content-card">
            <div className="card-header-clean">
              <div>
                <h4 className="card-title m-0">Recent Gym Registrations</h4>
                <p className="card-subtitle m-0">Tenants added to platform</p>
              </div>
              <Link to="/admin/gyms" className="btn-secondary-sm">
                View All Gyms <ArrowUpRight size={14} />
              </Link>
            </div>

            {recent.gyms && recent.gyms.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Gym Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.gyms.map((g) => (
                      <tr key={g._id}>
                        <td className="fw-bold text-white">{g.name}</td>
                        <td className="text-muted">{g.email}</td>
                        <td>
                          <span className={`badge badge-${g.status === 'ACTIVE' ? 'success' : g.status === 'PENDING' ? 'warning' : 'danger'}`}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">No gyms created yet. Click "Gyms" to add one.</div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="content-card">
            <div className="card-header-clean">
              <div>
                <h4 className="card-title m-0">Recent Landing Inquiries</h4>
                <p className="card-subtitle m-0">Prospect franchise leads</p>
              </div>
              <Link to="/admin/inquiries" className="btn-secondary-sm">
                View Inquiries <ArrowUpRight size={14} />
              </Link>
            </div>

            {recent.inquiries && recent.inquiries.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.inquiries.map((inq) => (
                      <tr key={inq._id}>
                        <td>
                          <div className="fw-bold text-white">{inq.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{inq.email}</div>
                        </td>
                        <td>{inq.company || 'Direct Lead'}</td>
                        <td>
                          <span className={`badge badge-${inq.status === 'NEW' ? 'red' : inq.status === 'CONVERTED' ? 'success' : 'warning'}`}>
                            {inq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">No contact inquiries received yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
