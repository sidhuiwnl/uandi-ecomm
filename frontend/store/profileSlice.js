import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "http://localhost:5000";  
// put your actual backend URL here (env variables optional)

// get profile
export const getProfile = createAsyncThunk(
  'profile/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      // const token = localStorage.getItem("user");
      // console.log("Fetching profile with token:", token);

      const res = await axios.get(`${API_URL}/user/me`, {
  withCredentials: true
});

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Network error' });
    }
  }
);

// update profile fields
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      // const token = localStorage.getItem("access_token");

      const res = await axios.put(`${API_URL}/user/me`, payload, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Update failed' });
    }
  }
);

// upload profile photo
export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadPhoto',
  async (file, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");

      const form = new FormData();
      form.append("photo", file);

      const res = await axios.post(`${API_URL}/user/me/photo`, form, {withCredentials: true });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Upload failed' });
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    loading: false,
    error: null
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(getProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload; })
      .addCase(getProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.profile = a.payload; })
      .addCase(updateProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(uploadProfilePhoto.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(uploadProfilePhoto.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload.user) {
          s.profile = a.payload.user;
        }
      })
      .addCase(uploadProfilePhoto.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
