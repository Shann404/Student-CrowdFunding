import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(`${API_URL}/campaigns?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const formData = new FormData();

      Object.keys(campaignData).forEach(key => {
        if (key === 'images' && campaignData.images) {
          campaignData.images.forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, campaignData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/campaigns`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
console.error('Campaign creation error details:', {
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors,
        message: error.response?.data?.message
      });      
      return rejectWithValue(error.response?.data || error.message);    }
  }
);

export const fetchUserCampaigns = createAsyncThunk(
  'campaigns/fetchUserCampaigns',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/campaigns/user/my-campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: {
    campaigns: [],
    currentCampaign: null,
    userCampaigns: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0
    }
  },
  reducers: {
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.campaigns;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total
        };
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single campaign
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create campaign
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.userCampaigns.unshift(action.payload.campaign);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user campaigns
      .addCase(fetchUserCampaigns.fulfilled, (state, action) => {
        state.userCampaigns = action.payload;
      });
  },
});

export const { clearCurrentCampaign, clearError } = campaignSlice.actions;
export default campaignSlice.reducer;