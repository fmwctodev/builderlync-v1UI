import { getAuthToken } from '../../../shared/utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

class QxoService {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async connectAccount(email: string, password: string) {
    try {
      const response = await this.makeRequest('/qxo/connect', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getStatus() {
    try {
      const response = await this.makeRequest('/qxo/status');
      return response;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async logout() {
    try {
      const response = await this.makeRequest('/qxo/logout', {
        method: 'POST',
      });
      return response;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export const qxoService = new QxoService();
