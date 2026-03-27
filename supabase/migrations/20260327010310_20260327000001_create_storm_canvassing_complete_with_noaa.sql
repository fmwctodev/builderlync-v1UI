/*
  # Storm Canvassing Complete Schema + NOAA Integration Columns

  ## Summary
  Creates all storm canvassing tables using user_id-based scoping (matching the
  existing database pattern), and adds NOAA integration columns for real weather
  data ingestion from the NWS Alerts API.

  ## Tables Created
  - storm_ingestion_jobs - Tracks data ingestion runs (created first for FK)
  - storm_events - Storm event records (with noaa_alert_id for deduplication)
  - storm_layers - GeoJSON layers associated with storm events
  - turfs - Geographic areas for canvassing teams
  - turf_assignments - Links users to turfs
  - doors - Individual properties to canvass
  - canvass_visits - Door knock visit logs
  - canvass_media - Photos/videos from canvassing
  - contact_reveals - Contact info reveal records and cache
  - credit_ledger - Audit trail for contact reveal credits
  - canvass_leads - Leads generated from canvassing
  - canvass_appointments - Inspection appointments from leads
  - canvass_org_settings - Per-user canvassing configuration (with operating_states)
  - storm_processing_runs - Tracks processing pipeline runs
  - door_storm_matches - Links doors to storm events
  - rep_locations - Real-time rep GPS positions

  ## Key Design Decisions
  - Uses user_id (auth.uid()) for tenant scoping, matching the existing DB pattern
  - organization_id stored as text (mock UUID from OrgContext) for API compatibility
  - noaa_alert_id on storm_events enables NWS alert deduplication
  - operating_states on canvass_org_settings stores monitored US state codes

  ## Security
  RLS enabled on all tables with user_id-scoped policies
*/

