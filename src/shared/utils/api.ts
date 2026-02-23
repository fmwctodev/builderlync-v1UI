import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { logoutAndRedirect } from './auth';

/**
 * API Utility - Replaces Supabase client for frontend
 * 
 * This utility provides a centralized way to make API calls to the backend,
 * replacing direct Supabase calls from the frontend.
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Request interceptor - Add auth headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (orgId) {
      config.headers['x-organization-id'] = orgId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      logoutAndRedirect();
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<T>(url, config);
    return response.data;
  },

  /**
   * POST request
   */
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },

  /**
   * PUT request
   */
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<T>(url, data, config);
    return response.data;
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<T>(url, config);
    return response.data;
  },

  /**
   * Upload file
   */
  upload: async <T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
};

/**
 * Helper function to build query string
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Helper to handle API errors
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.error || error.response.data?.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Example usage:
 * 
 * // Simple GET
 * const opportunities = await apiClient.get('/opportunities');
 * 
 * // GET with query params
 * const filtered = await apiClient.get(`/opportunities${buildQueryString({ status: 'open' })}`);
 * 
 * // POST
 * const newOpportunity = await apiClient.post('/opportunities', opportunityData);
 * 
 * // PUT
 * const updated = await apiClient.put(`/opportunities/${id}`, updates);
 * 
 * // DELETE
 * await apiClient.delete(`/opportunities/${id}`);
 * 
 * // Upload file
 * const result = await apiClient.upload('/files/upload', file, { entity_type: 'opportunity' });
 * 
 * // Error handling
 * try {
 *   const data = await apiClient.get('/opportunities');
 * } catch (error) {
 *   const errorMessage = handleApiError(error);
 *   console.error(errorMessage);
 * }
 */

export default api;
