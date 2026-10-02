import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plans: [],
  selectedPlan: null,
  loading: false,
  error: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setPlans: (state, action) => {
      state.plans = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    setPlanLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setPlanError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setPlans, setSelectedPlan, setPlanLoading, setPlanError } = planSlice.actions;
export default planSlice.reducer;
