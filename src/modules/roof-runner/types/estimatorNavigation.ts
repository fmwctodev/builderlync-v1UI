import type { MaterialsConfig, MaterialsSummary } from '../utils/materialsUtils';

export interface InstantEstimatorRouteState {
  source: 'instant_estimator';
  propertyId: string;
  addressId?: string;
  addressText: string;
  jobId?: string;
  customerId?: string;
  estimatorDraftId?: string;
  roofAreaSqFt?: number;
  effectivePitch?: number;
  initialTab?: 'place-order' | 'order-history' | 'account-selection';
}

export interface EstimatorDraftRecord {
  id: string;
  organization_id: string;
  user_id: string;
  property_id: string;
  address_text: string;
  roof_area_sqft: number | null;
  effective_pitch: number | null;
  materials_config: MaterialsConfig | null;
  materials_summary: MaterialsSummary | null;
  job_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveDraftParams {
  organizationId: string;
  userId: string;
  propertyId: string;
  addressText: string;
  roofAreaSqFt?: number | null;
  effectivePitch?: number | null;
  materialsConfig?: MaterialsConfig | null;
  materialsSummary?: MaterialsSummary | null;
  jobId?: string | null;
  customerId?: string | null;
}

export function isInstantEstimatorRouteState(state: unknown): state is InstantEstimatorRouteState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  return (
    s.source === 'instant_estimator' &&
    typeof s.propertyId === 'string' &&
    typeof s.addressText === 'string'
  );
}
