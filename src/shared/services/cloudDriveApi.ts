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
  async getConnection(userId: string): Promise<CloudDriveConnection | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
    return this.getConnection('current');
  },

  async createConnection(
    provider: CloudDriveConnection['provider'],
    connectionData: Partial<CloudDriveConnection>
  ): Promise<CloudDriveConnection> {
    const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider, ...connectionData })
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
      onedrive_personal: 'OneDrive Personal',
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
};
