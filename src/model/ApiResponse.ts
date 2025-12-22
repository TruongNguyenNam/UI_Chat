export interface ApiResponse<T> {
    totalItems: number;
    isLastPage: boolean;
    totalPages: number;
    pageSize: number;
    currentPage: number;
    isFirstPage: boolean;
    content: T[];
}