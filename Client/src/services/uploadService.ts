import api from '@/config/api';
import { ApiResponse } from '@/types/api';

export const uploadService = {
    /**
     * General upload to a specific folder
     */
    upload: async (file: File, folder: string = 'general'): Promise<ApiResponse<string>> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ApiResponse<string>>(`/uploads/general?folder=${encodeURIComponent(folder)}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Delete a file from the server
     */
    delete: async (filePath: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/uploads?filePath=${encodeURIComponent(filePath)}`);
        return response.data;
    }
};
