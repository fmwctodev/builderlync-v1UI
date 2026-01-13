import { apiClient } from '../utils/api';

interface OutlookStatus {
  connected: boolean;
  email?: string;
}

interface SendEmailData {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
}

interface EmailListParams {
  top?: number;
  skip?: number;
  filter?: string;
}

export const outlookApi = {
  getStatus: async (): Promise<OutlookStatus> => {
    return apiClient.get('/outlook/status');
  },

  connect: async (): Promise<{ authUrl: string }> => {
    const response = await apiClient.get<{ authUrl: string }>('/outlook/auth');
    window.location.href = response.authUrl;
    return response;
  },

  disconnect: async (): Promise<{ success: boolean }> => {
    return apiClient.delete('/outlook/disconnect');
  },

  sendEmail: async (emailData: SendEmailData): Promise<{ success: boolean }> => {
    return apiClient.post('/outlook/send', emailData);
  },

  getEmails: async (params?: EmailListParams): Promise<{ emails: any[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.top) queryParams.append('top', params.top.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.filter) queryParams.append('filter', params.filter);
    
    const query = queryParams.toString();
    return apiClient.get(`/outlook/emails${query ? `?${query}` : ''}`);
  },

  getEmailById: async (messageId: string): Promise<{ email: any }> => {
    return apiClient.get(`/outlook/emails/${messageId}`);
  },

  markAsRead: async (messageId: string): Promise<{ success: boolean }> => {
    return apiClient.patch(`/outlook/emails/${messageId}/read`, {});
  }
};
