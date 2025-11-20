  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import axios from 'axios';

  import Swal from 'sweetalert2';

  // const router = useRouter();

  export const verifyUser = createAsyncThunk('auth/verifyUser', async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, { withCredentials: true });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Verification failed');
    }
  });

  export const login = createAsyncThunk('auth/login', async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { identifier, password },
        { withCredentials: true }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  });

  export const signup = createAsyncThunk('auth/signup', async ({ email, phoneNumber, password, confirmPassword, firstName, lastName }, { rejectWithValue }) => {
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        { email, phoneNumber, password, confirmPassword, firstName, lastName },
        { withCredentials: true }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Signup failed');
    }
  });

  export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ identifier }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { identifier },
        { withCredentials: true }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Forgot password failed');
    }
  });

  export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        { token, newPassword, confirmPassword },
        { withCredentials: true }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Reset password failed');
    }
  });

  export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {}, { withCredentials: true });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  });

  export const refreshToken = createAsyncThunk('auth/refreshToken', async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {}, { withCredentials: true });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Token refresh failed');
    }
  });

  const authSlice = createSlice({
    name: 'auth',
    initialState: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    },
    reducers: {
      clearError(state) {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(verifyUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(verifyUser.fulfilled, (state, action) => {
          state.user = action.payload;
          console.log('Verified user:', action.payload);
          state.isAuthenticated = true;
          state.loading = false;
        })
        .addCase(verifyUser.rejected, (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.error = action.payload;
        })
        .addCase(login.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {

          state.user = action.payload;
          console.log('Logged in user:', action.payload);
          state.isAuthenticated = true;
          state.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Logged in successfully',
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(login.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(signup.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(signup.fulfilled, (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Signed up successfully',
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(signup.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
          state.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(forgotPassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
          state.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(resetPassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(logout.fulfilled, (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'You have been logged out successfully',
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(logout.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: action.payload,
            confirmButtonColor: '#2563eb',
          });
        })
        .addCase(refreshToken.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(refreshToken.rejected, (state, action) => {
          state.loading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.error = action.payload;
        });
    },
  });

  export const { clearError } = authSlice.actions;
  export default authSlice.reducer;