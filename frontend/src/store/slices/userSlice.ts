import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '@/api/users';
import type { User } from '@/types';

export const fetchUsers = createAsyncThunk('users/fetchList', async (_, { rejectWithValue }) => {
  try {
    return await usersApi.list();
  } catch (error: any) {
    return rejectWithValue(error.error || 'Failed to fetch users');
  }
});

interface UserState {
  items: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  items: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export default userSlice.reducer;
