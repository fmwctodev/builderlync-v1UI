import type {
  Pipeline,
  PipelineStage,
  PipelineWithStages,
  PipelineFormData,
  JobType,
} from '../types/opportunities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

class PipelinesApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    const organizationSlug = localStorage.getItem('currentOrganizationSlug');

    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Organization-Slug': organizationSlug || '',
    };
  }

  async getPipelines(jobType?: JobType): Promise<PipelineWithStages[]> {
    try {
      const url = new URL(`${API_BASE_URL}/pipelines`);
      if (jobType) {
        url.searchParams.set('job_type', jobType);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pipelines');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  }

  async getPipelinesByJobType(jobType: JobType): Promise<PipelineWithStages[]> {
    return this.getPipelines(jobType);
  }

  async getPipelineById(id: string): Promise<PipelineWithStages | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pipeline');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      throw error;
    }
  }

  async getPipelineStages(pipeline_id: string): Promise<PipelineStage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${pipeline_id}/stages`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pipeline stages');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
      throw error;
    }
  }

  async createPipeline(formData: PipelineFormData): Promise<PipelineWithStages> {
    try {
      console.log('Creating pipeline with data:', formData);

      const response = await fetch(`${API_BASE_URL}/pipelines`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create pipeline');
      }

      console.log('Pipeline created successfully:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error creating pipeline:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the pipeline');
    }
  }

  async updatePipeline(id: string, formData: Partial<PipelineFormData>): Promise<Pipeline> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update pipeline');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating pipeline:', error);
      throw error;
    }
  }

  async deletePipeline(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete pipeline');
      }
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      throw error;
    }
  }

  async createDefaultPipeline(jobType: JobType = 'Commercial'): Promise<PipelineWithStages> {
    const pipelineNames: Record<JobType, string> = {
      Commercial: 'Default',
      Residential: 'Default',
      Insurance: 'Insurance Leads',
    };

    const defaultPipeline: PipelineFormData = {
      name: pipelineNames[jobType],
      description: `Pipeline for ${jobType.toLowerCase()} opportunities`,
      is_default: jobType === 'Commercial',
      job_type: jobType,
      stages: [
        { name: 'New Lead', color: '#dc2626', order_position: 0 },
        { name: 'Follow-up 1', color: '#2563eb', order_position: 1 },
        { name: 'Follow-up 2', color: '#eab308', order_position: 2 },
        { name: 'Follow-up 3', color: '#16a34a', order_position: 3 },
        { name: 'Long Term Follow Up', color: '#9333ea', order_position: 4 },
        { name: 'In Convo', color: '#10b981', order_position: 5 },
        { name: 'Inspection/Estimate Booked', color: '#059669', order_position: 6 },
        { name: 'Job Qualified', color: '#6366f1', order_position: 7 },
        { name: 'Job Unqualified', color: '#dc2626', order_position: 8 },
        { name: 'Job Won', color: '#16a34a', order_position: 9 },
        { name: 'Job Lost', color: '#991b1b', order_position: 10 },
      ],
    };

    return this.createPipeline(defaultPipeline);
  }

  async getOrCreateDefaultPipeline(): Promise<PipelineWithStages> {
    try {
      const pipelines = await this.getPipelines();

      if (pipelines.length === 0) {
        return await this.createDefaultPipeline();
      }

      const defaultPipeline = pipelines.find(p => p.is_default);
      return defaultPipeline || pipelines[0];
    } catch (error) {
      console.error('Error getting/creating default pipeline:', error);
      throw error;
    }
  }
}

export const pipelinesApi = new PipelinesApi();
