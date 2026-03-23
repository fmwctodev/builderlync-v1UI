/*
  # Enable PostGIS Extension for Storm Canvassing

  This migration enables the PostGIS extension required for geographic/spatial queries
  in the Storm Canvassing module.

  ## Prerequisites
  - PostGIS extension must be available in your Supabase project
  - Navigate to Supabase Dashboard > Database > Extensions and enable "postgis" if not already enabled

  ## What This Enables
  - Geography data types for storing lat/lng coordinates
  - Spatial functions like ST_Within, ST_Contains, ST_Distance
  - Spatial indexes for performant geo queries

  ## Verification
  After running, verify with: SELECT PostGIS_Version();
*/

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify PostGIS is working by creating a test function
CREATE OR REPLACE FUNCTION verify_postgis_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  );
$$;