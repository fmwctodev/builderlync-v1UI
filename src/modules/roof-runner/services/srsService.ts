interface SRSCredentials {
  username: string;
  password: string;
  branchId?: string;
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

class SRSService {
  private token: string | null = null;

  async authenticate(credentials: SRSCredentials): Promise<{ success: boolean; user?: SRSUser; message?: string }> {
    try {
      const response = await fetch('/api/srs/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('srs_connected', 'true');
        return { 
          success: true, 
          user: { id: 'srs_user', username: 'SRS User', email: '', branchId: '', isActive: true }
        };
      }
      
      return { success: false, message: data.message || 'Connection failed' };
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
      const response = await fetch('/api/srs/validate');
      
      if (response.ok) {
        const data = await response.json();
        return data.connected || false;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('srs_connected') === 'true' ? 'connected' : null;
  }

  logout(): void {
    localStorage.removeItem('srs_connected');
  }
}

export const srsService = new SRSService();