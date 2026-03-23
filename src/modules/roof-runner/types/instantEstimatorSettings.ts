export interface InstantEstimatorGlobalSettings {
  id: string;
  organization_id: string;
  google_reviews_enabled: boolean;
  project_showcase_id: string | null;
  default_job_owner_id: string | null;
  default_point_of_contact_id: string | null;
  default_scheduling_link: string | null;
  default_financing_link: string | null;
  restrict_materials: boolean;
  pricing_type: PricingType;
  show_price_range: boolean;
  lower_range_percent: number;
  upper_range_percent: number;
  show_financing: boolean;
  show_customer_reviews: boolean;
  show_social_media: boolean;
  webhook_enabled: boolean;
  webhook_url: string | null;
  lead_notification_email: string | null;
  default_lead_pipeline_type: LeadPipelineType;
  created_at: string;
  updated_at: string;
}

export type PricingType = 'per_sqft' | 'per_square';
export type LeadPipelineType = 'Residential' | 'Commercial' | 'Insurance';
export type LeadStatus = 'new' | 'converted' | 'dismissed';

export interface InstantEstimatorMaterial {
  id: string;
  organization_id: string;
  estimator_id: string;
  name: string;
  material_type: MaterialType;
  image_url: string | null;
  low_price: number | null;
  moderate_price: number | null;
  steep_price: number | null;
  flat_price: number | null;
  multi_story_surcharge: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MaterialType =
  | 'Asphalt'
  | 'Metal'
  | 'Tile'
  | 'Slate'
  | 'Wood Shake'
  | 'Synthetic'
  | 'Flat/TPO'
  | 'EPDM'
  | 'Modified Bitumen';

export const MATERIAL_TYPES: MaterialType[] = [
  'Asphalt',
  'Metal',
  'Tile',
  'Slate',
  'Wood Shake',
  'Synthetic',
  'Flat/TPO',
  'EPDM',
  'Modified Bitumen',
];

export interface InstantEstimatorConfig {
  id: string;
  organization_id: string;
  estimator_id: string;
  default_job_owner_id: string | null;
  scheduling_link: string | null;
  financing_link: string | null;
  show_customer_reviews: boolean;
  show_social_media: boolean;
  show_project_showcase: boolean;
  pricing_settings: PricingSettings;
  created_at: string;
  updated_at: string;
}

export interface PricingSettings {
  restrict_materials: boolean;
  pricing_type: 'per-square-foot' | 'per-square';
  show_price_range: boolean;
  lower_range: string;
  upper_range: string;
  show_financing: boolean;
  term_length: string;
  interest_rate: string;
}

export interface CreateMaterialData {
  name: string;
  material_type: MaterialType;
  image_url?: string | null;
  low_price?: number | null;
  moderate_price?: number | null;
  steep_price?: number | null;
  flat_price?: number | null;
  multi_story_surcharge?: number | null;
  sort_order?: number;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {
  id: string;
}

export interface UpdateGlobalSettingsData {
  google_reviews_enabled?: boolean;
  project_showcase_id?: string | null;
  default_job_owner_id?: string | null;
  default_point_of_contact_id?: string | null;
  default_scheduling_link?: string | null;
  default_financing_link?: string | null;
  restrict_materials?: boolean;
  pricing_type?: PricingType;
  show_price_range?: boolean;
  lower_range_percent?: number;
  upper_range_percent?: number;
  show_financing?: boolean;
  show_customer_reviews?: boolean;
  show_social_media?: boolean;
  webhook_enabled?: boolean;
  webhook_url?: string | null;
  lead_notification_email?: string | null;
  default_lead_pipeline_type?: LeadPipelineType;
}

export interface UpdateConfigData {
  default_job_owner_id?: string | null;
  scheduling_link?: string | null;
  financing_link?: string | null;
  show_customer_reviews?: boolean;
  show_social_media?: boolean;
  show_project_showcase?: boolean;
  pricing_settings?: Partial<PricingSettings>;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

export interface StaffMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

export interface InstantEstimatorDefaultMaterial {
  id: string;
  organization_id: string;
  name: string;
  material_type: MaterialType;
  image_url: string | null;
  low_price: number | null;
  moderate_price: number | null;
  steep_price: number | null;
  flat_price: number | null;
  multi_story_surcharge: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDefaultMaterialData {
  name: string;
  material_type: MaterialType;
  image_url?: string | null;
  low_price?: number | null;
  moderate_price?: number | null;
  steep_price?: number | null;
  flat_price?: number | null;
  multi_story_surcharge?: number | null;
  sort_order?: number;
}

export interface UpdateDefaultMaterialData extends Partial<CreateDefaultMaterialData> {
  id: string;
}

export interface InstantEstimatorLead {
  id: string;
  organization_id: string;
  estimator_id: string;
  opportunity_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  property_address: string | null;
  property_city: string | null;
  property_state: string | null;
  property_zip: string | null;
  selected_material: string | null;
  estimated_price: number | null;
  roof_sqft: number | null;
  pitch_category: string | null;
  pipeline_type: LeadPipelineType;
  status: LeadStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateLeadData {
  estimator_id: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  property_address?: string | null;
  property_city?: string | null;
  property_state?: string | null;
  property_zip?: string | null;
  selected_material?: string | null;
  estimated_price?: number | null;
  roof_sqft?: number | null;
  pitch_category?: string | null;
  pipeline_type?: LeadPipelineType;
  metadata?: Record<string, unknown>;
}
