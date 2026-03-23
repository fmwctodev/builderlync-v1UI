/*
  # Create Storm Canvassing Module Tables

  This migration creates all tables required for the Storm Canvassing feature.

  ## 1. New Tables

  ### storm_events
  - Stores storm events imported from providers or created manually
  - Links to organization for multi-tenant isolation
  - Tracks provider source (MOCK, HAILTRACE, HAIL_RECON)

  ### storm_layers
  - GeoJSON or tileset layers associated with storm events
  - Supports HAIL and WIND layer types
  - Stores styling and threshold configuration

  ### turfs
  - Geographic areas assigned to sales reps for canvassing
  - Uses PostGIS geography type for polygon storage
  - Tracks completion status

  ### turf_assignments
  - Junction table linking turfs to users
  - Supports multiple reps per turf

  ### doors
  - Individual addresses/properties to canvass
  - Uses PostGIS point geometry for location
  - Can belong to a turf

  ### canvass_visits
  - Visit logs for each door knock attempt
  - Tracks outcome, notes, and offline sync status
  - device_visit_id enables offline deduplication

  ### canvass_media
  - Photos/videos captured during canvassing
  - Links to doors and/or visits

  ### contact_reveals
  - Tracks when contact info is revealed for a door
  - Caches provider responses to avoid duplicate charges

  ### credit_ledger
  - Audit trail for contact reveal credits
  - Supports topups, usage, and adjustments

  ### canvass_leads
  - Leads generated from canvassing activity
  - Separate from main CRM leads for canvassing workflow

  ### canvass_appointments
  - Inspection appointments scheduled from canvass leads

  ### canvass_org_settings
  - Per-organization canvassing configuration
  - Cache windows, costs, feature toggles

  ## 2. Security
  - All tables have RLS enabled (policies in separate migration)
*/

-- Create enum types for storm canvassing
DO $$
BEGIN
  -- Storm provider enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storm_provider') THEN
    CREATE TYPE storm_provider AS ENUM ('MOCK', 'HAILTRACE', 'HAIL_RECON');
  END IF;

  -- Storm layer type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storm_layer_type') THEN
    CREATE TYPE storm_layer_type AS ENUM ('HAIL', 'WIND', 'TORNADO', 'FLOOD');
  END IF;

  -- Storm layer format enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storm_layer_format') THEN
    CREATE TYPE storm_layer_format AS ENUM ('GEOJSON', 'TILESET_URL');
  END IF;

  -- Turf status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turf_status') THEN
    CREATE TYPE turf_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
  END IF;

  -- Turf assignment status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turf_assignment_status') THEN
    CREATE TYPE turf_assignment_status AS ENUM ('ASSIGNED', 'ACTIVE', 'DONE');
  END IF;

  -- Canvass outcome enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canvass_outcome') THEN
    CREATE TYPE canvass_outcome AS ENUM (
      'NO_ANSWER', 
      'INTERESTED', 
      'NOT_INTERESTED', 
      'FOLLOW_UP', 
      'APPOINTMENT_SET', 
      'DO_NOT_KNOCK',
      'NOT_HOME',
      'CALLBACK_REQUESTED'
    );
  END IF;

  -- Canvass media type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canvass_media_type') THEN
    CREATE TYPE canvass_media_type AS ENUM ('PHOTO', 'VIDEO', 'DOCUMENT');
  END IF;

  -- Contact provider enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_provider') THEN
    CREATE TYPE contact_provider AS ENUM ('MOCK', 'HAILTRACE', 'HAIL_RECON');
  END IF;

  -- Credit ledger type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_ledger_type') THEN
    CREATE TYPE credit_ledger_type AS ENUM ('CONTACT_REVEAL', 'TOPUP', 'ADJUSTMENT', 'REFUND');
  END IF;

  -- Canvass lead status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canvass_lead_status') THEN
    CREATE TYPE canvass_lead_status AS ENUM ('NEW', 'CONTACTED', 'SCHEDULED', 'WON', 'LOST');
  END IF;

  -- Canvass lead source enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'canvass_lead_source') THEN
    CREATE TYPE canvass_lead_source AS ENUM ('CANVASSING', 'REFERRAL', 'IMPORT');
  END IF;
END $$;

-- Storm Events Table
CREATE TABLE IF NOT EXISTS storm_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider storm_provider NOT NULL DEFAULT 'MOCK',
  external_id text,
  name text NOT NULL,
  description text,
  event_date date,
  event_start timestamptz,
  event_end timestamptz,
  bbox jsonb,
  center_lat double precision,
  center_lng double precision,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(organization_id, provider, external_id)
);

