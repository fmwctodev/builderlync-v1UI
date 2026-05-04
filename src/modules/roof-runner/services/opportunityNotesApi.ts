import { apiClient } from '../../../shared/utils/api';

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
    return apiClient.get(`/opportunities/${opportunityId}/notes`);
  },

  async createNote(noteData: CreateOpportunityNoteRequest): Promise<OpportunityNote> {
    return apiClient.post('/opportunities/notes', noteData);
  },

  async updateNote(noteId: string, updates: UpdateOpportunityNoteRequest): Promise<OpportunityNote> {
    return apiClient.put(`/opportunities/notes/${noteId}`, updates);
  },

  async deleteNote(noteId: string): Promise<void> {
    return apiClient.delete(`/opportunities/notes/${noteId}`);
  },

  async togglePin(noteId: string, currentPinStatus: boolean): Promise<OpportunityNote> {
    return this.updateNote(noteId, { is_pinned: !currentPinStatus });
  },
};
