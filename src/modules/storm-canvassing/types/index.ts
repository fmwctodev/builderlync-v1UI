export type StormProvider = 'MOCK' | 'HAILTRACE' | 'HAIL_RECON' | 'NOAA';
export type ContactProvider = 'MOCK' | 'HAILTRACE' | 'HAIL_RECON';
export type StormLayerType = 'HAIL' | 'WIND' | 'TORNADO' | 'FLOOD' | 'HURRICANE';
export type StormLayerFormat = 'GEOJSON' | 'TILESET_URL';
export type TurfStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type TurfAssignmentStatus = 'ASSIGNED' | 'ACTIVE' | 'DONE';
export type CanvassOutcome =
  | 'NO_ANSWER'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'FOLLOW_UP'
  | 'APPOINTMENT_SET'
  | 'DO_NOT_KNOCK'
  | 'NOT_HOME'
  | 'CALLBACK_REQUESTED';
export type CanvassMediaType = 'PHOTO' | 'VIDEO' | 'DOCUMENT';
export type CreditLedgerType = 'CONTACT_REVEAL' | 'TOPUP' | 'ADJUSTMENT' | 'REFUND';
export type CanvassLeadStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'WON' | 'LOST';
export type CanvassLeadSource = 'CANVASSING' | 'REFERRAL' | 'IMPORT';
export type StormEventStatus = 'PROCESSING' | 'ACTIVE' | 'ARCHIVED' | 'FAILED';
export type HailSeverityBand = 'TRACE' | 'QUARTER' | 'HALF' | 'THREE_QUARTER' | 'ONE_INCH' | 'GOLF_BALL' | 'BASEBALL';
export type IngestionJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface StormEvent {
  id: string;
  organization_id: string;
  provider: StormProvider;
  external_id?: string;
  name: string;
  description?: string;
  event_date?: string;
  event_start?: string;
  event_end?: string;
  bbox?: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
  center_lat?: number;
  center_lng?: number;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  status?: StormEventStatus;
  max_hail_estimate?: number;
  confidence_score?: number;
  ingestion_job_id?: string;
  noaa_alert_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  layers?: StormLayer[];
}

