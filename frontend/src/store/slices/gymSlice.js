import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gyms: [],
  selectedGym: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  error: null,
};

const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    setGyms: (state, action) => {
      state.gyms = action.payload.data || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
      state.error = null;
    },
    setSelectedGym: (state, action) => {
      state.selectedGym = action.payload;
    },
    setGymLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setGymError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setGyms, setSelectedGym, setGymLoading, setGymError } = gymSlice.actions;
export default gymSlice.reducer;
