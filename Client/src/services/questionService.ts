import api from '@/config/api';
import { Question, QuestionListItem, CreateQuestionDto, UpdateQuestionDto } from '@/types/question';
import { ApiResponse, PagedResult } from '@/types/api';

export interface QuestionsPagedParams {
    categoryId?: number;
    subCategoryId?: number;
    level?: number; // QuestionLevel enum value
    isActive?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export const questionService = {
    getQuestionsPaged: async (params: QuestionsPagedParams): Promise<ApiResponse<PagedResult<QuestionListItem>>> => {
        const body = {
            categoryId: params.categoryId ?? null,
            subCategoryId: params.subCategoryId ?? null,
            level: params.level ?? null,
            isActive: params.isActive ?? null,
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 20,
            sortBy: params.sortBy ?? 'CreatedAt',
            sortDescending: params.sortDescending ?? true
        };
        const response = await api.get<ApiResponse<PagedResult<QuestionListItem>>>('/questions', { params: body });
        return response.data;
    },

    getAllQuestions: async (): Promise<ApiResponse<PagedResult<QuestionListItem>>> => {
        const response = await api.get<ApiResponse<PagedResult<QuestionListItem>>>('/questions', {
            params: { page: 1, pageSize: 500, sortBy: 'CreatedAt', sortDescending: true }
        });
        return response.data;
    },

    getQuestionById: async (id: number): Promise<ApiResponse<Question>> => {
        const response = await api.get<ApiResponse<Question>>(`/questions/${id}`);
        return response.data;
    },

    getQuestionsBySubCategory: async (subCategoryId: number): Promise<ApiResponse<Question[]>> => {
        const response = await api.get<ApiResponse<Question[]>>(`/questions/by-subcategory/${subCategoryId}`);
        return response.data;
    },

    getQuestionsByCategory: async (categoryId: number): Promise<ApiResponse<Question[]>> => {
        const response = await api.get<ApiResponse<Question[]>>(`/questions/by-category/${categoryId}`);
        return response.data;
    },

    createQuestion: async (data: CreateQuestionDto): Promise<ApiResponse<Question>> => {
        const response = await api.post<ApiResponse<Question>>('/questions', data);
        return response.data;
    },

    updateQuestion: async (id: number, data: UpdateQuestionDto): Promise<ApiResponse<Question>> => {
        const response = await api.put<ApiResponse<Question>>(`/questions/${id}`, data);
        return response.data;
    },

    deleteQuestion: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/questions/${id}`);
        return response.data;
    },

    toggleStatus: async (id: number): Promise<ApiResponse<Question>> => {
        const response = await api.patch<ApiResponse<Question>>(`/questions/${id}/toggle-status`);
        return response.data;
    }
};
