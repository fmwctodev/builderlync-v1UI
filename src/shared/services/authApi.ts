import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export const authApi = {
  async checkCompanySlug(slug: string): Promise<{ available: boolean }> {
    const response = await axios.get(`${API_BASE_URL}/auth/check-company-slug/${slug}`);
    return response.data;
  }
};
