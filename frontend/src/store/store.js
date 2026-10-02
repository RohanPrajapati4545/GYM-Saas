import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import gymReducer from './slices/gymSlice';
import branchReducer from './slices/branchSlice';
import userReducer from './slices/userSlice';
import planReducer from './slices/planSlice';
import cmsReducer from './slices/cmsSlice';
import inquiryReducer from './slices/inquirySlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    gym: gymReducer,
    branch: branchReducer,
    user: userReducer,
    plan: planReducer,
    cms: cmsReducer,
    inquiry: inquiryReducer,
    settings: settingsReducer,
  },
});

export default store;
