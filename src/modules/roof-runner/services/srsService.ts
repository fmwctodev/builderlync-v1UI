interface SRSCredentials {
  accountNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api';

class SRSService {
  private getHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async authenticate(credentials: SRSCredentials): Promise<{ success: boolean; user?: SRSUser; message?: string }> {
    try {
      const result = await this.saveCustomerProfile(
        credentials.accountNumber,
        credentials.invoiceNumber,
        credentials.invoiceDate
      );
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
      const response = await fetch(`${API_BASE_URL}/srs/branches`, {
        headers: this.getHeaders()
      });
      
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

  async searchProducts(query: string, page = 1, limit = 50, branchCode?: string): Promise<{ data: any[]; pagination?: any }> {
    try {
      const url = new URL(`${API_BASE_URL}/srs/items`);
      url.searchParams.append('search', query);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      if (branchCode) {
        url.searchParams.append('branchCode', branchCode);
      }

      const response = await fetch(url.toString(), {
        headers: this.getHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
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
        headers: this.getHeaders()
      });
      return response.json();
    } catch (error) {
      return { success: false, message: 'Failed to load SRS customer profile' };
    }
  }

  async validateCustomer(
    accountNumber: string,
    invoiceNumber: string,
    invoiceDate: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/srs/validate-customer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ accountNumber, invoiceNumber, invoiceDate })
      });
      return response.json();
    } catch (error) {
      return { success: false, message: 'Failed to validate SRS customer profile' };
    }
  }

  async saveCustomerProfile(
    accountNumber: string,
    invoiceNumber: string,
    invoiceDate: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/srs/customer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ accountNumber, invoiceNumber, invoiceDate })
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
        headers: this.getHeaders()
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
