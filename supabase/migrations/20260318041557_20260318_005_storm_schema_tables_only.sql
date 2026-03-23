/*
  # Storm Intelligence Schema - Tables and Policies

  Short title: Creates all storm canvassing tables, enums, policies, and indexes

  ## Tables Created
  storm_layers, turfs, turf_assignments, doors, canvass_visits, canvass_media,
  contact_reveals, credit_ledger, canvass_leads, canvass_appointments,
  canvass_org_settings, storm_ingestion_jobs, storm_processing_runs,
  door_storm_matches, rep_locations

  ## Security
  RLS enabled with org-scoped policies on all tables

  ## Notes
  Helper functions in separate migration
*/

-- Drop conflicting empty tables
DROP TABLE IF EXISTS canvass_visits CASCADE;
DROP TABLE IF EXISTS canvass_leads CASCADE;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='storm_layer_type') THEN CREATE TYPE storm_layer_type AS ENUM ('HAIL','WIND','TORNADO','FLOOD'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='storm_layer_format') THEN CREATE TYPE storm_layer_format AS ENUM ('GEOJSON','TILESET_URL'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='turf_status') THEN CREATE TYPE turf_status AS ENUM ('NOT_STARTED','IN_PROGRESS','COMPLETED','ARCHIVED'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='turf_assignment_status') THEN CREATE TYPE turf_assignment_status AS ENUM ('ASSIGNED','ACTIVE','DONE'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_outcome') THEN CREATE TYPE canvass_outcome AS ENUM ('NO_ANSWER','INTERESTED','NOT_INTERESTED','FOLLOW_UP','APPOINTMENT_SET','DO_NOT_KNOCK','NOT_HOME','CALLBACK_REQUESTED'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_media_type') THEN CREATE TYPE canvass_media_type AS ENUM ('PHOTO','VIDEO','DOCUMENT'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='contact_provider_type') THEN CREATE TYPE contact_provider_type AS ENUM ('MOCK','HAILTRACE','HAIL_RECON'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='credit_ledger_type') THEN CREATE TYPE credit_ledger_type AS ENUM ('CONTACT_REVEAL','TOPUP','ADJUSTMENT','REFUND'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_lead_status') THEN CREATE TYPE canvass_lead_status AS ENUM ('NEW','CONTACTED','SCHEDULED','WON','LOST'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='canvass_lead_source') THEN CREATE TYPE canvass_lead_source AS ENUM ('CANVASSING','REFERRAL','IMPORT'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='storm_event_status') THEN CREATE TYPE storm_event_status AS ENUM ('processing','ready','archived','failed'); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='hail_severity_band') THEN CREATE TYPE hail_severity_band AS ENUM ('trace','quarter','half','golf_ball','baseball'); END IF;
END $$;

-- Enhance storm_events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='provider') THEN ALTER TABLE storm_events ADD COLUMN provider text NOT NULL DEFAULT 'MOCK'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='event_start') THEN ALTER TABLE storm_events ADD COLUMN event_start timestamptz; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='event_end') THEN ALTER TABLE storm_events ADD COLUMN event_end timestamptz; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='bbox') THEN ALTER TABLE storm_events ADD COLUMN bbox jsonb; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='is_active') THEN ALTER TABLE storm_events ADD COLUMN is_active boolean DEFAULT true; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='created_by') THEN ALTER TABLE storm_events ADD COLUMN created_by uuid REFERENCES auth.users(id); END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='status') THEN ALTER TABLE storm_events ADD COLUMN status storm_event_status DEFAULT 'ready'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='max_hail_estimate') THEN ALTER TABLE storm_events ADD COLUMN max_hail_estimate double precision; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='confidence_score') THEN ALTER TABLE storm_events ADD COLUMN confidence_score double precision; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='storm_events' AND column_name='ingestion_job_id') THEN ALTER TABLE storm_events ADD COLUMN ingestion_job_id uuid; END IF;
END $$;

ALTER TABLE storm_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_events' AND policyname='Storm events org select') THEN
    CREATE POLICY "Storm events org select" ON storm_events FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
    CREATE POLICY "Storm events org insert" ON storm_events FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
    CREATE POLICY "Storm events org update" ON storm_events FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
    CREATE POLICY "Storm events org delete" ON storm_events FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  END IF;
