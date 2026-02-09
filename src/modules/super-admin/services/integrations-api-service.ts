import { supabase } from './supabase-client';
import axios from 'axios';

export interface IntegrationCredentials {
  twilio?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  stripe?: {
    secretKey: string;
    publishableKey: string;
    webhookSecret?: string;
  };
  jira?: {
    domain: string;
    email: string;
    apiToken: string;
    projectKey: string;
  };
  google_workspace?: {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}

export async function testTwilioConnection(credentials: IntegrationCredentials['twilio']): Promise<TestConnectionResult> {
  if (!credentials) {
    return { success: false, error: 'No credentials provided' };
  }

  try {
    const auth = btoa(`${credentials.accountSid}:${credentials.authToken}`);
    const response = await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}.json`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Twilio connection successful',
        details: {
          accountName: response.data.friendly_name,
          status: response.data.status,
        },
      };
    }

    return { success: false, error: 'Invalid response from Twilio' };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to connect to Twilio',
    };
  }
}

export async function testStripeConnection(credentials: IntegrationCredentials['stripe']): Promise<TestConnectionResult> {
  if (!credentials) {
    return { success: false, error: 'No credentials provided' };
  }

  try {
    const response = await axios.get('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${credentials.secretKey}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        message: 'Stripe connection successful',
        details: {
          accountId: response.data.id,
          accountName: response.data.business_profile?.name || response.data.email,
        },
      };
    }

    return { success: false, error: 'Invalid response from Stripe' };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to connect to Stripe',
    };
  }
}

export async function testJiraConnection(credentials: IntegrationCredentials['jira']): Promise<TestConnectionResult> {
  if (!credentials) {
    return { success: false, error: 'No credentials provided' };
  }

  try {
    const auth = btoa(`${credentials.email}:${credentials.apiToken}`);
    const response = await axios.get(
      `https://${credentials.domain}/rest/api/3/project/${credentials.projectKey}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Jira connection successful',
        details: {
          projectKey: response.data.key,
          projectName: response.data.name,
        },
      };
    }

    return { success: false, error: 'Invalid response from Jira' };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.errorMessages?.[0] || error.message || 'Failed to connect to Jira',
    };
  }
}

export async function testGoogleWorkspaceConnection(credentials: IntegrationCredentials['google_workspace']): Promise<TestConnectionResult> {
  if (!credentials || !credentials.accessToken) {
    return { success: false, error: 'No access token provided' };
  }

  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        message: 'Google Workspace connection successful',
        details: {
          email: response.data.email,
          name: response.data.name,
        },
      };
    }

    return { success: false, error: 'Invalid response from Google' };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error_description || error.message || 'Failed to connect to Google Workspace',
    };
  }
}

export async function saveIntegrationCredentials(
  integrationName: string,
  credentials: Partial<IntegrationCredentials[keyof IntegrationCredentials]>,
  configuration?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('super_admin_integrations')
      .update({
        status: 'connected',
        credentials: credentials as any,
        configuration: configuration || {},
        connected_at: new Date().toISOString(),
        connected_by: user.id,
        last_sync_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('integration_name', integrationName);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error saving integration credentials:', error);
    return { success: false, error: error.message };
  }
}

export async function disconnectIntegration(
  integrationName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_integrations')
      .update({
        status: 'disconnected',
        credentials: {},
        oauth_tokens: {},
        last_sync_at: null,
        last_error: null,
        connected_at: null,
        connected_by: null,
      })
      .eq('integration_name', integrationName);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error disconnecting integration:', error);
    return { success: false, error: error.message };
  }
}

export const OAuth2Config = {
  google_workspace: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar',
    ],
  },
};

export function generateOAuthUrl(
  integration: 'google_workspace',
  clientId: string,
  redirectUri: string
): string {
  const config = OAuth2Config[integration];
  const state = btoa(JSON.stringify({ integration, timestamp: Date.now() }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeOAuthCode(
  integration: 'google_workspace',
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ success: boolean; tokens?: any; error?: string }> {
  try {
    const config = OAuth2Config[integration];

    const response = await axios.post(
      config.tokenUrl,
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        tokens: response.data,
      };
    }

    return { success: false, error: 'Failed to exchange code for tokens' };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error_description || error.message || 'Failed to exchange OAuth code',
    };
  }
}
