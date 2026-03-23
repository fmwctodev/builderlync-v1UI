import { supabase } from '../../../shared/lib/supabase';
import type {
  EstimatorDraftRecord,
  SaveDraftParams,
} from '../types/estimatorNavigation';

export async function saveDraft(params: SaveDraftParams): Promise<string> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const existingDraft = await getDraftByProperty(params.organizationId, params.propertyId);

  const draftData = {
    organization_id: params.organizationId,
    user_id: params.userId,
    property_id: params.propertyId,
    address_text: params.addressText,
    roof_area_sqft: params.roofAreaSqFt ?? null,
    effective_pitch: params.effectivePitch ?? null,
    materials_config: params.materialsConfig ?? null,
    materials_summary: params.materialsSummary ?? null,
    job_id: params.jobId ?? null,
    customer_id: params.customerId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existingDraft) {
    const { error } = await supabase
      .from('instant_estimator_drafts')
      .update(draftData)
      .eq('id', existingDraft.id);

    if (error) {
      throw new Error(`Failed to update draft: ${error.message}`);
    }

    return existingDraft.id;
  }

  const { data, error } = await supabase
    .from('instant_estimator_drafts')
    .insert(draftData)
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create draft: ${error.message}`);
  }

  return data.id;
}

export async function getDraftById(draftId: string): Promise<EstimatorDraftRecord | null> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('instant_estimator_drafts')
    .select('*')
    .eq('id', draftId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch draft: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapDbRowToDraftRecord(data);
}

export async function getDraftByProperty(
  organizationId: string,
  propertyId: string
): Promise<EstimatorDraftRecord | null> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('instant_estimator_drafts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch draft by property: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapDbRowToDraftRecord(data);
}

export async function deleteDraft(draftId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { error } = await supabase
    .from('instant_estimator_drafts')
    .delete()
    .eq('id', draftId);

  if (error) {
    throw new Error(`Failed to delete draft: ${error.message}`);
  }
}

export async function listUserDrafts(
  organizationId: string,
  userId: string,
  limit: number = 10
): Promise<EstimatorDraftRecord[]> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('instant_estimator_drafts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list drafts: ${error.message}`);
  }

  return (data || []).map(mapDbRowToDraftRecord);
}

function mapDbRowToDraftRecord(row: Record<string, unknown>): EstimatorDraftRecord {
  return {
    id: row.id as string,
    organization_id: row.organization_id as string,
    user_id: row.user_id as string,
    property_id: row.property_id as string,
    address_text: row.address_text as string,
    roof_area_sqft: row.roof_area_sqft != null ? Number(row.roof_area_sqft) : null,
    effective_pitch: row.effective_pitch != null ? Number(row.effective_pitch) : null,
    materials_config: row.materials_config as EstimatorDraftRecord['materials_config'],
    materials_summary: row.materials_summary as EstimatorDraftRecord['materials_summary'],
    job_id: row.job_id as string | null,
    customer_id: row.customer_id as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