END $$;

-- Storm Layers
CREATE TABLE IF NOT EXISTS storm_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storm_event_id uuid NOT NULL REFERENCES storm_events(id) ON DELETE CASCADE,
  name text NOT NULL, layer_type storm_layer_type NOT NULL DEFAULT 'HAIL',
  format storm_layer_format NOT NULL DEFAULT 'GEOJSON',
  geojson jsonb, source_url text, min_threshold double precision, max_threshold double precision,
  style jsonb DEFAULT '{}', is_visible boolean DEFAULT true, display_order integer DEFAULT 0,
  tile_template text, source_path text, generated_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE storm_layers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_layers' AND policyname='Storm layers select') THEN
  CREATE POLICY "Storm layers select" ON storm_layers FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Storm layers insert" ON storm_layers FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Storm layers update" ON storm_layers FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Storm layers delete" ON storm_layers FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Turfs
CREATE TABLE IF NOT EXISTS turfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  name text NOT NULL, description text,
  geometry jsonb NOT NULL DEFAULT '{"type":"MultiPolygon","coordinates":[]}',
  bbox jsonb, status turf_status NOT NULL DEFAULT 'NOT_STARTED',
  total_doors integer DEFAULT 0, visited_doors integer DEFAULT 0,
  color text DEFAULT '#3B82F6', priority integer DEFAULT 2,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='turfs' AND policyname='Turfs select') THEN
  CREATE POLICY "Turfs select" ON turfs FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Turfs insert" ON turfs FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Turfs update" ON turfs FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Turfs delete" ON turfs FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Turf Assignments
CREATE TABLE IF NOT EXISTS turf_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  turf_id uuid NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status turf_assignment_status NOT NULL DEFAULT 'ASSIGNED',
  assigned_at timestamptz DEFAULT now(), assigned_by uuid REFERENCES auth.users(id),
  started_at timestamptz, completed_at timestamptz,
  UNIQUE(turf_id, user_id)
);
ALTER TABLE turf_assignments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='turf_assignments' AND policyname='Turf assignments select') THEN
  CREATE POLICY "Turf assignments select" ON turf_assignments FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Turf assignments insert" ON turf_assignments FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Turf assignments update" ON turf_assignments FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Turf assignments delete" ON turf_assignments FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Doors
CREATE TABLE IF NOT EXISTS doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES turfs(id) ON DELETE SET NULL,
  normalized_address text, address1 text NOT NULL, address2 text,
  city text NOT NULL, state text NOT NULL, zip text NOT NULL, country text DEFAULT 'US',
  lat double precision NOT NULL DEFAULT 0, lng double precision NOT NULL DEFAULT 0,
  parcel_id text, property_type text, last_visit_at timestamptz,
  last_outcome canvass_outcome, visit_count integer DEFAULT 0,
  is_do_not_knock boolean DEFAULT false, metadata jsonb DEFAULT '{}',
  linked_contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  linked_opportunity_id uuid, linked_job_id bigint,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE doors ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='doors' AND policyname='Doors select') THEN
  CREATE POLICY "Doors select" ON doors FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Doors insert" ON doors FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Doors update" ON doors FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Doors delete" ON doors FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Canvass Visits
CREATE TABLE IF NOT EXISTS canvass_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES turfs(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  outcome canvass_outcome NOT NULL, notes text, tags text[] DEFAULT '{}',
  objections jsonb DEFAULT '[]', duration_seconds integer,
  occurred_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz DEFAULT now(),
  is_offline_synced boolean DEFAULT true, device_visit_id text,
  device_lat double precision, device_lng double precision,
  UNIQUE(organization_id, device_visit_id)
);
ALTER TABLE canvass_visits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_visits' AND policyname='Canvass visits select') THEN
  CREATE POLICY "Canvass visits select" ON canvass_visits FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass visits insert" ON canvass_visits FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass visits update" ON canvass_visits FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Canvass Media
