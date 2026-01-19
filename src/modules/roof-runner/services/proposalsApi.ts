import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export interface Address {
  uuid?: string;
  address: string;
  locality?: string;
  region_code?: string;
  postal_code?: string;
  lat?: string;
  lng?: string;
}

export interface ContractorSignature {
  name: string;
  font_type: string;
}

export interface Proposal {
  data: Proposal;
  id: number;
  type: string;
  title: string;
  status: 'incomplete' | 'complete' | 'sent' | 'signed';
  identifier: string;
  template_id?: string;
  sections: any;
  author_id: number;
  assignee_id: number;
  job_id?: number;
  total: number;
  address?: Address;
  contractor_signature?: ContractorSignature;
  created_at: string;
  updated_at: string;
  report_id?: string;
  report?: any;
}

export interface CreateProposalRequest {
  template_id?: string;
  job_id?: number;
  title?: string;
  address?: Address;
  contractor_signature?: ContractorSignature;
  report_id?: string;
}

export interface UpdateProposalRequest {
  title?: string;
  status?: 'incomplete' | 'complete' | 'sent' | 'signed' | 'lost';
  sections?: any;
  total?: number;
  total_manual?: number;
  notes?: string;
  address?: Address;
  contractor_signature?: ContractorSignature;
}

export const proposalsApi = {
  async createProposal(data: CreateProposalRequest): Promise<Proposal> {
    try {
      const response = await axios.post(`${API_BASE_URL}/proposals`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },

  async getProposals(filters?: { status?: string; job_id?: number }): Promise<Proposal[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All proposals') {
        const statusMap: Record<string, string> = {
          'Draft': 'incomplete',
          'Open': 'open',
          'Sent': 'sent',
          'Won': 'signed',
          'Lost': 'lost'
        };
        const apiStatus = statusMap[filters.status] || filters.status;
        params.append('status', apiStatus);
      }
      if (filters?.job_id) params.append('job_id', filters.job_id.toString());

      const url = params.toString() ? `${API_BASE_URL}/proposals?${params.toString()}` : `${API_BASE_URL}/proposals`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },

  async getProposalById(id: number): Promise<Proposal> {
    try {
      const response = await axios.get(`${API_BASE_URL}/proposals/${id}?select=report.response_data.ReportIds`, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  },

  async updateProposal(id: number, data: UpdateProposalRequest): Promise<Proposal> {
    try {
      const response = await axios.put(`${API_BASE_URL}/proposals/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  },

  async deleteProposal(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/proposals/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  },

  async duplicateProposal(id: number): Promise<Proposal> {
    try {
      const response = await axios.post(`${API_BASE_URL}/proposals/${id}/duplicate`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error duplicating proposal:', error);
      throw error;
    }
  },
};
