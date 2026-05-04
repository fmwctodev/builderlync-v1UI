import { getAuthToken } from '../../utils/auth';
import type {
  Opportunity,
  OpportunityWithDetails,
  OpportunityFormData,
  OpportunityStatus,
  JobType,
} from '../../../modules/roof-runner/types/opportunities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

interface OpportunityFilters {
  pipeline_id?: string;
  stage_id?: string;
  status?: OpportunityStatus;
  owner_id?: string;
  job_type?: JobType;
  search?: string;
}

class OpportunitiesApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunityWithDetails[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.pipeline_id) params.append('pipeline_id', filters.pipeline_id);
      if (filters?.stage_id) params.append('stage_id', filters.stage_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);
      if (filters?.job_type) params.append('job_type', filters.job_type);
      if (filters?.search) params.append('search', filters.search);

      console.log('API: Fetching opportunities with params:', params.toString());
      const result = await this.makeRequest(`/opportunities?${params}`);
      console.log('API: Backend response:', result);
      return result.data || [];
    } catch (error) {
      console.error('API: Failed to fetch opportunities:', error);
      throw error;
    }
  }

  async getOpportunityById(id: string): Promise<OpportunityWithDetails | null> {
    const result = await this.makeRequest(`/opportunities/${id}`);
    return result.data;
  }

  async createOpportunity(formData: OpportunityFormData): Promise<Opportunity> {
    const result = await this.makeRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    console.log("result", result);
    return result.data;
  }

  async updateOpportunity(id: string, formData: Partial<OpportunityFormData>): Promise<Opportunity> {
    const result = await this.makeRequest(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    return result.data;
  }

  async deleteOpportunity(id: string): Promise<void> {
    await this.makeRequest(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  async moveOpportunityToStage(id: string, stage_id: string): Promise<Opportunity> {
    const result = await this.makeRequest(`/opportunities/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ stage_id }),
    });
    return result.data;
  }

  async removeFollower(id: string, userId: string): Promise<void> {
    await this.makeRequest(`/opportunities/${id}/followers/${userId}`, {
      method: 'DELETE',
    });
  }

  async createJobFromOpportunity(id: string, stage_id: string): Promise<any> {
    return this.makeRequest(`/jobs/create-job-from-opportunity/${id}`, {
      method: 'POST',
      body: JSON.stringify({ stage_id }),
    });
  }
}

export const opportunitiesBackendApi = new OpportunitiesApiService();
