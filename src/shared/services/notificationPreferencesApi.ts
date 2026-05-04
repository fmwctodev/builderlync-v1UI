import { getAuthToken } from '../utils/auth';

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

const getAuthHeaders = () => {
  const token = getAuthToken();
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

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.success) {
      throw new Error(
        result?.message ||
          result?.error ||
          `Failed to fetch notification preferences (${response.status})`
      );
    }

    return result.data;
  },

  async updatePushEnabled(pushEnabled: boolean): Promise<NotificationPreference> {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pushEnabled }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.success) {
      throw new Error(
        result?.message ||
          result?.error ||
          `Failed to update notification preferences (${response.status})`
      );
    }

    return result.data;
  },
};
