import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Existing async thunks...
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingCampaigns = createAsyncThunk(
  'admin/fetchPendingCampaigns',
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/campaigns/pending?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyCampaign = createAsyncThunk(
  'admin/verifyCampaign',
  async ({ campaignId, action, notes }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/campaigns/${campaignId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDonations = createAsyncThunk(
  'admin/fetchDonations',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/admin/donations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const flagEntity = createAsyncThunk(
  'admin/flagEntity',
  async (flagData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/flag', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flagData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserSuspension = createAsyncThunk(
  'admin/toggleUserSuspension',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Fetch student profiles with their campaigns
export const fetchStudentProfiles = createAsyncThunk(
  'admin/fetchStudentProfiles',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/students/admin/profiles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Fetch all campaigns with detailed information
export const fetchAllCampaignsWithDetails = createAsyncThunk(
  'admin/fetchAllCampaignsWithDetails',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/campaigns/admin/all-campaigns?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Verify student profile
export const verifyStudentProfile = createAsyncThunk(
  'admin/verifyStudentProfile',
  async ({ studentId, action, notes }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/admin/${studentId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// In your adminSlice.js - UPDATE the rejectStudentVerification thunk
export const rejectStudentVerification = createAsyncThunk(
  'admin/rejectStudentVerification',
  async ({ studentId, notes = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/students/${studentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'reject', 
          notes 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    pendingCampaigns: [],
    studentProfiles: [], // NEW: Student profiles state
    allCampaigns: [], // NEW: All campaigns with details state
    users: [],
    donations: [],
    analytics: null,
    loading: false,
    error: null,
    pagination: {}
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    // NEW: Clear student profiles (optional)
    clearStudentProfiles: (state) => {
      state.studentProfiles = [];
    },
    // NEW: Clear all campaigns (optional)
    clearAllCampaigns: (state) => {
      state.allCampaigns = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch pending campaigns
      .addCase(fetchPendingCampaigns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCampaigns = action.payload.campaigns || action.payload;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchPendingCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify campaign
      .addCase(verifyCampaign.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyCampaign.fulfilled, (state, action) => {
        state.loading = false;
        // Remove verified campaign from pending list
        state.pendingCampaigns = state.pendingCampaigns.filter(
          campaign => campaign._id !== action.payload.campaign._id
        );
        // Also update in allCampaigns if it exists there
        if (state.allCampaigns.length > 0) {
          state.allCampaigns = state.allCampaigns.map(campaign =>
            campaign._id === action.payload.campaign._id 
              ? { ...campaign, status: action.payload.campaign.status }
              : campaign
          );
        }
      })
      .addCase(verifyCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch donations
      .addCase(fetchDonations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload.donations || action.payload;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // NEW: Fetch student profiles
      .addCase(fetchStudentProfiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudentProfiles.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response structures
        state.studentProfiles = action.payload.studentProfiles || action.payload.data || action.payload;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchStudentProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // NEW: Fetch all campaigns with details
      .addCase(fetchAllCampaignsWithDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCampaignsWithDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response structures
        state.allCampaigns = action.payload.campaigns || action.payload.data || action.payload;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchAllCampaignsWithDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       // Verify student profile - FIXED VERSION
      .addCase(verifyStudentProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { studentId, action: verificationAction } = action.meta.arg;
        
        if (verificationAction === 'reject') {
           // Update the student status to rejected instead of removing
    state.studentProfiles = state.studentProfiles.map(student =>
      student._id === studentId
        ? { 
            ...student, 
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            // Also update user verification status if needed
            user: student.user ? { ...student.user, isVerified: false } : student.user
          }
        : student
          );
        } else if (verificationAction === 'verify') {
          // Update the verification status for verified students
          state.studentProfiles = state.studentProfiles.map(student =>
            student._id === studentId
              ? { 
                  ...student, 
                  user: { 
                    ...student.user, 
                    isVerified: true 
                  } 
                }
              : student
          );
        }
      })
      .addCase(verifyStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject student verification - NEW HANDLER
      .addCase(rejectStudentVerification.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectStudentVerification.fulfilled, (state, action) => {
        state.loading = false;
       // Access studentId from the meta.arg object
     const { studentId } = action.meta.arg;
        
        // Update the student status to rejected instead of removing
  state.studentProfiles = state.studentProfiles.map(student =>
    student._id === studentId
      ? { 
          ...student, 
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        }
      : student
  );
      })
      .addCase(rejectStudentVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Flag entity
      .addCase(flagEntity.pending, (state) => {
        state.loading = true;
      })
      .addCase(flagEntity.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(flagEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle user suspension
      .addCase(toggleUserSuspension.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleUserSuspension.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleUserSuspension.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearAdminError, 
  clearStudentProfiles, 
  clearAllCampaigns 
} = adminSlice.actions;
export default adminSlice.reducer;