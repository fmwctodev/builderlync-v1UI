import axios from 'axios';
import { Campaign, CampaignFormData, CampaignStats } from '../../modules/roof-runner/types/campaigns';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const campaignsApi = {
  async createCampaign(data: CampaignFormData, sendNow: boolean): Promise<Campaign> {
    const payload = {
      ...data,
      scheduled_date: data.scheduled_date || null,
      status: sendNow ? 'sending' : data.scheduled_date ? 'scheduled' : 'draft',
      sent_at: sendNow ? new Date().toISOString() : null,
    };

    const response = await axios.post(`${API_BASE_URL}/campaigns`, payload, {
      headers: getAuthHeaders()
    });

    return response.data.data;
  },

  async updateCampaign(id: string, data: Partial<CampaignFormData>): Promise<Campaign> {
    const payload = {
      ...data,
      scheduled_date: data.scheduled_date || null
    };

    const response = await axios.put(`${API_BASE_URL}/campaigns/${id}`, payload, {
      headers: getAuthHeaders()
    });

    return response.data.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/campaigns/${id}`, {
      headers: getAuthHeaders()
    });
  },

  async getCampaigns(type?: string, status?: string, search?: string, page?: number, limit?: number): Promise<{ campaigns: Campaign[]; total: number; currentPage: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    try {
      const response = await axios.get(`${API_BASE_URL}/campaigns?${params.toString()}`, {
        headers: getAuthHeaders()
      });

      return {
        campaigns: response.data.data.campaigns || response.data.data || [],
        total: response.data.data.total || response.data.data.length || 0,
        currentPage: response.data.data.currentPage || page || 1,
        totalPages: response.data.data.totalPages || Math.ceil((response.data.data.total || response.data.data.length || 0) / (limit || 10))
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return {
        campaigns: [],
        total: 0,
        currentPage: 1,
        totalPages: 1
      };
    }
  },

  async getCampaign(id: string): Promise<Campaign> {
    const response = await axios.get(`${API_BASE_URL}/campaigns/${id}`, {
      headers: getAuthHeaders()
    });

    return response.data.data;
  },

  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}/stats`, {
        headers: getAuthHeaders()
      });

      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async sendCampaign(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/campaigns/${id}/send`, {}, {
      headers: getAuthHeaders()
    });
  },

  async cancelCampaign(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/campaigns/${id}/cancel`, {}, {
      headers: getAuthHeaders()
    });
  },

  async pauseCampaign(id: string): Promise<void> {
    await axios.put(`${API_BASE_URL}/campaigns/${id}`, { status: 'paused' }, {
      headers: getAuthHeaders()
    });
  },

  async duplicateCampaign(id: string): Promise<Campaign> {
    const response = await axios.post(`${API_BASE_URL}/campaigns/${id}/duplicate`, {}, {
      headers: getAuthHeaders()
    });

    return response.data.data;
  },

  async addRecipients(campaignId: string, contactIds: number[]): Promise<void> {
    await axios.post(`${API_BASE_URL}/campaigns/${campaignId}/recipients`, 
      { contactIds },
      { headers: getAuthHeaders() }
    );
  },

  async checkCredentials(service?: 'email' | 'sms'): Promise<{ email: boolean; sms: boolean }> {
    const params = service ? `?service=${service}` : '';
    const response = await axios.get(`${API_BASE_URL}/auth/user/credentials/check${params}`, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  },

  async getRecipientEstimate(filters: any): Promise<{ count: number; recipients: any[] }> {
    const response = await axios.post(`${API_BASE_URL}/campaigns/estimate`, filters, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  }
};
