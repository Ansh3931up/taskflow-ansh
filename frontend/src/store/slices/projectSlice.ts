import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { projectsApi } from '@/api/projects';
import type { Project } from '@/types';

export type ProjectStats = {
  by_status: { status: string; count: number }[];
  by_assignee: { assignee_id: string; assignee_name: string; count: number }[];
  unassigned_count: number;
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchList',
  async (
    { page, limit, append }: { page?: number; limit?: number; append?: boolean } = {},
    { rejectWithValue },
  ) => {
    try {
      const data = await projectsApi.list(page, limit);
      return { ...data, append: Boolean(append) };
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to fetch projects');
    }
  },
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (data: { name: string; description?: string }, { rejectWithValue }) => {
    try {
      return await projectsApi.create(data);
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to create project');
    }
  },
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      return await projectsApi.update(id, data);
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to update project');
    }
  },
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectsApi.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to delete project');
    }
  },
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchStats',
  async (id: string, { rejectWithValue }) => {
    try {
      return (await projectsApi.getStats(id)) as ProjectStats;
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to fetch project stats');
    }
  },
);

interface ProjectState {
  items: Project[];
  listMeta: { page: number; limit: number; total: number } | null;
  currentProject: Project | null;
  stats: ProjectStats | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  items: [],
  listMeta: null,
  currentProject: null,
  stats: null,
  loading: false,
  loadingMore: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (state, action) => {
      const append = action.meta.arg?.append;
      if (append) state.loadingMore = true;
      else {
        state.loading = true;
        state.error = null;
      }
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      const { projects, page, limit, total, append } = action.payload;
      state.listMeta = { page, limit, total };
      if (append) {
        const seen = new Set(state.items.map((p) => p.id));
        for (const p of projects) {
          if (!seen.has(p.id)) {
            state.items.push(p);
            seen.add(p.id);
          }
        }
      } else {
        state.items = projects || [];
      }
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      state.error = action.payload as string;
    });

    builder.addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
      state.items.unshift(action.payload);
      if (state.listMeta) state.listMeta.total += 1;
    });

    builder.addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    });

    builder.addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      if (state.listMeta) state.listMeta.total = Math.max(0, state.listMeta.total - 1);
    });

    builder.addCase(fetchProjectStats.fulfilled, (state, action: PayloadAction<ProjectStats>) => {
      state.stats = {
        ...action.payload,
        unassigned_count: action.payload.unassigned_count ?? 0,
      };
    });
  },
});

export const { setCurrentProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
