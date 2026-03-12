import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SubCategory } from '@/types/category';
import { subCategoryService } from '@/services/subCategoryService';

interface SubCategoryState {
    items: SubCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: SubCategoryState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchSubCategories = createAsyncThunk(
    'subCategories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await subCategoryService.getAllSubCategories();
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch paths');
        }
    }
);

export const addSubCategory = createAsyncThunk(
    'subCategories/add',
    async (data: { name: string; categoryId: number; displayOrder?: number }, { rejectWithValue }) => {
        try {
            const response = await subCategoryService.createSubCategory(data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create path');
        }
    }
);

export const editSubCategory = createAsyncThunk(
    'subCategories/edit',
    async ({ id, data }: { id: number; data: { name: string; displayOrder?: number } }, { rejectWithValue }) => {
        try {
            const response = await subCategoryService.updateSubCategory(id, data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update path');
        }
    }
);

export const removeSubCategory = createAsyncThunk(
    'subCategories/remove',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await subCategoryService.deleteSubCategory(id);
            if (response.isSuccess) return id;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete path');
        }
    }
);

const subCategorySlice = createSlice({
    name: 'subCategories',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubCategories.fulfilled, (state, action: PayloadAction<SubCategory[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSubCategories.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
                state.items.push(action.payload);
            })
            .addCase(editSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(removeSubCategory.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(i => Number(i.id) !== action.payload);
            });
    }
});

export const { clearError } = subCategorySlice.actions;
export default subCategorySlice.reducer;
