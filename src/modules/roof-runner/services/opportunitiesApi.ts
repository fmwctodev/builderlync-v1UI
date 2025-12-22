import { supabase } from '../../../shared/lib/supabase';
import { opportunitiesBackendApi } from '../../../shared/store/services/opportunitiesApi';
import type {
  Opportunity,
  OpportunityWithDetails,
  OpportunityFormData,
  OpportunityContact,
  OpportunityFollower,
  JobType,
} from '../types/opportunities';
import { getEmbeddedPipelineId } from '../constants/embeddedPipelines';

export const opportunitiesApi = {
  async getOpportunities(filters?: {
    pipeline_id?: string;
    job_type?: JobType;
    stage_id?: string;
    status?: string;
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

  async addFollower(opportunity_id: string, user_id: string): Promise<OpportunityFollower> {
    try {
      const { data, error } = await supabase
        .from('opportunity_followers')
        .insert({ opportunity_id, user_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding follower:', error);
      throw error;
    }
  },

  async removeFollower(opportunity_id: string, user_id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunity_followers')
        .delete()
        .eq('opportunity_id', opportunity_id)
        .eq('user_id', user_id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing follower:', error);
      throw error;
    }
  },

  async getOpportunitiesByJobType(jobType: JobType): Promise<OpportunityWithDetails[]> {
    return this.getOpportunities({ job_type: jobType });
  },

  async getOpportunityCountByJobType(jobType: JobType): Promise<number> {
    try {
      const pipelineId = getEmbeddedPipelineId(jobType);
      const { count, error } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('pipeline_id', pipelineId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Error counting ${jobType} opportunities:`, error);
      return 0;
    }
  },

  async getOpportunityCountsByAllJobTypes(): Promise<Record<JobType, number>> {
    try {
      const residential = await this.getOpportunityCountByJobType('Residential');
      const commercial = await this.getOpportunityCountByJobType('Commercial');
      const insurance = await this.getOpportunityCountByJobType('Insurance');

      return {
        Residential: residential,
        Commercial: commercial,
        Insurance: insurance,
      };
    } catch (error) {
      console.error('Error counting opportunities by job type:', error);
      return {
        Residential: 0,
        Commercial: 0,
        Insurance: 0,
      };
    }
  },
};
