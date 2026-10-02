import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inquiries: [],
  selectedInquiry: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  error: null,
};

const inquirySlice = createSlice({
  name: 'inquiry',
  initialState,
  reducers: {
    setInquiries: (state, action) => {
      state.inquiries = action.payload.data || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
      state.error = null;
    },
    setSelectedInquiry: (state, action) => {
      state.selectedInquiry = action.payload;
    },
    setInquiryLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setInquiryError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setInquiries, setSelectedInquiry, setInquiryLoading, setInquiryError } = inquirySlice.actions;
export default inquirySlice.reducer;
