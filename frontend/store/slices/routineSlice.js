import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

/* -------------------------------
   SAVE ROUTINE
-------------------------------- */
export const saveRoutine = createAsyncThunk(
    'routine/save',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await API.post('/routines', payload, {
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to save routine');
        }
    }
);

/* -------------------------------
   FETCH USER ROUTINES
-------------------------------- */
export const fetchUserRoutines = createAsyncThunk(
    'routine/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get('/routines', {
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch routines');
        }
    }
);

/* -------------------------------
   FETCH SINGLE ROUTINE
-------------------------------- */
export const fetchRoutineById = createAsyncThunk(
    'routine/fetchOne',
    async (routineId, { rejectWithValue }) => {
        try {
            const res = await API.get(`/routines/${routineId}`, {
                withCredentials: true,
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch routine');
        }
    }
);

/* -------------------------------
   DELETE ROUTINE (SOFT)
-------------------------------- */
export const deleteRoutine = createAsyncThunk(
    'routine/delete',
    async (routineId, { rejectWithValue }) => {
        try {
            await API.delete(`/routines/${routineId}`, {
                withCredentials: true,
            });
            return routineId;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to delete routine');
        }
    }
);

/* -------------------------------
   SLICE
-------------------------------- */
const routineSlice = createSlice({
    name: 'routine',
    initialState: {
        list: [],
        selected: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        clearSelectedRoutine(state) {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* Save */
            .addCase(saveRoutine.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(saveRoutine.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(saveRoutine.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            /* Fetch all */
            .addCase(fetchUserRoutines.fulfilled, (state, action) => {
                state.list = action.payload;
                state.status = 'succeeded';
            })

            /* Fetch one */
            .addCase(fetchRoutineById.fulfilled, (state, action) => {
                state.selected = action.payload;
                state.status = 'succeeded';
            })

            /* Delete */
            .addCase(deleteRoutine.fulfilled, (state, action) => {
                state.list = state.list.filter(
                    (r) => r.routine_id !== action.payload
                );
            });
    },
});

export const { clearSelectedRoutine } = routineSlice.actions;
export default routineSlice.reducer;
