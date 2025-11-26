import { supabase } from '../lib/supabase';

export type CloudProvider = 'google_drive' | 'onedrive';

export interface CloudConnection {
  id: string;
  organization_id: string;
  user_id: string;
  provider: CloudProvider;
  account_email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  is_connected: boolean;
  last_sync_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  isFolder: boolean;
}

export interface CloudFolder {
  id: string;
  name: string;
  parentId?: string;
}

class CloudDriveService {
  private async getOrganizationId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: staffData, error } = await supabase
      .from('staff')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !staffData) {
      throw new Error('Organization not found for user');
    }

    return staffData.organization_id;
  }

  async getConnection(provider: CloudProvider): Promise<CloudConnection | null> {
    const organizationId = await this.getOrganizationId();

    const { data, error } = await supabase
      .from('cloud_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('provider', provider)
      .eq('is_connected', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAllConnections(): Promise<CloudConnection[]> {
    const organizationId = await this.getOrganizationId();

    const { data, error } = await supabase
      .from('cloud_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_connected', true);

    if (error) throw error;
    return data || [];
  }

  async saveConnection(
    provider: CloudProvider,
    accountEmail: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    metadata?: Record<string, any>
  ): Promise<CloudConnection> {
    const organizationId = await this.getOrganizationId();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { data, error } = await supabase
      .from('cloud_connections')
      .upsert({
        organization_id: organizationId,
        user_id: user.id,
        provider,
        account_email: accountEmail,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        is_connected: true,
        metadata: metadata || {}
      }, {
        onConflict: 'organization_id,provider,account_email'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async disconnectProvider(provider: CloudProvider): Promise<void> {
    const organizationId = await this.getOrganizationId();

    const { error } = await supabase
      .from('cloud_connections')
      .update({ is_connected: false })
      .eq('organization_id', organizationId)
      .eq('provider', provider);

    if (error) throw error;
  }

  async updateLastSync(provider: CloudProvider): Promise<void> {
    const organizationId = await this.getOrganizationId();

    const { error } = await supabase
      .from('cloud_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('provider', provider);

    if (error) throw error;
  }

  initiateGoogleDriveAuth(): string {
    const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/oauth/google-drive/callback`;
    const scope = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    return authUrl;
  }

  initiateOneDriveAuth(): string {
    const clientId = import.meta.env.VITE_ONEDRIVE_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/oauth/onedrive/callback`;
    const scope = 'Files.Read Files.Read.All Files.ReadWrite Files.ReadWrite.All offline_access';

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&response_mode=query`;

    return authUrl;
  }

  async exchangeGoogleDriveCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    email: string;
  }> {
    const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '';
    const clientSecret = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_SECRET || '';
    const redirectUri = `${window.location.origin}/oauth/google-drive/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      email: userInfo.email,
    };
  }

  async exchangeOneDriveCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    email: string;
  }> {
    const clientId = import.meta.env.VITE_ONEDRIVE_CLIENT_ID || '';
    const clientSecret = import.meta.env.VITE_ONEDRIVE_CLIENT_SECRET || '';
    const redirectUri = `${window.location.origin}/oauth/onedrive/callback`;

    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();

    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      email: userInfo.userPrincipalName || userInfo.mail,
    };
  }

  async listGoogleDriveFiles(folderId?: string): Promise<CloudFile[]> {
    const connection = await this.getConnection('google_drive');
    if (!connection) throw new Error('Google Drive not connected');

    const query = folderId
      ? `'${folderId}' in parents and trashed=false`
      : `'root' in parents and trashed=false`;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch Google Drive files');

    const data = await response.json();

    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: parseInt(file.size || '0'),
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    }));
  }

  async listOneDriveFiles(folderId?: string): Promise<CloudFile[]> {
    const connection = await this.getConnection('onedrive');
    if (!connection) throw new Error('OneDrive not connected');

    const endpoint = folderId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`
      : 'https://graph.microsoft.com/v1.0/me/drive/root/children';

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch OneDrive files');

    const data = await response.json();

    return data.value.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.file?.mimeType || 'folder',
      size: file.size || 0,
      modifiedTime: file.lastModifiedDateTime,
      webViewLink: file.webUrl,
      thumbnailLink: file.thumbnails?.[0]?.medium?.url,
      isFolder: !!file.folder,
    }));
  }

  async downloadGoogleDriveFile(fileId: string): Promise<Blob> {
    const connection = await this.getConnection('google_drive');
    if (!connection) throw new Error('Google Drive not connected');

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to download file from Google Drive');

    return await response.blob();
  }

  async downloadOneDriveFile(fileId: string): Promise<Blob> {
    const connection = await this.getConnection('onedrive');
    if (!connection) throw new Error('OneDrive not connected');

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      }
    );

    if (!response.ok) throw new Error('Failed to download file from OneDrive');

    return await response.blob();
  }
}

export const cloudDriveService = new CloudDriveService();
