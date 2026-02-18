import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

// Signature Types
export interface Signature {
  id?: string;
  html_content: string;
  enable_signature: boolean;
  include_in_replies: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SignatureResponse {
  success: boolean;
  message?: string;
  data: Signature;
}

// Email Connection Types
export interface EmailConnection {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo';
  status: 'connected' | 'disconnected';
  connected_at?: string;
}

export interface EmailConnectionsResponse {
  success: boolean;
  data: {
    connections: EmailConnection[];
    bcc_email: string;
  };
}

// 2FA Types
export interface TwoFactorStatus {
  is_enabled: boolean;
  methods: string[];
}

export interface TwoFactorSetup {
  qr_code: string;
  secret: string;
  backup_codes: string[];
}

export interface ProposalSettings {
  enableCompanyRepresentativeSignature: boolean;
  signatureFullName: string;
}

// Signature API
export const getSignature = async (): Promise<SignatureResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<SignatureResponse>(
    `${API_BASE_URL}/profile/signature`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const updateSignature = async (data: {
  htmlContent: string;
  enableSignature: boolean;
  includeInReplies: boolean;
}): Promise<SignatureResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.put<SignatureResponse>(
    `${API_BASE_URL}/profile/signature`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Email Connections API
export const getEmailConnections = async (): Promise<EmailConnectionsResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<EmailConnectionsResponse>(
    `${API_BASE_URL}/profile/email-connections`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const connectEmail = async (data: {
  provider: string;
  authCode: string;
  email: string;
  state?: string;
}): Promise<{ success: boolean; message?: string; data: EmailConnection }> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_BASE_URL}/profile/email-connections`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const disconnectEmail = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `${API_BASE_URL}/profile/email-connections/${id}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Two-Factor Authentication API
export const get2FAStatus = async (): Promise<{ success: boolean; data: TwoFactorStatus }> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_BASE_URL}/profile/2fa`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const setup2FA = async (): Promise<{ success: boolean; data: TwoFactorSetup }> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_BASE_URL}/profile/2fa/setup`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const verify2FA = async (code: string): Promise<{ success: boolean; message?: string }> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_BASE_URL}/profile/2fa/verify`,
    { code },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const disable2FA = async (password: string): Promise<{ success: boolean; message?: string }> => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `${API_BASE_URL}/profile/2fa`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { password }
    }
  );
  return response.data;
};

// Proposal Settings API
export const getProposalSettings = async (): Promise<{ success: boolean; data: ProposalSettings }> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_BASE_URL}/profile/proposal-settings`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const updateProposalSettings = async (data: ProposalSettings): Promise<{ success: boolean; message?: string; data: ProposalSettings }> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${API_BASE_URL}/profile/proposal-settings`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};
