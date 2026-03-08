import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import lookupService, { LookupDto } from '@/services/lookupService';

interface LookupState {
    roles: LookupDto[];
    categories: LookupDto[];
    subCategories: LookupDto[];
    users: LookupDto[];
    statuses: LookupDto[];
    loading: boolean;
    error: string | null;
}

const initialState: LookupState = {
    roles: [],
    categories: [],
    subCategories: [],
    users: [],
    statuses: [],
    loading: false,
    error: null,
};

export const fetchRoles = createAsyncThunk('lookup/fetchRoles', async () => {
    const response = await lookupService.getRoles();
    return response.data;
});

export const fetchCategories = createAsyncThunk('lookup/fetchCategories', async () => {
    const response = await lookupService.getCategories();
    return response.data;
});

export const fetchSubCategories = createAsyncThunk('lookup/fetchSubCategories', async (categoryId?: number) => {
    const response = await lookupService.getSubCategories(categoryId);
    return response.data;
});

export const fetchUsers = createAsyncThunk('lookup/fetchUsers', async () => {
    const response = await lookupService.getUsers();
    return response.data;
});

export const fetchStatuses = createAsyncThunk('lookup/fetchStatuses', async () => {
    const response = await lookupService.getStatuses();
    return response.data;
});

const lookupSlice = createSlice({
    name: 'lookup',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Roles
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.roles = action.payload;
            })
            // Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            // Sub Categories
            .addCase(fetchSubCategories.fulfilled, (state, action) => {
                state.subCategories = action.payload;
            })
            // Users
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users = action.payload;
            })
            // Statuses
            .addCase(fetchStatuses.fulfilled, (state, action) => {
                state.statuses = action.payload;
            });
    },
});

export default lookupSlice.reducer;
