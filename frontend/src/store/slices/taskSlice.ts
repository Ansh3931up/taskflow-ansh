import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { tasksApi, type TaskWritePayload } from '@/api/tasks';
import type { Task } from '@/types';

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
      return await tasksApi.list(projectId, status, assignee, page, limit);
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to fetch tasks');
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (
    { projectId, data }: { projectId: string; data: TaskWritePayload },
    { rejectWithValue },
  ) => {
    try {
      return await tasksApi.create(projectId, data);
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to create task');
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: TaskWritePayload }, { rejectWithValue }) => {
    try {
      return await tasksApi.update(id, data);
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue({ message: err.error || 'Failed to update task' });
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error: unknown) {
      const err = error as { error?: string };
      return rejectWithValue(err.error || 'Failed to delete task');
    }
  },
);

interface TaskState {
  items: Task[];
  total: number;
  loading: boolean;
  error: string | null;
  rollbackById: Record<string, Task>;
}

const initialState: TaskState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  rollbackById: {},
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.items = [];
      state.total = 0;
      state.rollbackById = {};
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTasks.fulfilled,
      (state, action: PayloadAction<{ tasks: Task[]; total?: number }>) => {
        state.loading = false;
        state.items = action.payload?.tasks || [];
        state.total = action.payload?.total ?? state.items.length;
      },
    );
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    });

    builder.addCase(updateTask.pending, (state, action) => {
      const { id, data } = action.meta.arg;
      const idx = state.items.findIndex((t) => t.id === id);
      if (idx === -1) return;
      state.rollbackById[id] = { ...state.items[idx] };
      state.items[idx] = {
        ...state.items[idx],
        ...mergePatch(data),
      };
    });
    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
      const idx = state.items.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
      delete state.rollbackById[action.payload.id];
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      const id = action.meta.arg.id;
      const snap = state.rollbackById[id];
      const idx = state.items.findIndex((t) => t.id === id);
      if (snap && idx !== -1) {
        state.items[idx] = snap;
      }
      delete state.rollbackById[id];
      const payload = action.payload as { message?: string } | undefined;
      if (payload?.message) state.error = payload.message;
    });

    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    });
  },
});

function mergePatch(data: TaskWritePayload): Partial<Task> {
  const out: Partial<Task> = {};
  if (data.title !== undefined) out.title = data.title;
  if (data.description !== undefined) out.description = data.description ?? null;
  if (data.status !== undefined) out.status = data.status;
  if (data.priority !== undefined) out.priority = data.priority;
  if (data.assignee_id !== undefined) out.assignee_id = data.assignee_id;
  if (data.due_date !== undefined) out.due_date = data.due_date;
  return out;
}

export const { clearTasks, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