export interface StormLayer {
  id: string;
  organization_id: string;
  storm_event_id: string;
  name: string;
  layer_type: StormLayerType;
  format: StormLayerFormat;
  geojson?: GeoJSON.FeatureCollection;
  source_url?: string;
  min_threshold?: number;
  max_threshold?: number;
  style?: LayerStyle;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LayerStyle {
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  colorScale?: {
    property: string;
    stops: Array<{ value: number; color: string }>;
  };
}

export interface StormIngestionJob {
  id: string;
  organization_id: string;
  provider: StormProvider;
  status: IngestionJobStatus;
  started_at?: string;
  completed_at?: string;
  events_found: number;
  events_imported: number;
  error_message?: string;
  config?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StormProcessingRun {
  id: string;
  storm_event_id: string;
  organization_id: string;
  run_type: string;
  status: IngestionJobStatus;
  doors_matched: number;
  doors_processed: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface DoorStormMatch {
  id: string;
  door_id: string;
  storm_event_id: string;
  organization_id: string;
  hail_size_inches?: number;
  severity_band?: HailSeverityBand;
  wind_speed_mph?: number;
  confidence?: number;
  matched_at: string;
  created_at: string;
}

export interface Turf {
  id: string;
  organization_id: string;
  storm_event_id?: string;
  name: string;
  description?: string;
  geometry: GeoJSON.MultiPolygon;
  bbox?: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
  status: TurfStatus;
  total_doors: number;
  visited_doors: number;
  color: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assignments?: TurfAssignment[];
  progress?: TurfProgress;
}

export interface TurfAssignment {
  id: string;
  organization_id: string;
  turf_id: string;
  user_id: string;
  status: TurfAssignmentStatus;
  assigned_at: string;
  assigned_by?: string;
  started_at?: string;
  completed_at?: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface TurfProgress {
  total: number;
  visited: number;
  unvisited: number;
  do_not_knock: number;
  interested: number;
  appointment_set: number;
  completion_pct: number;
}

export interface Door {
  id: string;
  organization_id: string;
  turf_id?: string;
  normalized_address?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  parcel_id?: string;
  property_type?: string;
  last_visit_at?: string;
  last_outcome?: CanvassOutcome;
  visit_count: number;
  is_do_not_knock: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  visits?: CanvassVisit[];
  revealed_contact?: ContactReveal;
  storm_match?: DoorStormMatch;
}

export interface CanvassVisit {
  id: string;
  organization_id: string;
  door_id: string;
  turf_id?: string;
  user_id: string;
  outcome: CanvassOutcome;
  notes?: string;
  tags: string[];
  duration_seconds?: number;
  occurred_at: string;
  created_at: string;
  is_offline_synced: boolean;
  device_visit_id?: string;
  device_lat?: number;
  device_lng?: number;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface CanvassMedia {
  id: string;
  organization_id: string;
  door_id?: string;
  visit_id?: string;
  user_id: string;
  media_type: CanvassMediaType;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ContactReveal {
  id: string;
  organization_id: string;
  door_id: string;
  provider: ContactProvider;
  revealed_by: string;
  credits_used: number;
  revealed_at: string;
  name?: string;
  phones: string[];
  emails: string[];
  fields_returned?: Record<string, unknown>;
  cache_key?: string;
  expires_at?: string;
}

export interface CreditLedgerEntry {
  id: string;
  organization_id: string;
  ledger_type: CreditLedgerType;
  delta: number;
  reason?: string;
  related_id?: string;
  balance_after?: number;
  created_by?: string;
  created_at: string;
}

export interface CanvassLead {
  id: string;
  organization_id: string;
  door_id?: string;
  contact_id?: string;
  source: CanvassLeadSource;
  status: CanvassLeadStatus;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  estimated_value?: number;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  contacted_at?: string;
  scheduled_at?: string;
  won_at?: string;
  lost_at?: string;
  lost_reason?: string;
  appointments?: CanvassAppointment[];
}

export interface CanvassAppointment {
  id: string;
  organization_id: string;
  lead_id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  location_text?: string;
  location?: {
    lat: number;
    lng: number;
  };
  status: string;
  reminder_sent: boolean;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CanvassOrgSettings {
  organization_id: string;
  contact_reveal_cache_hours: number;
  contact_reveal_cost: number;
  allow_gps_tracking: boolean;
  offline_sync_enabled: boolean;
  default_door_density: number;
  default_storm_provider: StormProvider;
  default_contact_provider: ContactProvider;
  hailtrace_api_key?: string;
  hail_recon_api_key?: string;
  mapbox_style_url?: string;
  noaa_mode?: 'mock' | 'live';
  mrms_base_url?: string;
  hail_threshold_inches?: number;
  operating_states?: string[];
  created_at: string;
  updated_at: string;
}

export interface BulkSyncResult {
  created: number;
  duplicates: number;
  errors: number;
  details: Array<{
    device_visit_id: string;
    status: 'created' | 'duplicate' | 'error';
    id?: string;
    error?: string;
  }>;
}

export interface RepLocation {
  user_id: string;
  organization_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  current_turf_id?: string;
  is_active: boolean;
  updated_at: string;
}

export interface TeamMemberLocation {
  user_id: string;
  full_name?: string;
  email: string;
  lat: number;
  lng: number;
  updated_at: string;
  current_turf_id?: string;
  today_visits: number;
}

export interface RepLeaderboardEntry {
  user_id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  total_visits: number;
  interested_count: number;
  appointment_set_count: number;
  doors_knocked: number;
  conversion_rate: number;
  rank: number;
}

export interface ManagerKPIs {
  total_doors: number;
  total_visited: number;
  completion_pct: number;
  total_interested: number;
  total_appointments: number;
  active_reps: number;
  turfs_in_progress: number;
  turfs_completed: number;
}

export interface CanvassKPIs {
  period: {
    start: string;
    end: string;
  };
  doors_knocked: number;
  unique_addresses: number;
  interested_count: number;
  interested_rate: number;
  appointments_set: number;
  appointment_rate: number;
  leads_created: number;
  credits_used: number;
  by_rep: Array<{
    user_id: string;
    full_name?: string;
    doors_knocked: number;
    interested_count: number;
    appointments_set: number;
  }>;
  by_outcome: Record<CanvassOutcome, number>;
}

export interface NOAAConfig {
  enabled: boolean;
  mrmsBaseUrl: string;
  hailThresholdInches: number;
  autoIngestEnabled: boolean;
  ingestIntervalMinutes: number;
  operatingStates: string[];
}

export interface NOAAIngestionResult {
  events: StormEvent[];
  eventsCreated: number;
  layersCreated: number;
  duplicatesSkipped: number;
}

export const HAIL_SEVERITY_COLORS: Record<HailSeverityBand, string> = {
  TRACE: '#FEF3C7',
  QUARTER: '#FDE68A',
  HALF: '#FBBF24',
  THREE_QUARTER: '#F59E0B',
  ONE_INCH: '#EF4444',
  GOLF_BALL: '#DC2626',
  BASEBALL: '#991B1B',
};

export const HAIL_SIZE_THRESHOLDS: Record<HailSeverityBand, number> = {
  TRACE: 0.1,
  QUARTER: 0.25,
  HALF: 0.5,
  THREE_QUARTER: 0.75,
  ONE_INCH: 1.0,
  GOLF_BALL: 1.75,
  BASEBALL: 2.75,
};

export function getHailSeverityBand(sizeInches: number): HailSeverityBand {
  if (sizeInches >= HAIL_SIZE_THRESHOLDS.BASEBALL) return 'BASEBALL';
  if (sizeInches >= HAIL_SIZE_THRESHOLDS.GOLF_BALL) return 'GOLF_BALL';
  if (sizeInches >= HAIL_SIZE_THRESHOLDS.ONE_INCH) return 'ONE_INCH';
  if (sizeInches >= HAIL_SIZE_THRESHOLDS.THREE_QUARTER) return 'THREE_QUARTER';
  if (sizeInches >= HAIL_SIZE_THRESHOLDS.HALF) return 'HALF';
  if (sizeInches >= HAIL_SIZE_THRESHOLDS.QUARTER) return 'QUARTER';
  return 'TRACE';
}
