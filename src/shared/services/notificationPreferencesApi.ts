const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface NotificationPreference {
  userId: number;
  userType: 'user' | 'staff';
  pushEnabled: boolean;
  updatedAt?: string;
}

export const notificationPreferencesApi = {
  async getPreferences(): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Failed to fetch notification preferences');
    }

    return result.data;
  },

  async updatePushEnabled(pushEnabled: boolean): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pushEnabled }),
    });

    const result = await response.json();
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Failed to update notification preferences');
    }

    return result.data;
  },
};

