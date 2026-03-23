import { createSnapshot, getSnapshotById } from './estimateSnapshotsApi';
import { getCatalogByOrg } from './orgPricingCatalogApi';
import { createLineItems, getLineItemsByProposal, updateLineItem, deleteLineItem } from './proposalLineItemsApi';
import { logAuditEvent } from './proposalAuditApi';
import { createProposal, getProposalById, updateProposal, findDraftProposalForProperty, calculateProposalTotal, updateProposalValue } from './proposalsNewApi';
import {
  mapSnapshotToProposalHeader,
  mapMaterialsSummaryToLineItems,
  generateDefaultAssumptions,
  generateProjectSummarySection,
} from '../utils/proposalFieldMapping';
import { mergeLineItems, generateMergeConflictSummary } from '../utils/proposalMergeUtils';
import type {
  CreateProposalFromEstimateRequest,
  UpdateProposalFromEstimateRequest,
  EstimateSnapshot,
  ProposalWithLineItems,
  MergeConflictSummary,
  CreateEstimateSnapshotRequest,
  PricingCatalogItem,
} from '../types/proposalIntegration';

export interface CreateFromEstimateResponse {
  success: boolean;
  proposal_id?: string;
  snapshot_id?: string;
  message?: string;
}

export interface UpdateFromEstimateResponse {
  success: boolean;
  proposal_id?: string;
  snapshot_id?: string;
  merge_summary?: MergeConflictSummary;
  message?: string;
}

