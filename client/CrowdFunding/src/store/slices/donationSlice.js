import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchCampaignDonations = createAsyncThunk(
  'donations/fetchCampaignDonations',
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/donations/campaign/${campaignId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserDonations = createAsyncThunk(
  'donations/fetchUserDonations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/donations/user');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDonationStats = createAsyncThunk(
  'donations/fetchDonationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/donations/stats');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createDonation = createAsyncThunk(
  'donations/createDonation',
  async (donationData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(donationData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  campaignDonations: [],
  userDonations: [],
  stats: {
    totalDonations: 0,
    totalAmount: 0
  },
  loading: false,
  error: null,
  creating: false,
  createError: null
};

// Slice
const donationSlice = createSlice({
  name: 'donations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearDonations: (state) => {
      state.campaignDonations = [];
      state.userDonations = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaign donations
      .addCase(fetchCampaignDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.campaignDonations = action.payload;
      })
      .addCase(fetchCampaignDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user donations
      .addCase(fetchUserDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.userDonations = action.payload;
      })
      .addCase(fetchUserDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch donation stats
      .addCase(fetchDonationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Create donation
      .addCase(createDonation.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        state.creating = false;
        // Add to campaign donations if viewing a campaign
        state.campaignDonations.unshift(action.payload.donation);
        // Add to user donations if user is logged in
        if (action.payload.donation.donor) {
          state.userDonations.unshift(action.payload.donation);
        }
        // Update stats
        state.stats.totalDonations += 1;
        state.stats.totalAmount += action.payload.donation.amount;
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      });
  }
});

export const { clearError, clearDonations } = donationSlice.actions;
export default donationSlice.reducer;