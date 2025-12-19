const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const getAuthUrl = async (platform: string) => {
  const response = await fetch(`${API_BASE_URL}/integrations/auth/${platform}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get auth URL' }));
    throw new Error(error.error || 'Failed to get auth URL');
  }
  
  const data = await response.json();
  return data.data.authUrl;
};

export const getGoogleAuthUrl = () => getAuthUrl('google_analytics');

export const handleCallback = async (platform: string, code: string, state?: string) => {
  const response = await fetch(`${API_BASE_URL}/integrations/callback/${platform}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code, state })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to connect' }));
    throw new Error(error.error || 'Failed to connect');
  }
  
  return await response.json();
};

export const exchangeCodeForToken = (code: string) => handleCallback('google_analytics', code);

export const getAnalyticsData = async (
  platform: string,
  startDate: string,
  endDate: string,
  accountId?: string
) => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    ...(accountId && { accountId })
  });
  
  const response = await fetch(`${API_BASE_URL}/integrations/analytics/${platform}?${params}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch data' }));
    throw new Error(error.error || 'Failed to fetch data');
  }
  
  return await response.json();
};

export const getIntegrations = async (platform?: string) => {
  const url = platform 
    ? `${API_BASE_URL}/integrations?platform=${platform}`
    : `${API_BASE_URL}/integrations`;
    
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) return { success: false, data: [] };
  return await response.json();
};

export const getConnectionStatus = () => getIntegrations('google_analytics');

export const disconnectIntegration = async (integrationId: string) => {
  const response = await fetch(`${API_BASE_URL}/integrations/${integrationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to disconnect' }));
    throw new Error(error.error || 'Failed to disconnect');
  }
  
  return await response.json();
};

export const disconnectGoogleAnalytics = async () => {
  const integrations = await getIntegrations('google_analytics');
  if (integrations.data?.[0]?.id) {
    await disconnectIntegration(integrations.data[0].id);
  }
  localStorage.removeItem('google_property_id');
};
