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

      console.log('API: Attempting to fetch opportunities from backend...');
      const result = await this.makeRequest(`/opportunities?${params}`);
      console.log('API: Backend response:', result);
      return result.data || [];
    } catch (error) {
      console.error('API: Failed to fetch opportunities, using mock data:', error);
      // Return mock data for development
      const mockData = this.getMockOpportunities();
      console.log('API: Returning mock data:', mockData);
      return mockData;
    }
  }

  private getMockOpportunities(): OpportunityWithDetails[] {
    return [
      {
        id: '1',
        opportunity_name: 'Residential Roof Repair - Smith House',
        business_name: 'Smith Family',
        value: 15000,
        stage_id: 'new-lead',
        pipeline_id: '1',
        source: 'Website',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: ""
      },
      {
        id: '2',
        opportunity_name: 'Commercial Building Roof Replacement',
        business_name: 'ABC Corp',
        value: 85000,
        stage_id: 'contacted',
        pipeline_id: '1',
        source: 'Referral',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: ""
      },
      {
        id: '3',
        opportunity_name: 'Insurance Claim - Storm Damage',
        business_name: 'Johnson Residence',
        value: 25000,
        stage_id: 'qualified',
        pipeline_id: '1',
        source: 'Insurance',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: ""
      },
      {
        id: '4',
        opportunity_name: 'New Construction - Office Complex',
        business_name: 'XYZ Development',
        value: 150000,
        stage_id: 'proposal-sent',
        pipeline_id: '1',
        source: 'Cold Call',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: ""
      },
      {
        id: '5',
        opportunity_name: 'Residential Re-roofing Project',
        business_name: 'Williams Family',
        value: 18000,
        stage_id: 'won',
        pipeline_id: '1',
        source: 'Google Ads',
        status: 'won',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: ""
      },
    ];
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
}

export const opportunitiesBackendApi = new OpportunitiesApiService();
