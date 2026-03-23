import { supabase } from '../../../shared/lib/supabase';
import type {
  EstimateSnapshot,
  CreateEstimateSnapshotRequest,
} from '../types/proposalIntegration';

export interface EstimateSnapshotResponse {
  success: boolean;
  data?: EstimateSnapshot;
  message?: string;
}

export interface EstimateSnapshotsResponse {
  success: boolean;
  data: EstimateSnapshot[];
  message?: string;
}

export async function createSnapshot(
  params: CreateEstimateSnapshotRequest
): Promise<EstimateSnapshotResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('estimate_snapshots')
      .insert({
        organization_id: params.organization_id,
        user_id: user.id,
        property_id: params.property_id,
        address_text: params.address_text,
        roof_area_sqft: params.roof_area_sqft,
        pitch_effective: params.pitch_effective,
        imagery_included: params.imagery_included ?? false,
        materials_calc_inputs: params.materials_calc_inputs,
        materials_calc_outputs: params.materials_calc_outputs,
        assumptions: params.assumptions ?? [],
        notes: params.notes,
        source: 'instant_estimator',
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as EstimateSnapshot };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create snapshot';
    console.error('Error creating estimate snapshot:', error);
    return { success: false, message };
  }
}

export async function getSnapshotById(
  id: string,
  organizationId: string
): Promise<EstimateSnapshotResponse> {
  try {
    const { data, error } = await supabase
      .from('estimate_snapshots')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { success: false, message: 'Snapshot not found' };
    }

    return { success: true, data: data as EstimateSnapshot };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch snapshot';
    console.error('Error fetching estimate snapshot:', error);
    return { success: false, message };
  }
}

export async function getSnapshotsByProperty(
  propertyId: string,
  organizationId: string
): Promise<EstimateSnapshotsResponse> {
  try {
    const { data, error } = await supabase
      .from('estimate_snapshots')
      .select('*')
      .eq('property_id', propertyId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: (data ?? []) as EstimateSnapshot[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch snapshots';
    console.error('Error fetching estimate snapshots:', error);
    return { success: false, data: [], message };
  }
}

export async function getSnapshotsByOrganization(
  organizationId: string,
  limit = 50
): Promise<EstimateSnapshotsResponse> {
  try {
    const { data, error } = await supabase
      .from('estimate_snapshots')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data ?? []) as EstimateSnapshot[] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch snapshots';
    console.error('Error fetching estimate snapshots:', error);
    return { success: false, data: [], message };
  }
}

export async function deleteSnapshot(
  id: string,
  organizationId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { error } = await supabase
      .from('estimate_snapshots')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete snapshot';
    console.error('Error deleting estimate snapshot:', error);
    return { success: false, message };
  }
}
