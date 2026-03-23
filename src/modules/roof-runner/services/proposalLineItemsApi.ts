import { supabase } from '../../../shared/lib/supabase';
import type {
  ProposalLineItem,
  CreateProposalLineItemRequest,
  UpdateProposalLineItemRequest,
} from '../types/proposalIntegration';

export interface LineItemResponse {
  success: boolean;
  data?: ProposalLineItem;
  message?: string;
}

export interface LineItemsResponse {
  success: boolean;
  data: ProposalLineItem[];
  message?: string;
}

export async function createLineItems(
  items: CreateProposalLineItemRequest[]
): Promise<LineItemsResponse> {
  try {
    if (items.length === 0) {
      return { success: true, data: [] };
    }

    const insertData = items.map((item) => ({
      proposal_id: item.proposal_id,
      organization_id: item.organization_id,
      line_number: item.line_number,
      name: item.name,
      description: item.description ?? null,
      quantity: item.quantity,
      unit: item.unit ?? null,
      unit_price: item.unit_price ?? 0,
      source_tag: item.source_tag ?? 'manual',
      was_edited: false,
      catalog_sku: item.catalog_sku ?? null,
    }));

    const { data, error } = await supabase
      .from('proposal_line_items')
      .insert(insertData)
      .select();

    if (error) throw error;

    return { success: true, data: (data ?? []) as ProposalLineItem[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create line items';
    console.error('Error creating line items:', error);
    return { success: false, data: [], message };
  }
}

export async function getLineItemsByProposal(
  proposalId: string,
  organizationId: string
): Promise<LineItemsResponse> {
  try {
    const { data, error } = await supabase
      .from('proposal_line_items')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('organization_id', organizationId)
      .order('line_number', { ascending: true });

    if (error) throw error;

    return { success: true, data: (data ?? []) as ProposalLineItem[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch line items';
    console.error('Error fetching line items:', error);
    return { success: false, data: [], message };
  }
}

export async function updateLineItem(
  id: string,
  organizationId: string,
  updates: UpdateProposalLineItemRequest
): Promise<LineItemResponse> {
  try {
    const { data, error } = await supabase
      .from('proposal_line_items')
      .update({
        ...updates,
        was_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as ProposalLineItem };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update line item';
    console.error('Error updating line item:', error);
    return { success: false, message };
  }
}

export async function deleteLineItem(
  id: string,
  organizationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from('proposal_line_items')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete line item';
    console.error('Error deleting line item:', error);
    return { success: false, message };
  }
}

export async function reorderLineItems(
  proposalId: string,
  organizationId: string,
  itemIds: string[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const updates = itemIds.map((id, index) => ({
      id,
      line_number: index + 1,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('proposal_line_items')
        .update({ line_number: update.line_number })
        .eq('id', update.id)
        .eq('proposal_id', proposalId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reorder line items';
    console.error('Error reordering line items:', error);
    return { success: false, message };
  }
}

export async function addLineItem(
  proposalId: string,
  organizationId: string,
  item: Omit<CreateProposalLineItemRequest, 'proposal_id' | 'organization_id'>
): Promise<LineItemResponse> {
  try {
    const { data: existingItems } = await supabase
      .from('proposal_line_items')
      .select('line_number')
      .eq('proposal_id', proposalId)
      .order('line_number', { ascending: false })
      .limit(1);

    const nextLineNumber = existingItems && existingItems.length > 0
      ? (existingItems[0].line_number ?? 0) + 1
      : 1;

    const { data, error } = await supabase
      .from('proposal_line_items')
      .insert({
        proposal_id: proposalId,
        organization_id: organizationId,
        line_number: item.line_number ?? nextLineNumber,
        name: item.name,
        description: item.description ?? null,
        quantity: item.quantity,
        unit: item.unit ?? null,
        unit_price: item.unit_price ?? 0,
        source_tag: item.source_tag ?? 'manual',
        was_edited: false,
        catalog_sku: item.catalog_sku ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as ProposalLineItem };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add line item';
    console.error('Error adding line item:', error);
    return { success: false, message };
  }
}
