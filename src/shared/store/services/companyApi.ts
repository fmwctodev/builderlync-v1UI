import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface Company {
  id?: number;
  name: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyRequest {
  name: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export const getCompanies = async (page: number = 1, limit: number = 10, search?: string) => {
  const token = localStorage.getItem('token');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (search) {
    params.append('search', search);
  }

  const response = await axios.get(
    `${API_BASE_URL}/companies?${params.toString()}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createCompany = async (companyData: CreateCompanyRequest) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/companies`,
    companyData,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateCompany = async (id: number, companyData: Partial<CreateCompanyRequest>) => {
  const token = localStorage.getItem('token');

  const response = await axios.put(
    `${API_BASE_URL}/companies/${id}`,
    companyData,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const deleteCompany = async (id: number) => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/companies/${id}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};