CREATE TABLE IF NOT EXISTS canvass_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid REFERENCES doors(id) ON DELETE SET NULL,
  visit_id uuid REFERENCES canvass_visits(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  media_type canvass_media_type NOT NULL DEFAULT 'PHOTO',
  file_name text, file_size integer, mime_type text, url text NOT NULL,
  thumbnail_url text, caption text, metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE canvass_media ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_media' AND policyname='Canvass media select') THEN
  CREATE POLICY "Canvass media select" ON canvass_media FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass media insert" ON canvass_media FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass media delete" ON canvass_media FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Contact Reveals
CREATE TABLE IF NOT EXISTS contact_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  provider contact_provider_type NOT NULL DEFAULT 'MOCK',
  revealed_by uuid NOT NULL REFERENCES auth.users(id),
  credits_used integer DEFAULT 1, revealed_at timestamptz DEFAULT now(),
  name text, phones text[] DEFAULT '{}', emails text[] DEFAULT '{}',
  fields_returned jsonb DEFAULT '{}', cache_key text, expires_at timestamptz
);
ALTER TABLE contact_reveals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_reveals' AND policyname='Contact reveals select') THEN
  CREATE POLICY "Contact reveals select" ON contact_reveals FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Contact reveals insert" ON contact_reveals FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Credit Ledger
CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ledger_type credit_ledger_type NOT NULL, delta integer NOT NULL,
  reason text, related_id uuid, balance_after integer,
  created_by uuid REFERENCES auth.users(id), created_at timestamptz DEFAULT now()
);
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='credit_ledger' AND policyname='Credit ledger select') THEN
  CREATE POLICY "Credit ledger select" ON credit_ledger FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Credit ledger insert" ON credit_ledger FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Canvass Leads
CREATE TABLE IF NOT EXISTS canvass_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid REFERENCES doors(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  source canvass_lead_source NOT NULL DEFAULT 'CANVASSING',
  status canvass_lead_status NOT NULL DEFAULT 'NEW',
  name text, phone text, email text, address text, notes text,
  estimated_value numeric(12,2), assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz, scheduled_at timestamptz,
  won_at timestamptz, lost_at timestamptz, lost_reason text
);
ALTER TABLE canvass_leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_leads' AND policyname='Canvass leads select') THEN
  CREATE POLICY "Canvass leads select" ON canvass_leads FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass leads insert" ON canvass_leads FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass leads update" ON canvass_leads FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass leads delete" ON canvass_leads FOR DELETE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Canvass Appointments
CREATE TABLE IF NOT EXISTS canvass_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES canvass_leads(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  start_at timestamptz NOT NULL, end_at timestamptz NOT NULL,
  location_text text, status text DEFAULT 'scheduled', reminder_sent boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id), assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE canvass_appointments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_appointments' AND policyname='Canvass appointments select') THEN
  CREATE POLICY "Canvass appointments select" ON canvass_appointments FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass appointments insert" ON canvass_appointments FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass appointments update" ON canvass_appointments FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Canvass Org Settings
CREATE TABLE IF NOT EXISTS canvass_org_settings (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  contact_reveal_cache_hours integer DEFAULT 720, contact_reveal_cost integer DEFAULT 1,
  allow_gps_tracking boolean DEFAULT false, offline_sync_enabled boolean DEFAULT true,
  default_door_density integer DEFAULT 150, default_storm_provider text DEFAULT 'MOCK',
  default_contact_provider text DEFAULT 'MOCK',
  hailtrace_api_key text, hail_recon_api_key text, mapbox_style_url text,
  noaa_mode text DEFAULT 'mock' CHECK (noaa_mode IN ('mock','live')),
  mrms_base_url text, hail_threshold_inches double precision DEFAULT 0.75,
  data_retention_days integer DEFAULT 365,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE canvass_org_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='canvass_org_settings' AND policyname='Canvass settings select') THEN
  CREATE POLICY "Canvass settings select" ON canvass_org_settings FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass settings insert" ON canvass_org_settings FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Canvass settings update" ON canvass_org_settings FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Storm Ingestion Jobs
