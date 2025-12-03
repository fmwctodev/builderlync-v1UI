import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  title?: string;
  department?: string;
  image?: string;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  title?: string;
  department?: string;
  image?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface StaffMember {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  extension: string;
  image?: string;
  status: string;
  title?: string;
  department?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data: StaffMember;
}

export interface StaffListResponse {
  success: boolean;
  data: StaffMember[];
  total: number;
}

class StaffApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getStaff(page: number = 1, limit: number = 100): Promise<StaffListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const result = await this.makeRequest(`/staff?${params}`);
      return {
        success: true,
        data: result.data || [],
        total: result.total || 0
      };
    } catch (error) {
      console.error('Error in getStaff:', error);
      return {
        success: false,
        data: [],
        total: 0
      };
    }
  }

  async getAllActiveStaff(): Promise<StaffMember[]> {
    try {
      const result = await this.makeRequest('/staff/active');
      return result.data || [];
    } catch (error) {
      console.error('Error in getAllActiveStaff:', error);
      return [];
    }
  }

  async createStaff(staffData: CreateStaffRequest): Promise<StaffResponse> {
    try {
      const result = await this.makeRequest('/staff', {
        method: 'POST',
        body: JSON.stringify(staffData),
      });

      return {
        success: true,
        message: 'Staff member created successfully',
        data: result.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to create staff member',
        data: {} as StaffMember
      };
    }
  }

  async updateStaff(id: string, staffData: UpdateStaffRequest): Promise<StaffResponse> {
    try {
      const result = await this.makeRequest(`/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(staffData),
      });

      return {
        success: true,
        message: 'Staff member updated successfully',
        data: result.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update staff member',
        data: {} as StaffMember
      };
    }
  }

  async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.makeRequest(`/staff/${id}`, {
        method: 'DELETE',
      });

      return {
        success: true,
        message: 'Staff member deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to delete staff member'
      };
    }
  }

  async getStaffById(id: string): Promise<StaffMember | null> {
    try {
      const result = await this.makeRequest(`/staff/${id}`);
      return result.data;
    } catch (error) {
      console.error('Error in getStaffById:', error);
      return null;
    }
  }
}

const staffApiService = new StaffApiService();

export const getStaff = staffApiService.getStaff.bind(staffApiService);
export const getAllActiveStaff = staffApiService.getAllActiveStaff.bind(staffApiService);
export const createStaff = staffApiService.createStaff.bind(staffApiService);
export const updateStaff = staffApiService.updateStaff.bind(staffApiService);
export const deleteStaff = staffApiService.deleteStaff.bind(staffApiService);
export const getStaffById = staffApiService.getStaffById.bind(staffApiService);