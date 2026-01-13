import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface BackendProposal {
  id: number;
  title: string;
  type: string;
  status: string;
  job_id?: number;
  author_id: number;
  assignee_id: number;
  total: number;
  identifier: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  assignee?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface BackendProposalsResponse {
  success: boolean;
  data: BackendProposal[];
  message?: string;
}

class BackendProposalsApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProposalsByJobId(jobId: number): Promise<BackendProposalsResponse> {
    try {
      const response = await this.makeRequest(`/proposals?job_id=${jobId}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error fetching proposals by job ID:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch proposals'
      };
    }
  }

  async getAllProposals(): Promise<BackendProposalsResponse> {
    try {
      const response = await this.makeRequest('/proposals');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('Error fetching all proposals:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch proposals'
      };
    }
  }
}

const backendProposalsApiService = new BackendProposalsApiService();

export const getBackendProposalsByJobId = backendProposalsApiService.getProposalsByJobId.bind(backendProposalsApiService);
export const getAllBackendProposals = backendProposalsApiService.getAllProposals.bind(backendProposalsApiService);