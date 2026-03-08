import api from '@/config/api';
import { Category, SubCategory } from '@/types/category';
import { ApiResponse } from '@/types/api';

export const categoryService = {
    getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
        // Backend: api/categories
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        return response.data;
    },

    getCategoryById: async (id: number): Promise<ApiResponse<Category>> => {
        // Backend: api/categories/{id}
        const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
        return response.data;
    },

    getSubCategoriesByCategoryId: async (categoryId: number): Promise<ApiResponse<SubCategory[]>> => {
        // Backend: api/subcategories/by-category/{categoryId}
        const response = await api.get<ApiResponse<SubCategory[]>>(`/subcategories/by-category/${categoryId}`);
        return response.data;
    },

    createCategory: async (data: any): Promise<ApiResponse<Category>> => {
        // Backend: api/categories
        const response = await api.post<ApiResponse<Category>>('/categories', data);
        return response.data;
    },

    updateCategory: async (id: number, data: any): Promise<ApiResponse<Category>> => {
        // Backend: api/categories/{id}
        const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
        // Backend: api/categories/{id}
        const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
        return response.data;
    }
};
