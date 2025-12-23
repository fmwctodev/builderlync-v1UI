import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const authApi = {
  async checkCompanySlug(slug: string): Promise<{ available: boolean }> {
    const response = await axios.get(`${API_BASE_URL}/auth/check-company-slug/${slug}`);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await axios.post(
      `${API_BASE_URL}/auth/change-password`,
      { currentPassword, newPassword },
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};
