import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await api.get('/notifications');
  return data;
});

const slice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 },
  reducers: {
    received(state, action) {
      state.items.unshift(action.payload);
      state.unread += 1;
    },
    allRead(state) { state.unread = 0; state.items.forEach((i) => (i.read = true)); },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.fulfilled, (s, a) => {
      s.items = a.payload.items; s.unread = a.payload.unread;
    });
  },
});

export const { received, allRead } = slice.actions;
export default slice.reducer;
