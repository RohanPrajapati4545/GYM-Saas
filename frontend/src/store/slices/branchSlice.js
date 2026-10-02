import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  branches: [],
  selectedBranch: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setBranches: (state, action) => {
      state.branches = action.payload.data || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
      state.error = null;
    },
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
    },
    setBranchLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setBranchError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setBranches, setSelectedBranch, setBranchLoading, setBranchError } = branchSlice.actions;
export default branchSlice.reducer;
