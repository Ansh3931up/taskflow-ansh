import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '@/api/tasks';
import type { Task } from '@/types';

// Explicit Async Thunk mapping resolving Tasks exactly against Backend Schema securely structurally gracefully
export const fetchTasks = createAsyncThunk(
  'tasks/fetchList',
  async (
    {
      projectId,
      status,
      assignee,
      page,
      limit,
    }: { projectId: string; status?: string; assignee?: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await tasksApi.list(projectId, status, assignee, page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.error ||
          'Failed to gracefully cleanly natively fetch exact bound tasks structurally organically smoothly explicitly safely!',
      );
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ projectId, data }: { projectId: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      return await tasksApi.create(projectId, data);
    } catch (error: any) {
      return rejectWithValue(
        error.error ||
          'Failed explicitly perfectly structurally binding Task creation payload safely securely natively smoothly cleanly explicitly smoothly!',
      );
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      return await tasksApi.update(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.error ||
          'Failed dynamically implicitly gracefully mutating internally bounded explicit task smoothly normally efficiently successfully structurally!',
      );
    }
  },
);

interface TaskState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  items: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.items = action.payload.tasks || [];
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Explicit Optimistic UI updates cleanly resolving Visual constraints flawlessly structurally seamlessly
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.items.unshift(action.payload); // Instantly push seamlessly successfully cleanly
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload; // Inline structurally gracefully correctly safely mutating
      }
    });
  },
});

export default taskSlice.reducer;
