import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const createDonation = createAsyncThunk(
  'donations/createDonation',
  async (donationData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_URL}/donations`, donationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCampaignDonations = createAsyncThunk(
  'donations/fetchCampaignDonations',
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/donations/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserDonations = createAsyncThunk(
  'donations/fetchUserDonations',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/donations/my-donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchDonationStats = createAsyncThunk(
  'donations/fetchDonationStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/donations/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const donationSlice = createSlice({
  name: 'donations',
  initialState: {
    donations: [],
    userDonations: [],
    campaignDonations: [],
    stats: {},
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDonations: (state) => {
      state.donations = [];
      state.campaignDonations = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create donation
      .addCase(createDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        state.loading = false;
        state.donations.unshift(action.payload.donation);
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch campaign donations
      .addCase(fetchCampaignDonations.fulfilled, (state, action) => {
        state.campaignDonations = action.payload;
      })
      // Fetch user donations
      .addCase(fetchUserDonations.fulfilled, (state, action) => {
        state.userDonations = action.payload;
      })
      // Fetch donation stats
      .addCase(fetchDonationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearError, clearDonations } = donationSlice.actions;
export default donationSlice.reducer;