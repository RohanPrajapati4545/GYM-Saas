import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      if (user !== undefined) state.user = user;
      if (token !== undefined) state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = typeof action.payload === 'boolean' ? action.payload : true;
    },
  },
});

export const {
  login,
  logout,
  setCredentials,
  clearAuth,
  setUser,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