-- ============================================
-- ENUMS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='storm_layer_type') THEN
    CREATE TYPE storm_layer_type AS ENUM ('HAIL','WIND','TORNADO','FLOOD','HURRICANE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='storm_layer_format') THEN
    CREATE TYPE storm_layer_format AS ENUM ('GEOJSON','TILESET_URL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='turf_status') THEN
    CREATE TYPE turf_status AS ENUM ('NOT_STARTED','IN_PROGRESS','COMPLETED','ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='turf_assignment_status') THEN
    CREATE TYPE turf_assignment_status AS ENUM ('ASSIGNED','ACTIVE','DONE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_outcome') THEN
    CREATE TYPE canvass_outcome AS ENUM ('NO_ANSWER','INTERESTED','NOT_INTERESTED','FOLLOW_UP','APPOINTMENT_SET','DO_NOT_KNOCK','NOT_HOME','CALLBACK_REQUESTED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_media_type') THEN
    CREATE TYPE canvass_media_type AS ENUM ('PHOTO','VIDEO','DOCUMENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='contact_provider_type') THEN
    CREATE TYPE contact_provider_type AS ENUM ('MOCK','HAILTRACE','HAIL_RECON');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='credit_ledger_type') THEN
    CREATE TYPE credit_ledger_type AS ENUM ('CONTACT_REVEAL','TOPUP','ADJUSTMENT','REFUND');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_lead_status') THEN
    CREATE TYPE canvass_lead_status AS ENUM ('NEW','CONTACTED','SCHEDULED','WON','LOST');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_lead_source') THEN
    CREATE TYPE canvass_lead_source AS ENUM ('CANVASSING','REFERRAL','IMPORT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='storm_event_status') THEN
    CREATE TYPE storm_event_status AS ENUM ('processing','ready','archived','failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='hail_severity_band') THEN
    CREATE TYPE hail_severity_band AS ENUM ('trace','quarter','half','golf_ball','baseball');
  END IF;
END $$;

-- ============================================
-- STORM INGESTION JOBS (before storm_events for FK)
-- ============================================
CREATE TABLE IF NOT EXISTS storm_ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  source_type text NOT NULL DEFAULT 'MOCK' CHECK (source_type IN ('MRMS','NEXRAD','MOCK','NOAA')),
  date_from timestamptz,
  date_to timestamptz,
  bbox jsonb,
  status storm_event_status NOT NULL DEFAULT 'processing',
  log text,
  raw_file_refs jsonb DEFAULT '[]',
  record_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE storm_ingestion_jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_ingestion_jobs' AND policyname='Ingestion jobs select own') THEN
    CREATE POLICY "Ingestion jobs select own" ON storm_ingestion_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Ingestion jobs insert own" ON storm_ingestion_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Ingestion jobs update own" ON storm_ingestion_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- STORM EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS storm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  provider text NOT NULL DEFAULT 'MOCK',
  external_id text,
  name text NOT NULL,
  description text,
  event_date date,
  event_start timestamptz,
  event_end timestamptz,
  bbox jsonb,
  center_lat double precision,
  center_lng double precision,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  status storm_event_status DEFAULT 'ready',
  max_hail_estimate double precision,
  confidence_score double precision,
  ingestion_job_id uuid REFERENCES storm_ingestion_jobs(id) ON DELETE SET NULL,
  noaa_alert_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
ALTER TABLE storm_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_events' AND policyname='Storm events select own') THEN
    CREATE POLICY "Storm events select own" ON storm_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Storm events insert own" ON storm_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Storm events update own" ON storm_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Storm events delete own" ON storm_events FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_storm_events_noaa_alert
  ON storm_events(user_id, noaa_alert_id)
  WHERE noaa_alert_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_storm_events_user_provider ON storm_events(user_id, provider);

-- ============================================
-- STORM LAYERS
-- ============================================
CREATE TABLE IF NOT EXISTS storm_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  storm_event_id uuid NOT NULL REFERENCES storm_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  layer_type storm_layer_type NOT NULL DEFAULT 'HAIL',
  format storm_layer_format NOT NULL DEFAULT 'GEOJSON',
  geojson jsonb,
  source_url text,
  min_threshold double precision,
  max_threshold double precision,
  style jsonb DEFAULT '{}',
  is_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  tile_template text,
  source_path text,
  generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE storm_layers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_layers' AND policyname='Storm layers select own') THEN
    CREATE POLICY "Storm layers select own" ON storm_layers FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Storm layers insert own" ON storm_layers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Storm layers update own" ON storm_layers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Storm layers delete own" ON storm_layers FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_storm_layers_event ON storm_layers(storm_event_id);

-- ============================================
-- TURFS
-- ============================================
CREATE TABLE IF NOT EXISTS turfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  geometry jsonb NOT NULL DEFAULT '{"type":"MultiPolygon","coordinates":[]}',
  bbox jsonb,
  status turf_status NOT NULL DEFAULT 'NOT_STARTED',
  total_doors integer DEFAULT 0,
  visited_doors integer DEFAULT 0,
  color text DEFAULT '#3B82F6',
  priority integer DEFAULT 2,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='turfs' AND policyname='Turfs select own') THEN
    CREATE POLICY "Turfs select own" ON turfs FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Turfs insert own" ON turfs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Turfs update own" ON turfs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Turfs delete own" ON turfs FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_turfs_user_status ON turfs(user_id, status);

-- ============================================
-- TURF ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS turf_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  turf_id uuid NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  assigned_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status turf_assignment_status NOT NULL DEFAULT 'ASSIGNED',
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(turf_id, assigned_user_id)
);
ALTER TABLE turf_assignments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='turf_assignments' AND policyname='Turf assignments select own') THEN
    CREATE POLICY "Turf assignments select own" ON turf_assignments FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Turf assignments insert own" ON turf_assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Turf assignments update own" ON turf_assignments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Turf assignments delete own" ON turf_assignments FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- DOORS
-- ============================================
CREATE TABLE IF NOT EXISTS doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  turf_id uuid REFERENCES turfs(id) ON DELETE SET NULL,
  normalized_address text,
  address1 text NOT NULL,
  address2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text DEFAULT 'US',
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  parcel_id text,
  property_type text,
  last_visit_at timestamptz,
  last_outcome canvass_outcome,
  visit_count integer DEFAULT 0,
  is_do_not_knock boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  linked_contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  linked_opportunity_id uuid,
  linked_job_id bigint,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE doors ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='doors' AND policyname='Doors select own') THEN
    CREATE POLICY "Doors select own" ON doors FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Doors insert own" ON doors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Doors update own" ON doors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Doors delete own" ON doors FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_doors_user_turf ON doors(user_id, turf_id);
CREATE INDEX IF NOT EXISTS idx_doors_linked_contact ON doors(linked_contact_id) WHERE linked_contact_id IS NOT NULL;

-- ============================================
-- CANVASS VISITS
-- ============================================
CREATE TABLE IF NOT EXISTS canvass_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES turfs(id) ON DELETE SET NULL,
  outcome canvass_outcome NOT NULL,
  notes text,
  tags text[] DEFAULT '{}',
  objections jsonb DEFAULT '[]',
  duration_seconds integer,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_offline_synced boolean DEFAULT true,
  device_visit_id text,
  device_lat double precision,
  device_lng double precision,
  UNIQUE(user_id, device_visit_id)
);
ALTER TABLE canvass_visits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_visits' AND policyname='Canvass visits select own') THEN
    CREATE POLICY "Canvass visits select own" ON canvass_visits FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Canvass visits insert own" ON canvass_visits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Canvass visits update own" ON canvass_visits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_canvass_visits_door ON canvass_visits(door_id);
