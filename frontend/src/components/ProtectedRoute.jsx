import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner-glow"></div>
        <p className="loading-text">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Mandatory Plan Gate: Gym Owner MUST select a plan before entering dashboard
  const isPlanSelectionPage = location.pathname === '/select-plan' || location.pathname === '/subscription-plans';
  const hasPlan = Boolean(localStorage.getItem('gymSelectedPlan'));

  if (!hasPlan && !isPlanSelectionPage) {
    return <Navigate to="/select-plan" replace />;
  }

  return children;
};

export default ProtectedRoute;
