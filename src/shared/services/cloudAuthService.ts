import { cloudDriveApi, CloudDriveConnection } from './cloudDriveApi';
import { logoutAndRedirect } from '../utils/auth';

const request = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  if (response.status === 401) {
    logoutAndRedirect();
    throw new Error('Unauthorized');
  }
  return response;
};

export type CloudProvider = 'google' | 'onedrive_personal' | 'onedrive_business';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
}

const OAUTH_CONFIGS: Record<CloudProvider, OAuthConfig> = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/google/callback`,
    scope: 'https://www.googleapis.com/auth/drive',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  onedrive_personal: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/microsoft/callback`,
    scope: 'Files.ReadWrite offline_access',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  },
  onedrive_business: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/microsoft/callback`,
    scope: 'Files.ReadWrite offline_access',
    authUrl: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize'
  }
};

export const cloudAuthService = {
  /**
   * Initiate OAuth flow for a cloud provider
   */
  async initiateOAuth(provider: CloudProvider): Promise<void> {
    const config = OAUTH_CONFIGS[provider];
    if (!config.clientId || config.clientId.includes('your_')) {
      throw new Error(`OAuth not configured for ${provider}. Please set up the client ID in environment variables.`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope,
      access_type: 'offline',
      prompt: 'consent',
      state: JSON.stringify({ provider, timestamp: Date.now() })
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    // Save current path to return to after callback
    localStorage.setItem('oauth_return_path', window.location.pathname + window.location.search);

    window.location.href = authUrl;
  },

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleOAuthCallback(code: string, state: string): Promise<CloudDriveConnection> {
    try {
      const stateData = JSON.parse(state);
      const provider = stateData.provider;

      const response = await request(`${API_BASE_URL}/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code,
          provider,
          redirectUri: OAUTH_CONFIGS[provider as CloudProvider].redirectUri
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange OAuth code');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid OAuth response');
      }

      const data = result.data;

      // Create connection record
      let dbProvider: 'google_drive' | 'onedrive_personal' | 'onedrive_business' = 'google_drive';
      if (provider === 'onedrive_personal') dbProvider = 'onedrive_personal';
      else if (provider === 'onedrive_business') dbProvider = 'onedrive_business';

      const connection = await cloudDriveApi.createConnectionFromOAuth(
        dbProvider,
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          metadata: data.metadata || {}
        }
      );

      return connection;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  },

  /**
   * Refresh access token for a connection
   */
  async refreshToken(connection: CloudDriveConnection): Promise<CloudDriveConnection> {
    if (!connection.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await request(`${API_BASE_URL}/auth/oauth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          refresh_token: connection.refresh_token,
          provider: connection.provider
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      // Update connection with new tokens
      const updatedConnection = await cloudDriveApi.updateConnection(connection.id, {
        access_token: data.access_token,
        refresh_token: data.refresh_token || connection.refresh_token,
        token_expires_at: data.expires_at,
        status: 'active'
      });

      return updatedConnection;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Mark connection as expired
      await cloudDriveApi.updateConnectionStatus(connection.id, 'expired');
      throw error;
    }
  },

  /**
   * Get valid access token for a connection (refresh if needed)
   */
  async getValidAccessToken(connection: CloudDriveConnection): Promise<string> {
    if (cloudDriveApi.isConnectionActive(connection)) {
      return connection.access_token!;
    }

    if (cloudDriveApi.isConnectionExpired(connection) && connection.refresh_token) {
      const refreshedConnection = await this.refreshToken(connection);
      return refreshedConnection.access_token!;
    }

    throw new Error('Connection is not active and cannot be refreshed');
  }
};