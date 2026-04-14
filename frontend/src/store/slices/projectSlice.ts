import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { projectsApi } from '@/api/projects';
import type { Project } from '@/types';

// Async Thunks precisely matching Axios Intercept mappings seamlessly!
export const fetchProjects = createAsyncThunk(
  'projects/fetchList',
  async ({ page, limit }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await projectsApi.list(page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to fetch structurally correctly natively');
    }
  },
);

interface ProjectState {
  items: Project[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: ProjectState = {
  items: [],
  loading: false,
  error: null,
  total: 0,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.items = action.payload.projects || [];
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default projectSlice.reducer;
