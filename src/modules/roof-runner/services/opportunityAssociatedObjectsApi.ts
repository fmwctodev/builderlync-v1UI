import { supabase } from '../../../shared/lib/supabase';

export interface OpportunityAssociatedObject {
  id: string;
  opportunity_id: string;
  object_type: 'job' | 'contact' | 'document' | 'proposal' | 'estimate';
  object_id: string;
  object_name: string;
  created_at: string;
}

export interface CreateAssociatedObjectRequest {
  opportunity_id: string;
  object_type: 'job' | 'contact' | 'document' | 'proposal' | 'estimate';
  object_id: string;
  object_name: string;
}

export const opportunityAssociatedObjectsApi = {
  async getAssociatedObjects(opportunityId: string): Promise<OpportunityAssociatedObject[]> {
    try {
      const { data, error } = await supabase
        .from('opportunity_associated_objects')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching associated objects:', error);
      throw error;
    }
  },

  async getAssociatedObjectsByType(
    opportunityId: string,
    objectType: 'job' | 'contact' | 'document' | 'proposal' | 'estimate'
  ): Promise<OpportunityAssociatedObject[]> {
    try {
      const { data, error } = await supabase
        .from('opportunity_associated_objects')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .eq('object_type', objectType)
        .order('created_at', { ascending: false});

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching associated objects by type:', error);
      throw error;
    }
  },

  async createAssociatedObject(objectData: CreateAssociatedObjectRequest): Promise<OpportunityAssociatedObject> {
    try {
      const { data, error } = await supabase
        .from('opportunity_associated_objects')
        .insert(objectData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating associated object:', error);
      throw error;
    }
  },

  async deleteAssociatedObject(objectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunity_associated_objects')
        .delete()
        .eq('id', objectId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting associated object:', error);
      throw error;
    }
  },

  async checkAssociation(
    opportunityId: string,
    objectType: string,
    objectId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('opportunity_associated_objects')
        .select('id')
        .eq('opportunity_id', opportunityId)
        .eq('object_type', objectType)
        .eq('object_id', objectId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking association:', error);
      return false;
    }
  },
};
