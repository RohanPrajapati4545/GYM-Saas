import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  landingCMS: null,
  loading: false,
  error: null,
};

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setLandingCMS: (state, action) => {
      state.landingCMS = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCMSLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setCMSError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLandingCMS, setCMSLoading, setCMSError } = cmsSlice.actions;
export default cmsSlice.reducer;
