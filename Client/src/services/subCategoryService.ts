import api from '@/config/api';
import { SubCategory } from '@/types/category';
import { ApiResponse } from '@/types/api';

export const subCategoryService = {
    getAllSubCategories: async (): Promise<ApiResponse<SubCategory[]>> => {
        const response = await api.get<ApiResponse<SubCategory[]>>('/subcategories');
        return response.data;
    },

    getSubCategoryById: async (id: number): Promise<ApiResponse<SubCategory>> => {
        const response = await api.get<ApiResponse<SubCategory>>(`/subcategories/${id}`);
        return response.data;
    },

    getSubCategoriesByCategoryId: async (categoryId: number): Promise<ApiResponse<SubCategory[]>> => {
        const response = await api.get<ApiResponse<SubCategory[]>>(`/subcategories/by-category/${categoryId}`);
        return response.data;
    },

    createSubCategory: async (data: { name: string; categoryId: number; displayOrder?: number }): Promise<ApiResponse<SubCategory>> => {
        const response = await api.post<ApiResponse<SubCategory>>('/subcategories', data);
        return response.data;
    },

    updateSubCategory: async (id: number, data: { name: string; displayOrder?: number }): Promise<ApiResponse<SubCategory>> => {
        const response = await api.put<ApiResponse<SubCategory>>(`/subcategories/${id}`, data);
        return response.data;
    },

    deleteSubCategory: async (id: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/subcategories/${id}`);
        return response.data;
    }
};
