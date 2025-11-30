export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface Location {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
    address?: string;
}
export interface SearchFilters {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    near?: string;
    radiusKm?: number;
    mode?: 'via_vendor' | 'via_agency';
}
