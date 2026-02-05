import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface CloudDriveConnection {
  id: string;
  user_id: string;
  provider: 'google_drive' | 'onedrive_personal' | 'onedrive_business';
  access_token?: string;
  refresh_token?: string;
  provider_user_id?: string;
  provider_email?: string;
  token_expires_at?: string;
  connected_at: string;
  last_synced_at?: string;
  status: 'active' | 'expired' | 'error' | 'disconnected';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const cloudDriveApi = {
  async getConnection(): Promise<CloudDriveConnection | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch connection');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server.');
      }
      throw error;
    }
  },

  async getCurrentUserConnection(): Promise<CloudDriveConnection | null> {
    return this.getConnection();
  },

  async createConnection(
    provider: CloudDriveConnection['provider'],
    connectionData: Partial<CloudDriveConnection>
  ): Promise<CloudDriveConnection> {
    console.log("connectionData", connectionData);
    const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        access_token: connectionData.access_token,
        refresh_token: connectionData.refresh_token,
        token_expires_at: connectionData.token_expires_at,
        connected_at: connectionData.connected_at || new Date().toISOString(),
        metadata: connectionData.metadata || {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create connection');
    }

    const data = await response.json();
    return data.data;
  },

  async createConnectionFromOAuth(
    provider: CloudDriveConnection['provider'],
    oauthData: { access_token: string; refresh_token: string; expires_at: string; metadata?: any }
  ): Promise<CloudDriveConnection> {
    const payload = {
      provider,
      access_token: oauthData.access_token,
      refresh_token: oauthData.refresh_token,
      token_expires_at: oauthData.expires_at,
      connected_at: new Date().toISOString(),
      metadata: oauthData.metadata || {}
    };
    console.log('OAuth payload:', payload);

    const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create connection');
    }

    const data = await response.json();
    return data.data;
  },

  async updateConnection(
    connectionId: string,
    updates: Partial<CloudDriveConnection>
  ): Promise<CloudDriveConnection> {
    const response = await fetch(`${API_BASE_URL}/file-manager/connection/${connectionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update connection');
    }

    const data = await response.json();
    return data.data;
  },

  async deleteConnection(connectionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/file-manager/connection/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete connection');
    }
  },

  async disconnectCurrentUser(): Promise<void> {
    const connection = await this.getCurrentUserConnection();
    if (connection) {
      await this.deleteConnection(connection.id);
    }
  },

  async updateConnectionStatus(
    connectionId: string,
    status: CloudDriveConnection['status']
  ): Promise<CloudDriveConnection> {
    return this.updateConnection(connectionId, { status });
  },

  async updateLastSyncTime(connectionId: string): Promise<CloudDriveConnection> {
    return this.updateConnection(connectionId, { last_synced_at: new Date().toISOString() });
  },

  getProviderName(provider: CloudDriveConnection['provider']): string {
    const names = {
      google_drive: 'Google Drive',
      onedrive_personal: 'OneDrive',
      onedrive_business: 'OneDrive Business',
    };
    return names[provider];
  },

  isConnectionExpired(connection: CloudDriveConnection): boolean {
    if (!connection.token_expires_at) return false;
    return new Date(connection.token_expires_at) < new Date();
  },

  isConnectionActive(connection: CloudDriveConnection): boolean {
    return connection.status === 'active' && !this.isConnectionExpired(connection);
  },

  async syncFiles(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/file-manager/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to sync files');
        } else {
          throw new Error(`Server error: ${response.status} - Backend server may not be running on port 3100`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server returned HTML instead of JSON. Check if the API endpoint exists.');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Sync files error:', error);
      if ((error as any).message.includes('Unexpected token')) {
        throw new Error('Backend server is not running or API endpoint does not exist');
      }
      throw error;
    }
  },
};