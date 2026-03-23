export type ChannelType =
  | 'google_ads'
  | 'meta_ads'
  | 'tiktok_ads'
  | 'microsoft_ads'
  | 'local_services_ads'
  | 'youtube'
  | 'call_tracking'
  | 'gbp'
  | 'organic_social'
  | 'direct'
  | 'referral'
  | 'email'
  | 'sms'
  | 'unknown';

export type ApprovalMode =
  | 'manual_only'
  | 'recommend_and_approve'
  | 'assisted_autopilot'
  | 'full_autopilot';

export type RecommendationType =
  | 'budget_shift'
  | 'campaign_launch'
  | 'campaign_pause'
  | 'funnel_fix'
  | 'followup_reactivation'
  | 'content_suggestion'
  | 'attribution_issue'
  | 'tracking_issue'
  | 'storm_response'
  | 'stale_estimate';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'pending_approval';

export type ExecutionState = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';

export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'snoozed' | 'auto_approved';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type ServiceType =
  | 'residential_roofing'
  | 'commercial_roofing'
  | 'roof_repair'
  | 'emergency_tarp'
  | 'siding'
  | 'gutters'
  | 'solar'
  | 'remodeling'
  | 'custom';

export type GoalType =
  | 'calls'
  | 'form_leads'
  | 'roof_inspections'
  | 'financing_leads'
  | 'emergency_repairs'
  | 'storm_response'
  | 'estimates_booked'
  | 'brand_awareness'
  | 'reviews_referrals';

export type AppointmentStatus = 'none' | 'scheduled' | 'completed' | 'no_show' | 'cancelled';
export type EstimateStatus = 'none' | 'sent' | 'viewed' | 'accepted' | 'rejected';
export type ProposalStatus = 'none' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
export type JobStatus = 'none' | 'won' | 'lost' | 'in_progress' | 'completed';

export interface MarketingAccount {
  id: string;
  org_id: string;
  channel: ChannelType;
  account_name: string;
  account_id?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  spend_mtd: number;
  leads_mtd: number;
  jobs_won: number;
  last_sync?: string;
  pixel_status: 'healthy' | 'issues' | 'missing' | 'not_applicable';
  issues: string[];
}

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  goal: GoalType;
  service_type: ServiceType;
  geography: string;
  budget_daily: number;
  budget_monthly: number;
  offer_type: string;
  destination: string;
  channels: ChannelType[];
  status: CampaignStatus;
  spend: number;
  leads: number;
  appointments: number;
  estimates: number;
  jobs_won: number;
  revenue: number;
  cpl: number;
  cpa: number;
  close_rate: number;
  created_at: string;
  generated_assets?: GeneratedCampaignAssets;
}

export interface GeneratedCampaignAssets {
  headlines: string[];
  primary_text: string[];
  descriptions: string[];
  ctas: string[];
  audience_suggestions: string[];
  keyword_suggestions: string[];
  negative_keywords: string[];
  creative_prompts: string[];
  landing_page_structure: string;
  form_fields: string[];
  followup_automation_draft: string;
}

export interface AttributionRecord {
  id: string;
  org_id: string;
  contact_id: string;
  contact_name: string;
  opportunity_id?: string;
  channel: ChannelType;
  campaign_id?: string;
  campaign_name?: string;
  ad_group?: string;
  keyword?: string;
  landing_page?: string;
  form_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  first_touch: string;
  last_touch: string;
  assigned_rep?: string;
  appointment_status: AppointmentStatus;
  estimate_status: EstimateStatus;
  proposal_status: ProposalStatus;
  job_status: JobStatus;
  revenue_value: number;
  service_type?: ServiceType;
  city?: string;
  zip?: string;
  is_repeat_customer: boolean;
}

export interface SierraRecommendation {
  id: string;
  org_id: string;
  type: RecommendationType;
  title: string;
  rationale: string;
  expected_impact: string;
  confidence_score: number;
  linked_entities: LinkedEntity[];
  status: 'active' | 'dismissed' | 'acted_upon';
  created_at: string;
}

export interface SierraAction {
  id: string;
  org_id: string;
  recommendation_id?: string;
  type: RecommendationType;
  title: string;
  rationale: string;
  expected_impact: string;
  confidence_score: number;
  linked_entities: LinkedEntity[];
  approval_state: ApprovalState;
  execution_state: ExecutionState;
  executed_at?: string;
  result_summary?: string;
  can_rollback: boolean;
  created_at: string;
}

export interface LinkedEntity {
  type: 'campaign' | 'channel' | 'funnel' | 'form' | 'contact' | 'opportunity';
  id: string;
  label: string;
}

export interface MarketingAlert {
  id: string;
  org_id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  channel?: ChannelType;
  resolved: boolean;
  created_at: string;
}

export interface Experiment {
  id: string;
  org_id: string;
  name: string;
  hypothesis: string;
  variant_a: string;
  variant_b: string;
  status: 'running' | 'completed' | 'paused';
  winner?: 'a' | 'b' | 'inconclusive';
  lift?: number;
  created_at: string;
}

export interface MarketingFunnel {
  id: string;
  org_id: string;
  name: string;
  funnel_type: string;
  headline: string;
  offer: string;
  form_id?: string;
  automation_id?: string;
  submissions: number;
  appointments_booked: number;
  close_rate: number;
  status: 'active' | 'draft' | 'paused';
}

export interface SocialPost {
  id: string;
  org_id: string;
  content: string;
  platforms: string[];
  scheduled_at?: string;
  published_at?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  source_type?: 'job' | 'review' | 'manual' | 'storm' | 'template';
  source_id?: string;
  image_url?: string;
  created_at: string;
}

export interface MarketingKPIs {
  leads: number;
  leads_change: number;
  booked_appointments: number;
  booked_appointments_change: number;
  estimates_sent: number;
  estimates_sent_change: number;
  jobs_won: number;
  jobs_won_change: number;
  revenue_influenced: number;
  revenue_influenced_change: number;
  cost_per_lead: number;
  cost_per_appointment: number;
  cost_per_estimate: number;
  cost_per_won_job: number;
  close_rate: number;
  close_rate_change: number;
  total_spend: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  rate?: number;
}

export interface ChannelPerformance {
  channel: ChannelType;
  spend: number;
  leads: number;
  appointments: number;
  estimates: number;
  jobs_won: number;
  revenue: number;
  cpl: number;
  close_rate: number;
  roas: number;
}

export interface CampaignWizardState {
  goal?: GoalType;
  service_type?: ServiceType;
  geography?: string;
  geography_type?: 'service_area' | 'radius' | 'zip_list' | 'storm_zones';
  budget_mode?: 'conservative' | 'balanced' | 'aggressive' | 'storm_surge';
  budget_daily?: number;
  offer_type?: string;
  channels?: ChannelType[];
  destination?: 'existing_funnel' | 'generated_landing_page' | 'embedded_form' | 'click_to_call';
  approval_mode?: 'auto_launch' | 'review_before_launch' | 'draft_only';
}
