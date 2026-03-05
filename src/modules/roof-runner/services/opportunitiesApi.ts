import { opportunitiesBackendApi } from '../../../shared/store/services/opportunitiesApi';
import type {
  Opportunity,
  OpportunityWithDetails,
  OpportunityFormData,
  JobType,
} from '../types/opportunities';

export const opportunitiesApi = {
  async getOpportunities(filters?: {
    pipeline_id?: string;
    job_type?: JobType;
    stage_id?: string;
    status?: 'open' | 'won' | 'lost';
    owner_id?: string;
  }): Promise<OpportunityWithDetails[]> {
    try {
      return await opportunitiesBackendApi.getOpportunities(filters);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  async getOpportunityById(id: string): Promise<OpportunityWithDetails | null> {
    try {
      return await opportunitiesBackendApi.getOpportunityById(id);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      throw error;
    }
  },

  async createOpportunity(formData: OpportunityFormData): Promise<Opportunity> {
    try {
      return await opportunitiesBackendApi.createOpportunity(formData);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  async updateOpportunity(id: string, formData: Partial<OpportunityFormData>): Promise<Opportunity> {
    try {
      return await opportunitiesBackendApi.updateOpportunity(id, formData);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  async moveOpportunityToStage(id: string, stage_id: string): Promise<Opportunity> {
    try {
      return await opportunitiesBackendApi.moveOpportunityToStage(id, stage_id);
    } catch (error) {
      console.error('Error moving opportunity:', error);
      throw error;
    }
  },

  async deleteOpportunity(id: string): Promise<void> {
    try {
      await opportunitiesBackendApi.deleteOpportunity(id);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  },

  async getOpportunitiesByJobType(jobType: JobType): Promise<OpportunityWithDetails[]> {
    return this.getOpportunities({ job_type: jobType });
  },

  async removeFollower(id: string, userId: string): Promise<void> {
    try {
      await opportunitiesBackendApi.removeFollower(id, userId);
    } catch (error) {
      console.error('Error removing follower:', error);
      throw error;
    }
  },
};
