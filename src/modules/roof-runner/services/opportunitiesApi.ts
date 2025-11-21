import { supabase } from '../../../shared/lib/supabase';
import type {
  Opportunity,
  OpportunityWithDetails,
  OpportunityFormData,
  OpportunityContact,
  OpportunityFollower,
} from '../types/opportunities';

export const opportunitiesApi = {
  async getOpportunities(filters?: {
    pipeline_id?: string;
    stage_id?: string;
    status?: string;
    owner_id?: string;
  }): Promise<OpportunityWithDetails[]> {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          contacts:opportunity_contacts(*),
          followers:opportunity_followers(*),
          pipeline:pipelines(*),
          stage:pipeline_stages(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.pipeline_id) {
        query = query.eq('pipeline_id', filters.pipeline_id);
      }
      if (filters?.stage_id) {
        query = query.eq('stage_id', filters.stage_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  async getOpportunityById(id: string): Promise<OpportunityWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          contacts:opportunity_contacts(*),
          followers:opportunity_followers(*),
          pipeline:pipelines(*),
          stage:pipeline_stages(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      throw error;
    }
  },

  async createOpportunity(formData: OpportunityFormData): Promise<Opportunity> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const opportunityData: Partial<Opportunity> = {
        user_id: user.id,
        opportunity_name: formData.opportunity_name,
        pipeline_id: formData.pipeline_id,
        stage_id: formData.stage_id,
        status: formData.status,
        value: formData.value || 0,
        owner_id: formData.owner_id || null,
        business_name: formData.business_name || null,
        source: formData.source || null,
        tags: formData.tags || null,
        appointment_time: formData.appointment_time || null,
      };

      const { data: opportunity, error: oppError } = await supabase
        .from('opportunities')
        .insert(opportunityData)
        .select()
        .single();

      if (oppError) throw oppError;

      if (formData.contact_name || formData.contact_email || formData.contact_phone) {
        const contactData: Partial<OpportunityContact> = {
          opportunity_id: opportunity.id,
          contact_name: formData.contact_name || '',
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          is_primary: true,
        };

        const { error: contactError } = await supabase
          .from('opportunity_contacts')
          .insert(contactData);

        if (contactError) console.error('Error creating contact:', contactError);
      }

      if (formData.follower_ids && formData.follower_ids.length > 0) {
        const followersData = formData.follower_ids.map(user_id => ({
          opportunity_id: opportunity.id,
          user_id,
        }));

        const { error: followersError } = await supabase
          .from('opportunity_followers')
          .insert(followersData);

        if (followersError) console.error('Error adding followers:', followersError);
      }

      return opportunity;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  async updateOpportunity(id: string, formData: Partial<OpportunityFormData>): Promise<Opportunity> {
    try {
      const updateData: Partial<Opportunity> = {
        ...(formData.opportunity_name && { opportunity_name: formData.opportunity_name }),
        ...(formData.pipeline_id && { pipeline_id: formData.pipeline_id }),
        ...(formData.stage_id && { stage_id: formData.stage_id }),
        ...(formData.status && { status: formData.status }),
        ...(formData.value !== undefined && { value: formData.value }),
        ...(formData.owner_id !== undefined && { owner_id: formData.owner_id }),
        ...(formData.business_name !== undefined && { business_name: formData.business_name }),
        ...(formData.source !== undefined && { source: formData.source }),
        ...(formData.tags !== undefined && { tags: formData.tags }),
        ...(formData.appointment_time !== undefined && { appointment_time: formData.appointment_time }),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('opportunities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  async moveOpportunityToStage(id: string, stage_id: string): Promise<Opportunity> {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ stage_id, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error moving opportunity:', error);
      throw error;
    }
  },

  async deleteOpportunity(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
};
