import { supabase } from '../../../shared/lib/supabase';
import type {
  Proposal,
  ProposalWithLineItems,
  ProposalContent,
  ProposalStatus,
} from '../types/proposalIntegration';

export interface ProposalResponse {
  success: boolean;
  data?: Proposal;
  message?: string;
}

export interface ProposalsListResponse {
  success: boolean;
  data: Proposal[];
  message?: string;
}

export interface ProposalWithLineItemsResponse {
  success: boolean;
  data?: ProposalWithLineItems;
  message?: string;
}

export interface CreateProposalRequest {
  organization_id: string;
  title: string;
  type?: 'proposal' | 'estimate' | 'contract';
  customer_id?: string;
  contact_id?: string;
  job_id?: string;
  opportunity_id?: string;
  status?: ProposalStatus;
  value?: number;
  content?: ProposalContent;
  property_id?: string;
  property_address?: string;
  linked_estimate_snapshot_id?: string;
  expires_at?: string;
}

export async function createProposal(
  params: CreateProposalRequest
): Promise<ProposalResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        organization_id: params.organization_id,
        title: params.title,
        type: params.type ?? 'proposal',
        customer_id: params.customer_id ?? null,
        contact_id: params.contact_id ?? null,
        job_id: params.job_id ?? null,
        opportunity_id: params.opportunity_id ?? null,
        status: params.status ?? 'draft',
        value: params.value ?? 0,
        content: params.content ?? {},
        property_id: params.property_id ?? null,
        property_address: params.property_address ?? null,
        linked_estimate_snapshot_id: params.linked_estimate_snapshot_id ?? null,
        expires_at: params.expires_at ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Proposal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create proposal';
    console.error('Error creating proposal:', error);
    return { success: false, message };
  }
}

export async function getProposalById(
  id: string,
  organizationId: string
): Promise<ProposalResponse> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { success: false, message: 'Proposal not found' };
    }

    return { success: true, data: data as Proposal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch proposal';
    console.error('Error fetching proposal:', error);
    return { success: false, message };
  }
}

export async function getProposalWithLineItems(
  id: string,
  organizationId: string
): Promise<ProposalWithLineItemsResponse> {
  try {
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (proposalError) throw proposalError;
    if (!proposal) {
      return { success: false, message: 'Proposal not found' };
    }

    const { data: lineItems, error: lineItemsError } = await supabase
      .from('proposal_line_items')
      .select('*')
      .eq('proposal_id', id)
      .eq('organization_id', organizationId)
      .order('line_number', { ascending: true });

    if (lineItemsError) throw lineItemsError;

    let snapshot = null;
    if (proposal.linked_estimate_snapshot_id) {
      const { data: snapshotData } = await supabase
        .from('estimate_snapshots')
        .select('*')
        .eq('id', proposal.linked_estimate_snapshot_id)
        .maybeSingle();
      snapshot = snapshotData;
    }

    return {
      success: true,
      data: {
        ...proposal,
        line_items: lineItems ?? [],
        snapshot,
      } as ProposalWithLineItems,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch proposal';
    console.error('Error fetching proposal with line items:', error);
    return { success: false, message };
  }
}

export async function getProposalsByOrganization(
  organizationId: string,
  filters?: {
    status?: ProposalStatus;
    type?: string;
    customer_id?: string;
  }
): Promise<ProposalsListResponse> {
  try {
    let query = supabase
      .from('proposals')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: (data ?? []) as Proposal[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch proposals';
    console.error('Error fetching proposals:', error);
    return { success: false, data: [], message };
  }
}

export async function getProposalsByProperty(
  propertyId: string,
  organizationId: string
): Promise<ProposalsListResponse> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('property_id', propertyId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: (data ?? []) as Proposal[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch proposals';
    console.error('Error fetching proposals by property:', error);
    return { success: false, data: [], message };
  }
}

export async function findDraftProposalForProperty(
  propertyId: string,
  organizationId: string
): Promise<ProposalResponse> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('property_id', propertyId)
      .eq('organization_id', organizationId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: false, message: 'No draft proposal found' };
    }

    return { success: true, data: data as Proposal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to find draft proposal';
    console.error('Error finding draft proposal:', error);
    return { success: false, message };
  }
}

export async function updateProposal(
  id: string,
  organizationId: string,
  updates: Partial<CreateProposalRequest>
): Promise<ProposalResponse> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Proposal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update proposal';
    console.error('Error updating proposal:', error);
    return { success: false, message };
  }
}

export async function updateProposalStatus(
  id: string,
  organizationId: string,
  status: ProposalStatus,
  additionalUpdates?: Record<string, unknown>
): Promise<ProposalResponse> {
  try {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalUpdates,
    };

    if (status === 'waiting' && !additionalUpdates?.sent_at) {
      updates.sent_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Proposal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update proposal status';
    console.error('Error updating proposal status:', error);
    return { success: false, message };
  }
}

export async function updateProposalValue(
  id: string,
  organizationId: string,
  value: number
): Promise<ProposalResponse> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Proposal };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update proposal value';
    console.error('Error updating proposal value:', error);
    return { success: false, message };
  }
}

export async function deleteProposal(
  id: string,
  organizationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete proposal';
    console.error('Error deleting proposal:', error);
    return { success: false, message };
  }
}

export async function archiveProposal(
  id: string,
  organizationId: string
): Promise<ProposalResponse> {
  return updateProposalStatus(id, organizationId, 'archived');
}

export async function calculateProposalTotal(
  proposalId: string,
  organizationId: string
): Promise<{ success: boolean; total: number; message?: string }> {
  try {
    const { data, error } = await supabase
      .from('proposal_line_items')
      .select('quantity, unit_price')
      .eq('proposal_id', proposalId)
      .eq('organization_id', organizationId);

    if (error) throw error;

    const total = (data ?? []).reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    return { success: true, total };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to calculate total';
    console.error('Error calculating proposal total:', error);
    return { success: false, total: 0, message };
  }
}
