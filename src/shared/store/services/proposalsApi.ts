import { supabase } from '../../lib/supabase';

export interface Proposal {
  id: string;
  title: string;
  type: 'proposal' | 'estimate' | 'contract';
  customer_id?: string;
  status: 'draft' | 'waiting' | 'completed' | 'payments' | 'archived';
  value: number;
  content?: any;
  date_modified?: string;
  created_by?: string;
  created_at?: string;
  job_id?: number;
}

export interface CreateProposalRequest {
  title: string;
  type?: 'proposal' | 'estimate' | 'contract';
  customer_id?: string;
  status?: 'draft' | 'waiting' | 'completed' | 'payments' | 'archived';
  value?: number;
  content?: any;
  job_id?: number;
}

export interface ProposalsResponse {
  success: boolean;
  data: Proposal[];
  message?: string;
}

export interface ProposalResponse {
  success: boolean;
  data: Proposal;
  message?: string;
}

export const getProposalsByJobId = async (jobId: number): Promise<ProposalsResponse> => {
  try {
    const { data, error } = await supabase
      .from('documents_contracts')
      .select('*')
      .eq('type', 'proposal')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const filteredData = (data || []).filter((proposal: any) => {
      return proposal.content?.job_id === jobId || proposal.job_id === jobId;
    });

    return {
      success: true,
      data: filteredData as Proposal[]
    };
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch proposals'
    };
  }
};

export const getAllProposals = async (): Promise<ProposalsResponse> => {
  try {
    const { data, error } = await supabase
      .from('documents_contracts')
      .select('*')
      .eq('type', 'proposal')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data as Proposal[]
    };
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch proposals'
    };
  }
};

export const getProposalById = async (id: string): Promise<ProposalResponse> => {
  try {
    const { data, error } = await supabase
      .from('documents_contracts')
      .select('*')
      .eq('id', id)
      .eq('type', 'proposal')
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as Proposal
    };
  } catch (error: any) {
    console.error('Error fetching proposal:', error);
    throw error;
  }
};

export const createProposal = async (proposalData: CreateProposalRequest): Promise<ProposalResponse> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const newProposal = {
      title: proposalData.title,
      type: proposalData.type || 'proposal',
      customer_id: proposalData.customer_id,
      status: proposalData.status || 'draft',
      value: proposalData.value || 0,
      content: {
        ...proposalData.content,
        job_id: proposalData.job_id
      },
      created_by: user?.id
    };

    const { data, error } = await supabase
      .from('documents_contracts')
      .insert([newProposal])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as Proposal
    };
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

export const updateProposal = async (id: string, proposalData: Partial<CreateProposalRequest>): Promise<ProposalResponse> => {
  try {
    const updateData: any = {
      ...proposalData,
      date_modified: new Date().toISOString()
    };

    if (proposalData.job_id && updateData.content) {
      updateData.content = {
        ...updateData.content,
        job_id: proposalData.job_id
      };
    }

    const { data, error } = await supabase
      .from('documents_contracts')
      .update(updateData)
      .eq('id', id)
      .eq('type', 'proposal')
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as Proposal
    };
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    throw error;
  }
};

export const deleteProposal = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('documents_contracts')
      .delete()
      .eq('id', id)
      .eq('type', 'proposal');

    if (error) throw error;

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
};
