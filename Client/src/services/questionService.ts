import api from '@/config/api';
import { Question, CreateQuestionDto, UpdateQuestionDto } from '@/types/question';
import { ApiResponse } from '@/types/api';

export const questionService = {
    getAllQuestions: async (): Promise<ApiResponse<Question[]>> => {
        const response = await api.get<ApiResponse<Question[]>>('/questions');
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
    }
};
