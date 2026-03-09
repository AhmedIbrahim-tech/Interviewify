import api from '@/config/api';
import { User } from '@/types/user';
import { ApiResponse } from '@/types/api';

export interface StatsDto {
    categoryCount: number;
    questionCount: number;
    userCount: number | null;
}

export interface UpdateProfileDto {
    fullName: string;
    email: string;
    profilePicture?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export const accountService = {
    getStats: async (): Promise<ApiResponse<StatsDto>> => {
        const response = await api.get<ApiResponse<StatsDto>>('/account/stats');
        return response.data;
    },

    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/account/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileDto): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/account/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordDto): Promise<ApiResponse<boolean>> => {
        const response = await api.patch<ApiResponse<boolean>>('/account/change-password', data);
        return response.data;
    }
};