CREATE TABLE IF NOT EXISTS storm_ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type text NOT NULL DEFAULT 'MRMS' CHECK (source_type IN ('MRMS','NEXRAD','MOCK')),
  date_from timestamptz, date_to timestamptz, bbox jsonb,
  status storm_event_status NOT NULL DEFAULT 'processing',
  log text, raw_file_refs jsonb DEFAULT '[]', record_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE storm_ingestion_jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_ingestion_jobs' AND policyname='Ingestion jobs select') THEN
  CREATE POLICY "Ingestion jobs select" ON storm_ingestion_jobs FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Ingestion jobs insert" ON storm_ingestion_jobs FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Ingestion jobs update" ON storm_ingestion_jobs FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='storm_events_ingestion_job_id_fkey') THEN ALTER TABLE storm_events ADD CONSTRAINT storm_events_ingestion_job_id_fkey FOREIGN KEY (ingestion_job_id) REFERENCES storm_ingestion_jobs(id) ON DELETE SET NULL; END IF; END $$;

-- Storm Processing Runs
CREATE TABLE IF NOT EXISTS storm_processing_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_job_id uuid NOT NULL REFERENCES storm_ingestion_jobs(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  algorithm_version text NOT NULL DEFAULT '1.0.0',
  thresholds_used jsonb DEFAULT '{}', summary jsonb DEFAULT '{}',
  status storm_event_status NOT NULL DEFAULT 'processing',
  started_at timestamptz DEFAULT now(), completed_at timestamptz, created_at timestamptz DEFAULT now()
);
ALTER TABLE storm_processing_runs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='storm_processing_runs' AND policyname='Processing runs select') THEN
  CREATE POLICY "Processing runs select" ON storm_processing_runs FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Processing runs insert" ON storm_processing_runs FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Processing runs update" ON storm_processing_runs FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Door Storm Matches
CREATE TABLE IF NOT EXISTS door_storm_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  storm_event_id uuid NOT NULL REFERENCES storm_events(id) ON DELETE CASCADE,
  max_hail_estimate double precision, severity_band hail_severity_band, confidence_score double precision,
  matched_at timestamptz DEFAULT now(), UNIQUE(door_id, storm_event_id)
);
ALTER TABLE door_storm_matches ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='door_storm_matches' AND policyname='Door matches select') THEN
  CREATE POLICY "Door matches select" ON door_storm_matches FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Door matches insert" ON door_storm_matches FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Door matches update" ON door_storm_matches FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true)) WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
END IF; END $$;

-- Rep Locations
CREATE TABLE IF NOT EXISTS rep_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat double precision NOT NULL, lng double precision NOT NULL,
  updated_at timestamptz DEFAULT now(), UNIQUE(organization_id, user_id)
);
ALTER TABLE rep_locations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rep_locations' AND policyname='Rep locations select') THEN
  CREATE POLICY "Rep locations select" ON rep_locations FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Rep locations insert" ON rep_locations FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND organization_id IN (SELECT organization_id FROM organization_members WHERE user_id=auth.uid() AND is_active=true));
  CREATE POLICY "Rep locations update" ON rep_locations FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
END IF; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_turfs_org ON turfs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_doors_org_turf ON doors(organization_id, turf_id);
CREATE INDEX IF NOT EXISTS idx_doors_linked_contact ON doors(linked_contact_id) WHERE linked_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_canvass_visits_door ON canvass_visits(door_id);
CREATE INDEX IF NOT EXISTS idx_canvass_visits_org_user_date ON canvass_visits(organization_id, user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_canvass_media_door ON canvass_media(door_id);
CREATE INDEX IF NOT EXISTS idx_storm_layers_event ON storm_layers(storm_event_id);
CREATE INDEX IF NOT EXISTS idx_door_storm_matches_door ON door_storm_matches(door_id);
CREATE INDEX IF NOT EXISTS idx_door_storm_matches_event ON door_storm_matches(storm_event_id);
CREATE INDEX IF NOT EXISTS idx_rep_locations_org ON rep_locations(organization_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['storm_layers','turfs','doors','canvass_leads','canvass_appointments','canvass_org_settings','storm_ingestion_jobs'])
  LOOP EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_upd ON %I; CREATE TRIGGER trg_%I_upd BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;
