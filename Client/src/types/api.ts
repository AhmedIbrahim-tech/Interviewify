export interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string;
    statusCode: number;
    errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pageIndex: number;
    pageSize: number;
    count: number;
}
