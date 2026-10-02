import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { isAuthenticated: isAdminAuth, loading: adminLoading } = useSelector((state) => state.adminAuth);

  // If currently verifying existing tokens from localStorage
  if (loading || adminLoading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '100vh', background: '#090c10', color: '#fff' }}
      >
        <div className="spinner-border text-danger" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
        <p className="mt-3 text-secondary small" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Verifying session...
        </p>
      </div>
    );
  }

  if (isAdminAuth) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isAuthenticated) {
    const hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));
    return <Navigate to={hasPlan ? "/dashboard" : "/select-plan"} replace />;
  }

  return children;
};

export const AdminGuestRoute = ({ children }) => {
  const { isAuthenticated: isAdminAuth, loading: adminLoading } = useSelector((state) => state.adminAuth);
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (adminLoading || loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '100vh', background: '#090c10', color: '#fff' }}
      >
        <div className="spinner-border text-danger" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
        <p className="mt-3 text-secondary small" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Verifying session...
        </p>
      </div>
    );
  }

  if (isAdminAuth) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isAuthenticated) {
    const hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));
    return <Navigate to={hasPlan ? "/dashboard" : "/select-plan"} replace />;
  }

  return children;
};

export default GuestRoute;
