import { supabase } from '../lib/supabase';

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
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('cloud_drive_connections')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cloud drive connection:', error);
      throw error;
    }

    return data;
  },

  async getCurrentUserConnection(): Promise<CloudDriveConnection | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    return this.getConnection(user.id);
  },

  async createConnection(
    provider: CloudDriveConnection['provider'],
    connectionData: Partial<CloudDriveConnection>
  ): Promise<CloudDriveConnection> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const existingConnection = await this.getConnection(user.id);
    if (existingConnection) {
      throw new Error('User already has a cloud drive connection. Please disconnect first.');
    }

    const { data, error } = await supabase
      .from('cloud_drive_connections')
      .insert({
        user_id: user.id,
        provider,
        status: 'active',
        ...connectionData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cloud drive connection:', error);
      throw error;
    }

    return data;
  },

  async updateConnection(
    connectionId: string,
    updates: Partial<CloudDriveConnection>
  ): Promise<CloudDriveConnection> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('cloud_drive_connections')
      .update(updates)
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cloud drive connection:', error);
      throw error;
    }

    return data;
  },

  async deleteConnection(connectionId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
      .from('cloud_drive_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      console.error('Error deleting cloud drive connection:', error);
      throw error;
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
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('cloud_drive_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating last sync time:', error);
      throw error;
    }

    return data;
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
