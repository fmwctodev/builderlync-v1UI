import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface Company {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesResponse {
  success: boolean;
  data: Company[];
}

export const getCompanies = async (contact_id?: number): Promise<CompaniesResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<CompaniesResponse>(
    contact_id ? `${API_BASE_URL}/companies?contact_id=${contact_id}` : `${API_BASE_URL}/companies`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data.data;
};