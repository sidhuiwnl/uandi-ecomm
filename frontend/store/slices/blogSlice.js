import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:5000/blogs';

export const fetchBlogs = createAsyncThunk('blog/fetchAll', async ({ status } = {}) => {
  const url = status ? `${API}?status=${status}` : API;
  const res = await fetch(url);
  return res.json();
});

export const createBlog = createAsyncThunk('blog/create', async (data, { getState }) => {
  const token = localStorage.getItem('token');
  console.log('Creating blog with data:', data);
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.json();
});

export const updateBlog = createAsyncThunk('blog/update', async ({ id, ...data }, { getState }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return res.json();
});

export const deleteBlog = createAsyncThunk('blog/delete', async (id) => {
  const token = localStorage.getItem('token');
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return id;
});

export const toggleHide = createAsyncThunk('blog/toggleHide', async ({ id, hide }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/${id}/hide`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ hide }),
  });
  return res.json();
});

const blogSlice = createSlice({
  name: 'blog',
  initialState: { list: [], current: null, loading: false, error: null },
  reducers: {
    clearCurrent: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => { state.loading = true; })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const idx = state.list.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.current = action.payload;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.list = state.list.filter(b => b.id !== action.payload);
      });
  },
});

export const { clearCurrent } = blogSlice.actions;
export default blogSlice.reducer;