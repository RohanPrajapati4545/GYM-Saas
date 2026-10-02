import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, clearAuth, setLoading } from './store/slices/authSlice';
import { setAdminCredentials, clearAdminAuth, setAdminLoading } from './store/slices/adminAuthSlice';
import { setSettings } from './store/slices/settingsSlice';
import api from './services/api';
import adminApi from './services/adminApi';

import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { GuestRoute, AdminGuestRoute } from './components/PublicRoute';
import AdminLayout from './layouts/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

import Landing from './pages/Landing';
import {
  GymOwnerLogin as Login,
  GymOwnerRegister as Register,
  GymOwnerDashboard as Dashboard,
  GymOwnerSelectPlan,
} from './pages/gym-owner';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGyms from './pages/admin/AdminGyms';
import AdminBranches from './pages/admin/AdminBranches';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlans from './pages/admin/AdminPlans';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminCMS from './pages/admin/AdminCMS';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const userToken = localStorage.getItem('token');
      if (userToken) {
        dispatch(setLoading(true));
        try {
          const response = await api.get('/api/auth/me');
          dispatch(
            setCredentials({
              user: response.data,
              token: userToken,
            })
          );
        } catch (error) {
          localStorage.removeItem('token');
          dispatch(clearAuth());
        } finally {
          dispatch(setLoading(false));
        }
      }

      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        dispatch(setAdminLoading(true));
        try {
          const res = await adminApi.get('/api/admin/auth/me');
          if (res.data?.data) {
            dispatch(
              setAdminCredentials({
                admin: res.data.data,
                token: adminToken,
              })
            );
          }
        } catch (err) {
          localStorage.removeItem('adminToken');
          dispatch(clearAdminAuth());
        } finally {
          dispatch(setAdminLoading(false));
        }
      }

      try {
        const settingsRes = await adminApi.get('/api/public/settings');
        if (settingsRes.data?.success) {
          dispatch(setSettings(settingsRes.data.data));
        }
      } catch (err) {
        // use default settings
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />

        <Route
          path="/select-plan"
          element={
            <ProtectedRoute>
              <GymOwnerSelectPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription-plans"
          element={
            <ProtectedRoute>
              <GymOwnerSelectPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/login"
          element={
            <AdminGuestRoute>
              <AdminLogin />
            </AdminGuestRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="gyms" element={<AdminGyms />} />
          <Route path="branches" element={<AdminBranches />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="cms/landing" element={<AdminCMS />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
