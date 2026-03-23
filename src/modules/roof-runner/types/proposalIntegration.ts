export interface EstimateSnapshot {
  id: string;
  organization_id: string;
  user_id: string;
  property_id: string;
  address_text: string;
  roof_area_sqft: number | null;
  pitch_effective: number | null;
  imagery_included: boolean;
  materials_calc_inputs: MaterialsCalcInputs;
  materials_calc_outputs: MaterialsCalcOutputs;
  assumptions: string[];
  notes: string | null;
  source: string;
  created_at: string;
}

export interface MaterialsCalcInputs {
  wastePercent: number;
  bundlesPerSquare: number;
  underlaymentSqFtPerRoll: number;
  includeStarter: boolean;
  includeRidgeCap: boolean;
  includeDripEdge: boolean;
  shingleType?: string;
  underlaymentType?: string;
}

export interface MaterialsCalcOutputs {
  squares: number;
  adjustedSquares: number;
  bundlesRequired: number;
  underlaymentRolls: number;
  starterAmount?: number;
  ridgeCapAmount?: number;
  dripEdgeAmount?: number;
}

export interface CreateEstimateSnapshotRequest {
  organization_id: string;
  property_id: string;
  address_text: string;
  roof_area_sqft?: number | null;
  pitch_effective?: number | null;
  imagery_included?: boolean;
  materials_calc_inputs: MaterialsCalcInputs;
  materials_calc_outputs: MaterialsCalcOutputs;
  assumptions?: string[];
  notes?: string;
}

export interface PricingCatalogItem {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  description: string | null;
  default_unit_price: number;
  unit: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePricingCatalogItemRequest {
  sku: string;
  name: string;
  description?: string;
  default_unit_price?: number;
  unit: string;
  category?: string;
}

export interface Proposal {
  id: string;
  organization_id: string;
  title: string;
  type: 'proposal' | 'estimate' | 'contract';
  customer_id: string | null;
  contact_id: string | null;
  job_id: string | null;
  opportunity_id: string | null;
  status: ProposalStatus;
  value: number;
  content: ProposalContent;
  property_id: string | null;
  property_address: string | null;
  linked_estimate_snapshot_id: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  expires_at: string | null;
  signature_url: string | null;
  signature_received_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus =
  | 'draft'
  | 'waiting'
  | 'completed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'archived'
  | 'payments';

export interface ProposalContent {
  sections?: ProposalSection[];
  coverPage?: {
    companyName?: string;
    companyLogo?: string;
    projectTitle?: string;
    customerName?: string;
    date?: string;
  };
  projectSummary?: string;
  scopeOfWork?: string;
  termsAndConditions?: string;
  notes?: string;
}

export interface ProposalSection {
  id: string;
  type: 'cover' | 'summary' | 'scope' | 'materials' | 'assumptions' | 'terms' | 'custom';
  title: string;
  content: string;
  order: number;
}

export interface ProposalLineItem {
  id: string;
  proposal_id: string;
  organization_id: string;
  line_number: number;
  name: string;
  item_name?: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  unit_price: number;
  total_price: number;
  source_tag: 'instant_estimator' | 'manual';
  was_edited: boolean;
  catalog_sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProposalLineItemRequest {
  proposal_id: string;
  organization_id: string;
  line_number: number;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  source_tag?: 'instant_estimator' | 'manual';
  catalog_sku?: string;
}

export interface UpdateProposalLineItemRequest {
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  line_number?: number;
}

export interface ProposalAuditEvent {
  id: string;
  proposal_id: string;
  organization_id: string;
  event_type: ProposalAuditEventType;
  user_id: string | null;
  estimate_snapshot_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ProposalAuditEventType =
  | 'proposal_created_from_estimate'
  | 'proposal_updated_from_estimate'
  | 'proposal_sent'
  | 'proposal_viewed'
  | 'proposal_accepted'
  | 'proposal_declined'
  | 'line_item_edited'
  | 'line_item_added'
  | 'line_item_deleted'
  | 'signature_received'
  | 'proposal_expired'
  | 'proposal_archived'
  | 'proposal_created'
  | 'proposal_updated';

export interface CreateProposalFromEstimateRequest {
  snapshot_id: string;
  organization_id: string;
  title?: string;
  customer_id?: string;
  job_id?: string;
  opportunity_id?: string;
  expires_in_days?: number;
}

export interface UpdateProposalFromEstimateRequest {
  proposal_id: string;
  new_snapshot_id: string;
  organization_id: string;
}

export interface ProposalWithLineItems extends Proposal {
  line_items: ProposalLineItem[];
  snapshot?: EstimateSnapshot | null;
}

export interface MergeConflictItem {
  line_item_id: string;
  name: string;
  reason: string;
  existing_quantity: number;
  new_quantity: number;
}

export interface MergeConflictSummary {
  has_conflicts: boolean;
  conflict_count: number;
  conflicts: MergeConflictItem[];
  items_updated: number;
  items_added: number;
  items_preserved: number;
}

export interface ProposalTotals {
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  items_needing_pricing: number;
}

export interface SendProposalRequest {
  proposal_id: string;
  recipient_email: string;
  message?: string;
  include_pdf?: boolean;
  request_signature?: boolean;
  expires_in_days?: number;
}

export interface SendProposalResponse {
  success: boolean;
  sharing_link?: string;
  message?: string;
}

export const ESTIMATOR_TO_CATALOG_SKU_MAP: Record<string, string> = {
  bundles: 'shingles_bundle',
  bundlesRequired: 'shingles_bundle',
  underlayment: 'underlayment_roll',
  underlaymentRolls: 'underlayment_roll',
  starter: 'starter_allowance',
  starterAmount: 'starter_allowance',
  ridgeCap: 'ridgecap_allowance',
  ridgeCapAmount: 'ridgecap_allowance',
  dripEdge: 'dripedge_allowance',
  dripEdgeAmount: 'dripedge_allowance',
};

export const DEFAULT_CATALOG_ITEMS: Omit<PricingCatalogItem, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[] = [
  { sku: 'shingles_bundle', name: 'Shingles (Bundle)', description: 'Standard architectural shingles per bundle', default_unit_price: 0, unit: 'bundle', category: 'roofing_materials', is_active: true },
  { sku: 'underlayment_roll', name: 'Underlayment (Roll)', description: 'Synthetic underlayment per roll', default_unit_price: 0, unit: 'roll', category: 'roofing_materials', is_active: true },
  { sku: 'starter_allowance', name: 'Starter Strip', description: 'Starter strip shingles allowance', default_unit_price: 0, unit: 'allowance', category: 'accessories', is_active: true },
  { sku: 'ridgecap_allowance', name: 'Ridge Cap', description: 'Ridge cap shingles allowance', default_unit_price: 0, unit: 'allowance', category: 'accessories', is_active: true },
  { sku: 'dripedge_allowance', name: 'Drip Edge', description: 'Drip edge flashing allowance', default_unit_price: 0, unit: 'allowance', category: 'accessories', is_active: true },
];
