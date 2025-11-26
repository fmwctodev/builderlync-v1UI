import { supabase } from '../../../shared/lib/supabase';

export interface Proposal {
  id: string;
  title: string;
  type: 'proposal' | 'estimate' | 'contract';
  customer_id?: string;
  opportunity_id?: string;
  status: 'draft' | 'waiting' | 'completed' | 'payments' | 'archived';
  value: number;
  content: any;
  date_modified: string;
  created_by?: string;
  created_at: string;
}

export const proposalsApi = {
  async getProposalsByOpportunity(opportunityId: string): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase
        .from('documents_contracts')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .in('type', ['proposal', 'contract'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },

  async getAvailableProposals(excludeOpportunityId?: string): Promise<Proposal[]> {
    try {
      let query = supabase
        .from('documents_contracts')
        .select('*')
        .in('type', ['proposal', 'contract'])
        .order('created_at', { ascending: false });

      if (excludeOpportunityId) {
        query = query.or(`opportunity_id.is.null,opportunity_id.neq.${excludeOpportunityId}`);
      } else {
        query = query.is('opportunity_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available proposals:', error);
      throw error;
    }
  },

  async linkProposalToOpportunity(proposalId: string, opportunityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents_contracts')
        .update({ opportunity_id: opportunityId })
        .eq('id', proposalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking proposal to opportunity:', error);
      throw error;
    }
  },

  async unlinkProposalFromOpportunity(proposalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents_contracts')
        .update({ opportunity_id: null })
        .eq('id', proposalId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unlinking proposal from opportunity:', error);
      throw error;
    }
  },
};