CREATE INDEX IF NOT EXISTS idx_canvass_visits_user_date ON canvass_visits(user_id, occurred_at DESC);

-- ============================================
-- CANVASS MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS canvass_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  door_id uuid REFERENCES doors(id) ON DELETE SET NULL,
  visit_id uuid REFERENCES canvass_visits(id) ON DELETE SET NULL,
  media_type canvass_media_type NOT NULL DEFAULT 'PHOTO',
  file_name text,
  file_size integer,
  mime_type text,
  url text NOT NULL,
  thumbnail_url text,
  caption text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE canvass_media ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_media' AND policyname='Canvass media select own') THEN
    CREATE POLICY "Canvass media select own" ON canvass_media FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Canvass media insert own" ON canvass_media FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Canvass media delete own" ON canvass_media FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_canvass_media_door ON canvass_media(door_id);

-- ============================================
-- CONTACT REVEALS
-- ============================================
CREATE TABLE IF NOT EXISTS contact_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  provider contact_provider_type NOT NULL DEFAULT 'MOCK',
  credits_used integer DEFAULT 1,
  revealed_at timestamptz DEFAULT now(),
  name text,
  phones text[] DEFAULT '{}',
  emails text[] DEFAULT '{}',
  fields_returned jsonb DEFAULT '{}',
  cache_key text,
  expires_at timestamptz
);
ALTER TABLE contact_reveals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_reveals' AND policyname='Contact reveals select own') THEN
    CREATE POLICY "Contact reveals select own" ON contact_reveals FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Contact reveals insert own" ON contact_reveals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- CREDIT LEDGER
-- ============================================
CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  ledger_type credit_ledger_type NOT NULL,
  delta integer NOT NULL,
  reason text,
  related_id uuid,
  balance_after integer,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='credit_ledger' AND policyname='Credit ledger select own') THEN
    CREATE POLICY "Credit ledger select own" ON credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Credit ledger insert own" ON credit_ledger FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- CANVASS LEADS
