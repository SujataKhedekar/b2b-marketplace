import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';
import { connectSocket, disconnectSocket } from '../../services/socket.js';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('token', data.token);
    connectSocket();
    return data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('token', data.token);
    connectSocket();
    return data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

export const loadMe = createAsyncThunk('auth/loadMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    connectSocket();
    return data.user;
  } catch (e) {
    return rejectWithValue('Session expired');
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null, booted: false },
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      disconnectSocket();
      state.user = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(loadMe.fulfilled, (s, a) => { s.user = a.payload; s.booted = true; })
     .addCase(loadMe.rejected, (s) => { s.booted = true; })
     .addMatcher((a) => a.type.endsWith('/pending'), (s) => { s.status = 'loading'; s.error = null; })
     .addMatcher((a) => /login|register/.test(a.type) && a.type.endsWith('/fulfilled'),
        (s, a) => { s.status = 'idle'; s.user = a.payload; })
     .addMatcher((a) => /login|register/.test(a.type) && a.type.endsWith('/rejected'),
        (s, a) => { s.status = 'idle'; s.error = a.payload; });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
