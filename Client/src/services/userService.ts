import api from '@/config/api';
import { User, CreateUserDto, UpdateUserDto } from '@/types/user';
import { ApiResponse } from '@/types/api';

export const userService = {
    getAllUsers: async (): Promise<ApiResponse<User[]>> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data;
    },

    getUserById: async (id: number): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    },

    createUser: async (data: CreateUserDto): Promise<ApiResponse<User>> => {
        const response = await api.post<ApiResponse<User>>('/users', data);
        return response.data;
    },

    updateUser: async (id: number, data: UpdateUserDto): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: number): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/users/${id}`);
        return response.data;
    },

    toggleStatus: async (id: number): Promise<ApiResponse<User>> => {
        const response = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
        return response.data;
    }
};
