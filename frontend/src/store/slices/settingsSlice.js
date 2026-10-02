import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: {
    siteName: 'Ro-Fitness',
    logo: '/ro-logo.svg',
    favicon: '/ro-logo.svg',
    primaryColor: '#ff2a2a',
    secondaryColor: '#10141d',
    accentColor: '#ff5e14',
    supportEmail: 'support@rofitness.com',
    supportPhone: '+91 98765 43210',
    address: 'Silicon Valley Tech Park, Bangalore, India',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com',
    footerText: '© 2026 Ro-Fitness SaaS Platform. All Rights Reserved.',
  },
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
      state.loading = false;
      state.error = null;
    },
    setSettingsLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setSettingsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setSettings, setSettingsLoading, setSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
