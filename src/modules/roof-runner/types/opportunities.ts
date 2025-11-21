export type OpportunityStatus = 'open' | 'won' | 'lost' | 'abandoned';

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  order_position: number;
  color: string;
  include_in_funnel: boolean;
  include_in_distribution: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineWithStages extends Pipeline {
  stages: PipelineStage[];
}

export interface OpportunityContact {
  id: string;
  opportunity_id: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  is_primary: boolean;
  created_at: string;
}

export interface OpportunityFollower {
  id: string;
  opportunity_id: string;
  user_id: string;
  created_at: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  pipeline_id: string;
  stage_id: string;
  opportunity_name: string;
  status: OpportunityStatus;
  value: number;
  owner_id?: string;
  business_name?: string;
  source?: string;
  tags?: string[];
  appointment_time?: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityWithDetails extends Opportunity {
  contacts?: OpportunityContact[];
  followers?: OpportunityFollower[];
  pipeline?: Pipeline;
  stage?: PipelineStage;
}

export interface OpportunityFormData {
  opportunity_name: string;
  pipeline_id: string;
  stage_id: string;
  status: OpportunityStatus;
  value: number;
  owner_id?: string;
  business_name?: string;
  source?: string;
  tags?: string[];
  appointment_time?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  follower_ids?: string[];
}

export interface CreateOpportunityRequest {
  opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>;
  contact?: Omit<OpportunityContact, 'id' | 'opportunity_id' | 'created_at'>;
  follower_ids?: string[];
}

export interface PipelineFormData {
  name: string;
  description?: string;
  is_default: boolean;
  stages: Array<{
    name: string;
    color: string;
    order_position: number;
    include_in_funnel?: boolean;
    include_in_distribution?: boolean;
  }>;
}

export const OPPORTUNITY_SOURCES = [
  'Website Lead',
  'Referral',
  'Cold Call',
  'Social Media',
  'Email Campaign',
  'Trade Show',
  'Partner',
  'Other'
] as const;

export const STAGE_COLORS = [
  { name: 'Red', value: '#dc2626', tw: 'border-red-600' },
  { name: 'Blue', value: '#2563eb', tw: 'border-blue-600' },
  { name: 'Yellow', value: '#eab308', tw: 'border-yellow-500' },
  { name: 'Green', value: '#16a34a', tw: 'border-green-600' },
  { name: 'Purple', value: '#9333ea', tw: 'border-purple-600' },
  { name: 'Emerald', value: '#10b981', tw: 'border-emerald-500' },
  { name: 'Indigo', value: '#6366f1', tw: 'border-indigo-500' },
  { name: 'Orange', value: '#ea580c', tw: 'border-orange-600' },
  { name: 'Pink', value: '#ec4899', tw: 'border-pink-500' },
] as const;
