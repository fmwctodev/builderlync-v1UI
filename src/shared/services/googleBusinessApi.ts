import { apiClient } from '../utils/api';

export const googleBusinessApi = {
  connect: async () => {
    const response = await apiClient.get('/google-analytics/google-business/connect');
    if (response.data?.authUrl) {
      window.location.href = response.data.authUrl;
    }
    return response;
  },

  getLocations: async () => {
    return apiClient.get('/google-analytics/google-business/locations');
  },

  getInsights: async (locationName: string, startDate?: string, endDate?: string) => {
    return apiClient.get('/google-analytics/google-business/insights', {
      params: { locationName, startDate, endDate }
    });
  }
};
