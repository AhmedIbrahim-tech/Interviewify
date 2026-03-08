import api from '@/config/api';

export interface LookupDto {
    value: string;
    label: string;
}

export interface ApiResult<T> {
    isSuccess: boolean;
    data: T;
    message: string | null;
    errors: string[] | null;
}

const lookupService = {
    getRoles: async () => {
        const response = await api.get<ApiResult<LookupDto[]>>('/lookups/roles');
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get<ApiResult<LookupDto[]>>('/lookups/categories');
        return response.data;
    },
    getSubCategories: async (categoryId?: number) => {
        const url = categoryId ? `/lookups/sub-categories?categoryId=${categoryId}` : '/lookups/sub-categories';
        const response = await api.get<ApiResult<LookupDto[]>>(url);
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get<ApiResult<LookupDto[]>>('/lookups/users');
        return response.data;
    },
    getStatuses: async () => {
        const response = await api.get<ApiResult<LookupDto[]>>('/lookups/statuses');
        return response.data;
    }
};

export default lookupService;
