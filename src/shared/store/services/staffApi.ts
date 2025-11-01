import axios from 'axios';

const API_BASE_URL = 'https://builderlyncapi.testenvapp.com/api';

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  password: string;
  image?: File;
}

export interface UpdateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  password?: string;
  image?: File;
}

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  extension: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffResponse {
  success: boolean;
  message: string;
  data: StaffMember;
}

export interface StaffListResponse {
  success: boolean;
  data: {
    data: StaffMember[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const getStaff = async (page: number = 1, limit: number = 10): Promise<StaffListResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<StaffListResponse>(
    `${API_BASE_URL}/staff?page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createStaff = async (staffData: CreateStaffRequest): Promise<StaffResponse> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('firstName', staffData.firstName);
  formData.append('lastName', staffData.lastName);
  formData.append('email', staffData.email);
  formData.append('phone', staffData.phone);
  formData.append('extension', staffData.extension);
  formData.append('password', staffData.password);
  
  if (staffData.image) {
    formData.append('image', staffData.image);
  }

  const response = await axios.post<StaffResponse>(
    `${API_BASE_URL}/staff`,
    formData,
    {
      headers: {
        'accept': '*/*',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateStaff = async (id: number, staffData: UpdateStaffRequest): Promise<StaffResponse> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('firstName', staffData.firstName);
  formData.append('lastName', staffData.lastName);
  formData.append('email', staffData.email);
  formData.append('phone', staffData.phone);
  formData.append('extension', staffData.extension);
  
  if (staffData.password) {
    formData.append('password', staffData.password);
  }
  
  if (staffData.image) {
    formData.append('image', staffData.image);
  }

  const response = await axios.put<StaffResponse>(
    `${API_BASE_URL}/staff/${id}`,
    formData,
    {
      headers: {
        'accept': '*/*',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const deleteStaff = async (id: number): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/staff/${id}`,
    {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};