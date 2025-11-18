import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface QuickBooksStatus {
  connected: boolean;
  companyInfo: {
    Name?: string;
  } | null;
}

export interface QuickBooksConnectResponse {
  success: boolean;
  data: {
    authUrl: string;
  };
  message: string;
}

export interface QuickBooksStatusResponse {
  success: boolean;
  data: QuickBooksStatus;
  message: string;
}

export interface QuickBooksResponse {
  success: boolean;
  message: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const connectQuickBooks = async (): Promise<QuickBooksConnectResponse> => {
  const response = await axios.post<QuickBooksConnectResponse>(
    `${API_BASE_URL}/quickbooks/connect`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const getQuickBooksStatus = async (): Promise<QuickBooksStatusResponse> => {
  const response = await axios.get<QuickBooksStatusResponse>(
    `${API_BASE_URL}/quickbooks/status`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const disconnectQuickBooks = async (): Promise<QuickBooksResponse> => {
  const response = await axios.post<QuickBooksResponse>(
    `${API_BASE_URL}/quickbooks/disconnect`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};