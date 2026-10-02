import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  selectedUser: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload.data || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
      state.loading = false;
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setUserLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setUserError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUsers, setSelectedUser, setUserLoading, setUserError } = userSlice.actions;
export default userSlice.reducer;
