// store/slices/donorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDonorProfile = createAsyncThunk(
  'donor/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/donors/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        throw new Error('Authentication failed. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch donor profile');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDonorDonations = createAsyncThunk(
  'donor/fetchDonations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/donors/donations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Authentication failed. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch donations');
      }

      return data.donations;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const donorSlice = createSlice({
  name: 'donor',
  initialState: {
    donor: null,
    donations: [],
    loading: false,
    error: null
  },
  reducers: {
    clearDonorError: (state) => {
      state.error = null;
    },
    clearDonorData: (state) => {
      state.donor = null;
      state.donations = [];
    },
    logoutDonor: (state) => {
      state.donor = null;
      state.donations = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch donor profile
      .addCase(fetchDonorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.donor = action.payload;
      })
      .addCase(fetchDonorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Clear donor data on auth errors
        if (action.payload.includes('Authentication failed') || action.payload.includes('No authentication token')) {
          state.donor = null;
          state.donations = [];
        }
      })
      // Fetch donor donations
      .addCase(fetchDonorDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonorDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload;
      })
      .addCase(fetchDonorDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload.includes('Authentication failed') || action.payload.includes('No authentication token')) {
          state.donations = [];
        }
      });
  }
});

export const { clearDonorError, clearDonorData, logoutDonor } = donorSlice.actions;
export default donorSlice.reducer;