import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export interface ShareTokenResponse {
  token: string;
  shareUrl: string;
  expiresAt: string;
}

export interface SendEmailRequest {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  expiresInDays?: number;
}

export interface ProposalToken {
  id: number;
  token: string;
  shareUrl: string;
  createdAt: string;
  expiresAt: string;
  accessedCount: number;
  lastAccessedAt: string | null;
  isActive: boolean;
}

export const proposalSharingApi = {
  // Generate share token
  generateToken: async (proposalId: number, expiresInDays: number = 30): Promise<ShareTokenResponse> => {
    const response = await axios.post(`${API_BASE_URL}/proposals/${proposalId}/generate-token`, {
      expiresInDays
    }, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  // Send proposal email
  sendEmail: async (proposalId: number, data: SendEmailRequest): Promise<ShareTokenResponse> => {
    const response = await axios.post(`${API_BASE_URL}/proposals/${proposalId}/send-email`, data, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  // Get proposal by token (public, no auth)
  getProposalByToken: async (token: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/proposals/by-token/${token}`);
    return response.data.data;
  },

  // List all tokens for a proposal
  listTokens: async (proposalId: number): Promise<ProposalToken[]> => {
    const response = await axios.get(`${API_BASE_URL}/proposals/${proposalId}/tokens`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  },

  // Revoke a token
  revokeToken: async (token: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/proposals/tokens/${token}`, {
      headers: getAuthHeaders(),
    });
  }
};
