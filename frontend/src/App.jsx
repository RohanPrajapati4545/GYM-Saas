import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, clearAuth, setLoading } from './store/slices/authSlice';
import api from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // App Initialization Flow
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');

      // 1. If no token found in localStorage
      if (!token) {
        dispatch(clearAuth());
        return;
      }

      // 2. If JWT exists, verify token with GET /api/auth/me
      dispatch(setLoading(true));
      try {
        const response = await api.get('/api/auth/me');
        // Update Redux state with user data and valid token
        dispatch(
          setCredentials({
            user: response.data,
            token,
          })
        );
      } catch (error) {
        console.warn('Initial token verification failed or expired:', error?.response?.data?.message || error.message);
        // 3. If token is invalid/expired, remove token and clear Redux state
        localStorage.removeItem('token');
        dispatch(clearAuth());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
