import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Question, CreateQuestionDto, UpdateQuestionDto } from '@/types/question';
import { questionService } from '@/services/questionService';

interface QuestionState {
    items: Question[];
    loading: boolean;
    error: string | null;
}

const initialState: QuestionState = {
    items: [],
    loading: false,
    error: null,
};

/** Fetches first page of questions (up to 500). Backend returns paged list; we store items for dashboard. */
export const fetchQuestions = createAsyncThunk(
    'questions/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await questionService.getQuestionsPaged({ page: 1, pageSize: 500 });
            if (response.isSuccess && response.data?.items) {
                const items = response.data.items.map((li) => ({ ...li, answer: '', answerAr: null })) as Question[];
                return items;
            }
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions');
        }
    }
);

export const addQuestion = createAsyncThunk(
    'questions/add',
    async (data: CreateQuestionDto, { rejectWithValue }) => {
        try {
            const response = await questionService.createQuestion(data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create question');
        }
    }
);

export const editQuestion = createAsyncThunk(
    'questions/edit',
    async ({ id, data }: { id: number; data: UpdateQuestionDto }, { rejectWithValue }) => {
        try {
            const response = await questionService.updateQuestion(id, data);
            if (response.isSuccess) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update question');
        }
    }
);

export const removeQuestion = createAsyncThunk(
    'questions/remove',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await questionService.deleteQuestion(id);
            if (response.isSuccess) return id;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete question');
        }
    }
);

export const toggleQuestionStatus = createAsyncThunk(
    'questions/toggleStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await questionService.toggleStatus(id);
            if (response.isSuccess && response.data) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
        }
    }
);

const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuestions.fulfilled, (state, action: PayloadAction<Question[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchQuestions.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
                state.items.unshift(action.payload);
            })
            .addCase(editQuestion.fulfilled, (state, action: PayloadAction<Question>) => {
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(removeQuestion.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter(i => Number(i.id) !== action.payload);
            })
            .addCase(toggleQuestionStatus.fulfilled, (state, action: PayloadAction<Question>) => {
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            });
    }
});

export const { clearError } = questionSlice.actions;
export default questionSlice.reducer;
