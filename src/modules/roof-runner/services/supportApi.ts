import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface SupportTicket {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export const supportApi = {
  async submitTicket(data: SupportTicket): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_BASE_URL}/support`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};
