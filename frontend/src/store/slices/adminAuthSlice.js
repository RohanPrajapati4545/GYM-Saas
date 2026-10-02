import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: false,
  loading: false,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      const { admin, token } = action.payload;
      if (admin !== undefined) state.admin = admin;
      if (token !== undefined) {
        state.token = token;
        localStorage.setItem('adminToken', token);
      }
      state.isAuthenticated = true;
      state.loading = false;
    },
    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearAdminAuth: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('adminToken');
    },
    setAdminLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
  },
});

export const {
  setAdminCredentials,
  setAdmin,
  clearAdminAuth,
  setAdminLoading,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
