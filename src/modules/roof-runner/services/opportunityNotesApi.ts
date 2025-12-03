import { supabase } from '../../../shared/lib/supabase';

export interface OpportunityNote {
  id: string;
  opportunity_id: string;
  user_id: string;
  organization_id?: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityNoteRequest {
  opportunity_id: string;
  content: string;
  is_pinned?: boolean;
}

export interface UpdateOpportunityNoteRequest {
  content?: string;
  is_pinned?: boolean;
}

export const opportunityNotesApi = {
  async getNotes(opportunityId: string): Promise<OpportunityNote[]> {
    try {
      const { data, error } = await supabase
        .from('opportunity_notes')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunity notes:', error);
      throw error;
    }
  },

  async createNote(noteData: CreateOpportunityNoteRequest): Promise<OpportunityNote> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('opportunity_notes')
        .insert({
          ...noteData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating opportunity note:', error);
      throw error;
    }
  },

  async updateNote(noteId: string, updates: UpdateOpportunityNoteRequest): Promise<OpportunityNote> {
    try {
      const { data, error } = await supabase
        .from('opportunity_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating opportunity note:', error);
      throw error;
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunity_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting opportunity note:', error);
      throw error;
    }
  },

  async togglePin(noteId: string, currentPinStatus: boolean): Promise<OpportunityNote> {
    return this.updateNote(noteId, { is_pinned: !currentPinStatus });
  },
};
