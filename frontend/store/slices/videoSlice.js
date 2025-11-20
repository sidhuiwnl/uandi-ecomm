import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllVideos, createVideo, updateVideo, softDeleteVideo, hardDeleteVideo } from './api/client';

export const loadAll = createAsyncThunk('videos/loadAll', async () => await fetchAllVideos());
export const addVideo = createAsyncThunk('videos/addVideo', async ({ product_id, title, file }, { dispatch, rejectWithValue }) => {
  try {
    const res = await createVideo({ product_id, title, file }, (ev) => {
      // progress handler can dispatch progress actions if you want
      const pct = ev.lengthComputable ? Math.round((ev.loaded / ev.total) * 100) : 0;
      dispatch({ type: 'videos/uploadProgress', payload: pct });
    });
    // after upload, refresh list or return the created object
    const list = await fetchAllVideos();
    return list; // keep it simple: replace list
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const editVideo = createAsyncThunk('videos/edit', async ({ id, data }) => {
  await updateVideo(id, data);
  return { id, ...data };
});

export const removeVideo = createAsyncThunk('videos/remove', async ({ id, hard=true }, { dispatch }) => {
  if (hard) await hardDeleteVideo(id);
  else await softDeleteVideo(id);
  const list = await fetchAllVideos();
  return list;
});

const slice = createSlice({
  name: 'videos',
  initialState: { list: [], loading: false, error: null, uploadProgress: 0 },
  reducers: {
    clearError: (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b.addCase(loadAll.pending, (s)=>{ s.loading = true; })
     .addCase(loadAll.fulfilled, (s,a)=>{ s.loading=false; s.list = a.payload; })
     .addCase(loadAll.rejected, (s,a)=>{ s.loading=false; s.error = a.error.message; })

     .addCase(addVideo.pending, (s)=>{ s.loading=true; s.uploadProgress = 0; })
     .addCase(addVideo.fulfilled, (s,a)=>{ s.loading=false; s.list = a.payload; s.uploadProgress = 0; })
     .addCase(addVideo.rejected, (s,a)=>{ s.loading=false; s.error = a.payload || a.error.message; s.uploadProgress = 0; })

     .addCase(editVideo.fulfilled, (s,a)=>{
       const idx = s.list.findIndex(v => v.video_id === a.payload.id);
       if (idx !== -1) s.list[idx] = { ...s.list[idx], ...a.payload };
     })

     .addCase(removeVideo.fulfilled, (s,a)=>{ s.list = a.payload; });

    // custom action for upload progress
    b.addCase('videos/uploadProgress', (s, a) => { s.uploadProgress = a.payload; });
  }
});

export const { clearError } = slice.actions;
export default slice.reducer;