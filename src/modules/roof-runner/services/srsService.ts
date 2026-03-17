interface SRSCredentials {
  customerCode: string;
}

interface SRSBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface SRSUser {
  id: string;
  username: string;
  email: string;
  branchId: string;
  isActive: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api';

class SRSService {
  async authenticate(credentials: SRSCredentials): Promise<{ success: boolean; user?: SRSUser; message?: string }> {
    try {
      const result = await this.saveCustomerProfile(credentials.customerCode);
      if (result.success && result.data?.connected) {
        return {
          success: true,
          user: { id: 'srs_user', username: 'SRS User', email: '', branchId: '', isActive: true }
        };
      }

      return { success: false, message: result.message || 'Connection failed' };
    } catch (error) {
      return { success: false, message: 'Connection error' };
    }
  }

  async getBranches(): Promise<SRSBranch[]> {
    try {
      const response = await fetch('/api/srs/branches');
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const result = await this.getCustomerProfile();
      return Boolean(result?.success && result.data?.connected);
    } catch (error) {
      return false;
    }
  }

  async searchProducts(query: string, page = 1, limit = 50): Promise<{ data: any[]; pagination?: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/srs/items/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (response.ok) {
        const result = await response.json();
        // Handle nested data structure: result.data.data
        if (result.success && result.data) {
          return {
            data: result.data.data || [],
            pagination: result.data.pagination
          };
        }
        return { data: [] };
      }
      
      return { data: [] };
    } catch (error) {
      console.error('SRS search error:', error);
      return { data: [] };
    }
  }

  async getCustomerProfile(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/srs/customer`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    } catch (error) {
      return { success: false, message: 'Failed to load SRS customer profile' };
    }
  }

  async saveCustomerProfile(customerCode: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/srs/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ customerCode })
      });
      return response.json();
    } catch (error) {
      return { success: false, message: 'Failed to save SRS customer profile' };
    }
  }

  async deleteCustomerProfile(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/srs/customer`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    } catch (error) {
      return { success: false, message: 'Failed to delete SRS customer profile' };
    }
  }

  async logout(): Promise<void> {
    await this.deleteCustomerProfile();
  }
}

export const srsService = new SRSService();
