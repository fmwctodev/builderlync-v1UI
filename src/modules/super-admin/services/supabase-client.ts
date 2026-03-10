/**
 * Super Admin API Client
 * 
 * Uses backend API instead of direct Supabase calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock supabase for compatibility
export const supabase = null as any;
export const supabaseAdmin = null as any;

// API client for super admin operations
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export const isServiceRoleConfigured = (): boolean => true;
export const getServiceRoleErrorMessage = (): string => '';

export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
