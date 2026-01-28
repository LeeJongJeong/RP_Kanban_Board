/**
 * Standard API Response Types
 * 
 * All API endpoints should use these standardized response formats
 * for consistency and better client-side handling.
 */

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

/**
 * Helper functions to create standardized API responses
 */

export function successResponse<T>(data?: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message
    }
}

export function errorResponse(error: string, statusCode?: number): ApiResponse {
    return {
        success: false,
        error
    }
}

/**
 * Type-specific response interfaces
 */

export interface LoginData {
    message: string
}

export interface RegisterData {
    userId?: number
    message: string
}

export interface PasswordChangeData {
    message: string
}
