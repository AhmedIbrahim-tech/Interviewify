import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '@/types/category';
import { categoryService } from '@/services/categoryService';

interface CategoryState {
    items: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await categoryService.getAllCategories();
            if (response.isSuccess) {
                return response.data;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const addCategory = createAsyncThunk(
    'categories/add',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await categoryService.createCategory(data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category');
        }
    }
);

export const editCategory = createAsyncThunk(
    'categories/edit',
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await categoryService.updateCategory(id, data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update category');
        }
    }
);

export const removeCategory = createAsyncThunk(
    'categories/remove',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await categoryService.deleteCategory(id);
            if (response.isSuccess) return id;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.items.push(action.payload);
            })
            // Edit
            .addCase(editCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            // Remove
            .addCase(removeCategory.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(i => Number(i.id) !== action.payload);
            });
    },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
