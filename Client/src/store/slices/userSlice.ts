import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, CreateUserDto, UpdateUserDto } from '@/types/user';
import { userService } from '@/services/userService';

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

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getAllUsers();
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates');
        }
    }
);

export const addUser = createAsyncThunk(
    'users/add',
    async (data: CreateUserDto, { rejectWithValue }) => {
        try {
            const response = await userService.createUser(data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create candidate');
        }
    }
);

export const editUser = createAsyncThunk(
    'users/edit',
    async ({ id, data }: { id: number; data: UpdateUserDto }, { rejectWithValue }) => {
        try {
            const response = await userService.updateUser(id, data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update candidate');
        }
    }
);

export const removeUser = createAsyncThunk(
    'users/remove',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await userService.deleteUser(id);
            if (response.isSuccess) return id;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete candidate');
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    'users/toggleStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await userService.toggleStatus(id);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.items.unshift(action.payload);
            })
            .addCase(editUser.fulfilled, (state, action: PayloadAction<User>) => {
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(removeUser.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(i => Number(i.id) !== action.payload);
            });
    }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
