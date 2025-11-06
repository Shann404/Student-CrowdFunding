import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import campaignSlice from './slices/campaignSlice';
import donationSlice from './slices/donationSlice';
import donorReducer from './slices/donorSlice';
import adminReducer from './slices/adminSlice';


export const store = configureStore({
  reducer: {
    auth: authSlice,
    campaigns: campaignSlice,
    donations: donationSlice,
    donor: donorReducer,
    admin: adminReducer,

  },
});

export default store;