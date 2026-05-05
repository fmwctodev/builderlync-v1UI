import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const emailOAuthService = {
  async handleOAuthCallback(code: string, state: string, provider: 'gmail' | 'outlook') {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/profile/email-connections`,
        {
          provider,
          authCode: code,
          state
        },
        {
          headers: getAuthHeaders()
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to connect email account');
    }
  }
};
