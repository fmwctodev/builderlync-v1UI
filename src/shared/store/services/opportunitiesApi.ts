import { getAuthToken } from '../../utils/auth';
import type {
  Opportunity,
  OpportunityWithDetails,
  OpportunityFormData,
  OpportunityStatus,
  JobType,
} from '../../../modules/roof-runner/types/opportunities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

interface OpportunityFilters {
  pipeline_id?: string;
  stage_id?: string;
  status?: OpportunityStatus;
  owner_id?: string;
  job_type?: JobType;
}

class OpportunitiesApiService {
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
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunityWithDetails[]> {
    const params = new URLSearchParams();
    if (filters?.pipeline_id) params.append('pipeline_id', filters.pipeline_id);
    if (filters?.stage_id) params.append('stage_id', filters.stage_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.owner_id) params.append('owner_id', filters.owner_id);

    const result = await this.makeRequest(`/opportunities?${params}`);
    return result.data || [];
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
}

export const opportunitiesBackendApi = new OpportunitiesApiService();
