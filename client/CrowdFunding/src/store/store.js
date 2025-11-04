import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import campaignSlice from './slices/campaignSlice';
import donationSlice from './slices/donationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    campaigns: campaignSlice,
    donations: donationSlice,
  },
});

export default store;