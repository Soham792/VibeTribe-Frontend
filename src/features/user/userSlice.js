import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// Fetch user profile
// fetchUser accepts an optional Clerk token and uses it for Authorization when provided
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (token = null, { rejectWithValue }) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      const { data } = await api.get('/api/user/data', config)
      if (!data || !data.success) {
        return rejectWithValue(data?.message || 'Failed to fetch user data')
      }
      return data.user
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Network error')
    }
  }
)

// Update user profile
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userData }, { rejectWithValue }) => {
    try {
      // The headers will be set by axios interceptor
      const { data } = await api.put('/api/user/update', userData)
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to update user')
      }

      // Show success message
      toast.success(data.message || 'Profile updated successfully');
      return data.user
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Network error';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    value: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser: (state) => {
      state.value = null
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUser cases
      .addCase(fetchUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.value = action.payload
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch user data'
        state.value = null
      })
      // updateUser cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.value = action.payload
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update user'
      })
  },
})

export const { clearUser } = userSlice.actions
export default userSlice.reducer