-- Storm Layers Table
CREATE TABLE IF NOT EXISTS storm_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storm_event_id uuid NOT NULL REFERENCES storm_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  layer_type storm_layer_type NOT NULL DEFAULT 'HAIL',
  format storm_layer_format NOT NULL DEFAULT 'GEOJSON',
  geojson jsonb,
  source_url text,
  min_threshold double precision,
  max_threshold double precision,
  style jsonb DEFAULT '{}'::jsonb,
  is_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Turfs Table
CREATE TABLE IF NOT EXISTS turfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storm_event_id uuid REFERENCES storm_events(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  geometry geography(MultiPolygon, 4326) NOT NULL,
  bbox jsonb,
  status turf_status NOT NULL DEFAULT 'NOT_STARTED',
  total_doors integer DEFAULT 0,
  visited_doors integer DEFAULT 0,
  color text DEFAULT '#3B82F6',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Turf Assignments Table
CREATE TABLE IF NOT EXISTS turf_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  turf_id uuid NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status turf_assignment_status NOT NULL DEFAULT 'ASSIGNED',
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(turf_id, user_id)
);

-- Doors Table
CREATE TABLE IF NOT EXISTS doors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES turfs(id) ON DELETE SET NULL,
  normalized_address text,
  address1 text NOT NULL,
  address2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text DEFAULT 'US',
  location geography(Point, 4326) NOT NULL,
  lat double precision GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED,
  lng double precision GENERATED ALWAYS AS (ST_X(location::geometry)) STORED,
  parcel_id text,
  property_type text,
  last_visit_at timestamptz,
  last_outcome canvass_outcome,
  visit_count integer DEFAULT 0,
  is_do_not_knock boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Canvass Visits Table
CREATE TABLE IF NOT EXISTS canvass_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  turf_id uuid REFERENCES turfs(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  outcome canvass_outcome NOT NULL,
  notes text,
  tags text[] DEFAULT '{}',
  duration_seconds integer,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_offline_synced boolean DEFAULT true,
  device_visit_id text,
  device_lat double precision,
  device_lng double precision,
  UNIQUE(organization_id, device_visit_id)
);

-- Canvass Media Table
CREATE TABLE IF NOT EXISTS canvass_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid REFERENCES doors(id) ON DELETE SET NULL,
  visit_id uuid REFERENCES canvass_visits(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  media_type canvass_media_type NOT NULL DEFAULT 'PHOTO',
  file_name text,
  file_size integer,
  mime_type text,
  url text NOT NULL,
  thumbnail_url text,
  caption text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Contact Reveals Table
CREATE TABLE IF NOT EXISTS contact_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid NOT NULL REFERENCES doors(id) ON DELETE CASCADE,
  provider contact_provider NOT NULL DEFAULT 'MOCK',
  revealed_by uuid NOT NULL REFERENCES auth.users(id),
  credits_used integer DEFAULT 1,
  revealed_at timestamptz DEFAULT now(),
  name text,
  phones text[] DEFAULT '{}',
  emails text[] DEFAULT '{}',
  fields_returned jsonb DEFAULT '{}'::jsonb,
  cache_key text,
  expires_at timestamptz
);

-- Credit Ledger Table
CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ledger_type credit_ledger_type NOT NULL,
  delta integer NOT NULL,
  reason text,
  related_id uuid,
  balance_after integer,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Canvass Leads Table
CREATE TABLE IF NOT EXISTS canvass_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  door_id uuid REFERENCES doors(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  source canvass_lead_source NOT NULL DEFAULT 'CANVASSING',
  status canvass_lead_status NOT NULL DEFAULT 'NEW',
  name text,
  phone text,
  email text,
  address text,
  notes text,
  estimated_value numeric(12, 2),
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  scheduled_at timestamptz,
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text
);

-- Canvass Appointments Table
CREATE TABLE IF NOT EXISTS canvass_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES canvass_leads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  location_text text,
  location geography(Point, 4326),
  status text DEFAULT 'scheduled',
  reminder_sent boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Canvass Organization Settings Table
CREATE TABLE IF NOT EXISTS canvass_org_settings (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  contact_reveal_cache_hours integer DEFAULT 720,
  contact_reveal_cost integer DEFAULT 1,
  allow_gps_tracking boolean DEFAULT false,
  offline_sync_enabled boolean DEFAULT true,
  default_door_density integer DEFAULT 150,
  default_storm_provider storm_provider DEFAULT 'MOCK',
  default_contact_provider contact_provider DEFAULT 'MOCK',
  hailtrace_api_key text,
  hail_recon_api_key text,
  mapbox_style_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE storm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE storm_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE turf_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doors ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvass_org_settings ENABLE ROW LEVEL SECURITY;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'storm_events', 'storm_layers', 'turfs', 'doors', 
    'canvass_leads', 'canvass_appointments', 'canvass_org_settings'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;