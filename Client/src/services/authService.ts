import api from '@/config/api';
import { ApiResponse } from '@/types/api';

export interface LoginRequest {
    email: string;
    password: string;
}

// Matches the backend AuthResponseDto exactly
export interface AuthResponseData {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiration: string;
    userName: string;
    role: string;
    email: string;
    profilePicture?: string;
    id: number;
}

export const authService = {
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponseData>> => {
        // Backend: api/auth/login
        const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
        return response.data;
    },

    refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponseData>> => {
        // Backend: api/auth/refresh
        const response = await api.post<ApiResponse<AuthResponseData>>('/auth/refresh', { refreshToken });
        return response.data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        // Backend: api/auth/logout  (expects { refreshToken: "..." })
        await api.post('/auth/logout', { refreshToken });
    }
};
