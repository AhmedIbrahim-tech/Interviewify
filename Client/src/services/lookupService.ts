import api from '@/config/api';
import { ApiResponse } from '@/types/api';

export interface LookupDto {
    value: string;
    label: string;
}

const lookupService = {
    getRoles: async () => {
        const response = await api.get<ApiResponse<LookupDto[]>>('/lookups/roles');
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get<ApiResponse<LookupDto[]>>('/lookups/categories');
        return response.data;
    },
    getSubCategories: async (categoryId?: number) => {
        const url = categoryId ? `/lookups/sub-categories?categoryId=${categoryId}` : '/lookups/sub-categories';
        const response = await api.get<ApiResponse<LookupDto[]>>(url);
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get<ApiResponse<LookupDto[]>>('/lookups/users');
        return response.data;
    },
    getStatuses: async () => {
        const response = await api.get<ApiResponse<LookupDto[]>>('/lookups/statuses');
        return response.data;
    }
};

export default lookupService;