-- ============================================
CREATE TABLE IF NOT EXISTS canvass_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  door_id uuid REFERENCES doors(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  source canvass_lead_source NOT NULL DEFAULT 'CANVASSING',
  status canvass_lead_status NOT NULL DEFAULT 'NEW',
  name text,
  phone text,
  email text,
  address text,
  notes text,
  estimated_value numeric(12,2),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  scheduled_at timestamptz,
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text
);
ALTER TABLE canvass_leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_leads' AND policyname='Canvass leads select own') THEN
    CREATE POLICY "Canvass leads select own" ON canvass_leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Canvass leads insert own" ON canvass_leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Canvass leads update own" ON canvass_leads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Canvass leads delete own" ON canvass_leads FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- CANVASS APPOINTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS canvass_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  lead_id uuid NOT NULL REFERENCES canvass_leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  location_text text,
  status text DEFAULT 'scheduled',
  reminder_sent boolean DEFAULT false,
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE canvass_appointments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_appointments' AND policyname='Canvass appointments select own') THEN
    CREATE POLICY "Canvass appointments select own" ON canvass_appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Canvass appointments insert own" ON canvass_appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Canvass appointments update own" ON canvass_appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- CANVASS ORG SETTINGS (per-user, with operating_states)
-- ============================================
CREATE TABLE IF NOT EXISTS canvass_org_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  contact_reveal_cache_hours integer DEFAULT 720,
  contact_reveal_cost integer DEFAULT 1,
  allow_gps_tracking boolean DEFAULT false,
  offline_sync_enabled boolean DEFAULT true,
  default_door_density integer DEFAULT 150,
  default_storm_provider text DEFAULT 'MOCK',
  default_contact_provider text DEFAULT 'MOCK',
  hailtrace_api_key text,
  hail_recon_api_key text,
  mapbox_style_url text,
  noaa_mode text DEFAULT 'mock' CHECK (noaa_mode IN ('mock','live')),
  mrms_base_url text,
  hail_threshold_inches double precision DEFAULT 0.75,
  data_retention_days integer DEFAULT 365,
  operating_states text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE canvass_org_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_org_settings' AND policyname='Canvass settings select own') THEN
    CREATE POLICY "Canvass settings select own" ON canvass_org_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Canvass settings insert own" ON canvass_org_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Canvass settings update own" ON canvass_org_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- STORM PROCESSING RUNS
-- ============================================
CREATE TABLE IF NOT EXISTS storm_processing_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingestion_job_id uuid NOT NULL REFERENCES storm_ingestion_jobs(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  algorithm_version text NOT NULL DEFAULT '1.0.0',
  thresholds_used jsonb DEFAULT '{}',
  summary jsonb DEFAULT '{}',
  status storm_event_status NOT NULL DEFAULT 'processing',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE storm_processing_runs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_processing_runs' AND policyname='Processing runs select own') THEN
    CREATE POLICY "Processing runs select own" ON storm_processing_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Processing runs insert own" ON storm_processing_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Processing runs update own" ON storm_processing_runs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- DOOR STORM MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS door_storm_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  storm_event_id uuid NOT NULL REFERENCES storm_events(id) ON DELETE CASCADE,
  max_hail_estimate double precision,
  severity_band hail_severity_band,
  confidence_score double precision,
  matched_at timestamptz DEFAULT now(),
  UNIQUE(door_id, storm_event_id)
);
ALTER TABLE door_storm_matches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='door_storm_matches' AND policyname='Door matches select own') THEN
    CREATE POLICY "Door matches select own" ON door_storm_matches FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Door matches insert own" ON door_storm_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Door matches update own" ON door_storm_matches FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_door_storm_matches_door ON door_storm_matches(door_id);
CREATE INDEX IF NOT EXISTS idx_door_storm_matches_event ON door_storm_matches(storm_event_id);

-- ============================================
-- REP LOCATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS rep_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);
ALTER TABLE rep_locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rep_locations' AND policyname='Rep locations select own') THEN
    CREATE POLICY "Rep locations select own" ON rep_locations FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Rep locations insert own" ON rep_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Rep locations update own" ON rep_locations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_rep_locations_user ON rep_locations(user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'storm_events','storm_layers','turfs','doors','canvass_leads',
    'canvass_appointments','canvass_org_settings','storm_ingestion_jobs'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_upd ON %I; CREATE TRIGGER trg_%I_upd BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;
