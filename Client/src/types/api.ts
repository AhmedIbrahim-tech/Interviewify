/** Standard API response body. statusCode is not sent by the backend; use axios response.status when needed. */
export interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string;
    statusCode?: number;
    errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pageIndex: number;
    pageSize: number;
    count: number;
}