export async function createProposalFromEstimate(
  snapshotId: string,
  organizationId: string,
  options: Omit<CreateProposalFromEstimateRequest, 'snapshot_id' | 'organization_id'> = {}
): Promise<CreateFromEstimateResponse> {
  try {
    const snapshotResult = await getSnapshotById(snapshotId, organizationId);
    if (!snapshotResult.success || !snapshotResult.data) {
      return { success: false, message: snapshotResult.message || 'Snapshot not found' };
    }

    const snapshot = snapshotResult.data;

    const catalogResult = await getCatalogByOrg(organizationId);
    const catalog = catalogResult.data || [];

    const proposalData = mapSnapshotToProposalHeader(snapshot, options);
    const assumptions = generateDefaultAssumptions(snapshot);
    const projectSummary = generateProjectSummarySection(snapshot);

    const proposalResult = await createProposal({
      organization_id: organizationId,
      title: options.title || proposalData.title,
      type: 'proposal',
      customer_id: options.customer_id,
      job_id: options.job_id,
      opportunity_id: options.opportunity_id,
      status: 'draft',
      property_id: snapshot.property_id,
      property_address: snapshot.address_text,
      linked_estimate_snapshot_id: snapshotId,
      content: {
        projectSummary,
        sections: [
          { id: 'assumptions', type: 'assumptions', title: 'Assumptions', content: assumptions.join('\n'), order: 4 },
        ],
      },
      expires_at: options.expires_in_days
        ? new Date(Date.now() + options.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    });

    if (!proposalResult.success || !proposalResult.data) {
      return {
        success: false,
        snapshot_id: snapshotId,
        message: proposalResult.message || 'Failed to create proposal',
      };
    }

    const proposalId = proposalResult.data.id;

    const lineItemsData = mapMaterialsSummaryToLineItems(
      snapshot.materials_calc_outputs,
      snapshot.materials_calc_inputs,
      catalog
    );

    const lineItemsToCreate = lineItemsData.map((item, index) => ({
      proposal_id: proposalId,
      organization_id: organizationId,
      line_number: index + 1,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unit_price,
      source_tag: 'instant_estimator' as const,
      catalog_sku: item.catalog_sku,
    }));

    const lineItemsResult = await createLineItems(lineItemsToCreate);
    if (!lineItemsResult.success) {
      console.error('Warning: Line items creation failed:', lineItemsResult.message);
    }

    const totalResult = await calculateProposalTotal(proposalId, organizationId);
    if (totalResult.success && totalResult.total > 0) {
      await updateProposalValue(proposalId, organizationId, totalResult.total);
    }

    await logAuditEvent(
      proposalId,
      organizationId,
      'proposal_created_from_estimate',
      {
        snapshot_id: snapshotId,
        line_items_count: lineItemsToCreate.length,
        property_address: snapshot.address_text,
      },
      snapshotId
    );

    return {
      success: true,
      proposal_id: proposalId,
      snapshot_id: snapshotId,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create proposal from estimate';
    console.error('Error creating proposal from estimate:', error);
    return { success: false, message };
  }
}

export async function createSnapshotAndProposal(
  snapshotData: CreateEstimateSnapshotRequest,
  proposalOptions: Omit<CreateProposalFromEstimateRequest, 'snapshot_id' | 'organization_id'> = {}
): Promise<CreateFromEstimateResponse> {
  try {
    const snapshotResult = await createSnapshot(snapshotData);
    if (!snapshotResult.success || !snapshotResult.data) {
      return { success: false, message: snapshotResult.message || 'Failed to create snapshot' };
    }

    return createProposalFromEstimate(
      snapshotResult.data.id,
      snapshotData.organization_id,
      proposalOptions
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create snapshot and proposal';
    console.error('Error creating snapshot and proposal:', error);
    return { success: false, message };
  }
}

export async function updateProposalFromEstimate(
  params: UpdateProposalFromEstimateRequest
): Promise<UpdateFromEstimateResponse> {
  try {
    const { proposal_id, new_snapshot_id, organization_id } = params;

    const proposalResult = await getProposalById(proposal_id, organization_id);
    if (!proposalResult.success || !proposalResult.data) {
      return { success: false, message: proposalResult.message || 'Proposal not found' };
    }

    const snapshotResult = await getSnapshotById(new_snapshot_id, organization_id);
    if (!snapshotResult.success || !snapshotResult.data) {
      return { success: false, message: snapshotResult.message || 'Snapshot not found' };
    }

    const snapshot = snapshotResult.data;

    const existingItemsResult = await getLineItemsByProposal(proposal_id, organization_id);
    const existingItems = existingItemsResult.data || [];

    const catalogResult = await getCatalogByOrg(organization_id);
    const catalog = catalogResult.data || [];

    const newItemsData = mapMaterialsSummaryToLineItems(
      snapshot.materials_calc_outputs,
      snapshot.materials_calc_inputs,
      catalog
    );

    const mergeResult = mergeLineItems(existingItems, newItemsData);
    const conflictSummary = generateMergeConflictSummary(mergeResult.conflictItems, existingItems);

    for (const itemToUpdate of mergeResult.itemsToUpdate) {
      await updateLineItem(itemToUpdate.id, organization_id, {
        quantity: itemToUpdate.quantity,
        description: itemToUpdate.description,
      });
    }

    if (mergeResult.itemsToAdd.length > 0) {
      const maxLineNumber = Math.max(0, ...existingItems.map(i => i.line_number));
      const itemsToCreate = mergeResult.itemsToAdd.map((item, index) => ({
        proposal_id,
        organization_id,
        line_number: maxLineNumber + index + 1,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        source_tag: 'instant_estimator' as const,
        catalog_sku: item.catalog_sku,
      }));
      await createLineItems(itemsToCreate);
    }

    const projectSummary = generateProjectSummarySection(snapshot);
    await updateProposal(proposal_id, organization_id, {
      linked_estimate_snapshot_id: new_snapshot_id,
      property_id: snapshot.property_id,
      property_address: snapshot.address_text,
      content: {
        ...proposalResult.data.content,
        projectSummary,
      },
    });

    const totalResult = await calculateProposalTotal(proposal_id, organization_id);
    if (totalResult.success) {
      await updateProposalValue(proposal_id, organization_id, totalResult.total);
    }

    await logAuditEvent(
      proposal_id,
      organization_id,
      'proposal_updated_from_estimate',
      {
        new_snapshot_id,
        items_updated: mergeResult.itemsToUpdate.length,
        items_added: mergeResult.itemsToAdd.length,
        items_preserved: conflictSummary.items_preserved,
        conflicts: conflictSummary.conflicts,
      },
      new_snapshot_id
    );

    return {
      success: true,
      proposal_id,
      snapshot_id: new_snapshot_id,
      merge_summary: conflictSummary,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update proposal from estimate';
    console.error('Error updating proposal from estimate:', error);
    return { success: false, message };
  }
}

export async function checkExistingDraftForProperty(
  propertyId: string,
  organizationId: string
): Promise<{ exists: boolean; proposal?: ProposalWithLineItems }> {
  try {
    const result = await findDraftProposalForProperty(propertyId, organizationId);
    if (!result.success || !result.data) {
      return { exists: false };
    }

    const lineItemsResult = await getLineItemsByProposal(result.data.id, organizationId);

    return {
      exists: true,
      proposal: {
        ...result.data,
        line_items: lineItemsResult.data || [],
      },
    };
  } catch {
    return { exists: false };
  }
}

export { getSnapshotById, createSnapshot } from './estimateSnapshotsApi';
export { getCatalogByOrg, seedDefaultCatalog } from './orgPricingCatalogApi';
export { getLineItemsByProposal, updateLineItem, deleteLineItem, addLineItem, reorderLineItems } from './proposalLineItemsApi';
export { logAuditEvent, getAuditTrail } from './proposalAuditApi';
export {
  getProposalById,
  getProposalWithLineItems,
  getProposalsByOrganization,
  updateProposal,
  updateProposalStatus,
  updateProposalValue,
  deleteProposal,
  archiveProposal,
  calculateProposalTotal,
} from './proposalsNewApi';
