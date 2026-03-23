/*
  # Storm Canvassing Helper Functions

  Creates PostgreSQL helper functions for the storm canvassing module.

  ## Functions
  1. `generate_doors_in_turf` - Generates random door records within a turf's bounding box (for demo/testing)
  2. `calculate_turf_progress` - Calculates completion percentage and stats for a turf
  3. `get_canvassing_leaderboard` - Returns rep performance rankings for a given time range
  4. `get_doors_in_bbox` - Returns doors within a lat/lng bounding box
  5. `get_doors_in_turf` - Returns all doors belonging to a turf

  ## Security
  - Functions run as SECURITY DEFINER to ensure consistent access
*/

-- generate_doors_in_turf: Populates a turf with simulated door records
CREATE OR REPLACE FUNCTION generate_doors_in_turf(
  p_turf_id uuid,
  p_count integer DEFAULT 100
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id uuid;
  v_bbox jsonb;
  v_min_lng double precision := -98.0;
  v_max_lng double precision := -97.0;
  v_min_lat double precision := 29.5;
  v_max_lat double precision := 30.5;
  v_lng_range double precision;
  v_lat_range double precision;
  v_door_id uuid;
  v_street_num integer;
  v_street_suffix text;
  v_city text;
  v_state text;
  v_zip text;
  v_prop_type text;
  v_lat double precision;
  v_lng double precision;
  i integer;
  v_street_suffixes text[] := ARRAY['Main St', 'Oak Ave', 'Elm St', 'Cedar Rd', 'Maple Dr', 'Pine Ln', 'Park Blvd', 'Washington Ave'];
  v_cities text[] := ARRAY['Austin', 'Round Rock', 'Cedar Park', 'Pflugerville', 'Georgetown'];
  v_prop_types text[] := ARRAY['residential', 'commercial', 'residential', 'residential', 'residential'];
  v_created integer := 0;
BEGIN
  SELECT organization_id, bbox
    INTO v_org_id, v_bbox
    FROM turfs
   WHERE id = p_turf_id;

  IF v_org_id IS NULL THEN
    RETURN 0;
  END IF;

  IF v_bbox IS NOT NULL THEN
    v_min_lng := (v_bbox->>'minLng')::double precision;
    v_max_lng := (v_bbox->>'maxLng')::double precision;
    v_min_lat := (v_bbox->>'minLat')::double precision;
    v_max_lat := (v_bbox->>'maxLat')::double precision;
  END IF;

  v_lng_range := v_max_lng - v_min_lng;
  v_lat_range := v_max_lat - v_min_lat;

  FOR i IN 1..p_count LOOP
    v_street_num := 100 + floor(random() * 9900)::int;
    v_street_suffix := v_street_suffixes[1 + floor(random() * array_length(v_street_suffixes, 1))::int];
    v_city := v_cities[1 + floor(random() * array_length(v_cities, 1))::int];
    v_state := 'TX';
    v_zip := '787' || lpad(floor(random() * 99)::text, 2, '0');
    v_prop_type := v_prop_types[1 + floor(random() * array_length(v_prop_types, 1))::int];
    v_lat := v_min_lat + random() * v_lat_range;
    v_lng := v_min_lng + random() * v_lng_range;

    INSERT INTO doors (
      organization_id,
      turf_id,
      address1,
      city,
      state,
      zip,
      lat,
      lng,
      property_type,
      normalized_address
    ) VALUES (
      v_org_id,
      p_turf_id,
      v_street_num || ' ' || v_street_suffix,
      v_city,
      v_state,
      v_zip,
      v_lat,
      v_lng,
      v_prop_type,
      lower(v_street_num || ' ' || v_street_suffix || ' ' || v_city || ' ' || v_state || ' ' || v_zip)
    )
    ON CONFLICT DO NOTHING;

    v_created := v_created + 1;
  END LOOP;

  UPDATE turfs
     SET total_doors = total_doors + v_created,
         updated_at = now()
   WHERE id = p_turf_id;

  RETURN v_created;
END;
$$;

-- calculate_turf_progress: Returns completion stats for a turf
CREATE OR REPLACE FUNCTION calculate_turf_progress(p_turf_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total integer;
  v_visited integer;
  v_dnk integer;
  v_interested integer;
  v_appointment_set integer;
  v_pct numeric;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE visit_count > 0),
    COUNT(*) FILTER (WHERE is_do_not_knock),
    COUNT(*) FILTER (WHERE last_outcome = 'INTERESTED'),
    COUNT(*) FILTER (WHERE last_outcome = 'APPOINTMENT_SET')
  INTO v_total, v_visited, v_dnk, v_interested, v_appointment_set
  FROM doors
  WHERE turf_id = p_turf_id;

  IF v_total = 0 THEN
    v_pct := 0;
  ELSE
    v_pct := round((v_visited::numeric / v_total) * 100, 1);
  END IF;

  RETURN jsonb_build_object(
    'total', v_total,
    'visited', v_visited,
    'unvisited', v_total - v_visited,
    'do_not_knock', v_dnk,
    'interested', v_interested,
    'appointment_set', v_appointment_set,
    'completion_pct', v_pct
  );
END;
$$;

-- get_canvassing_leaderboard: Returns rep performance rankings
CREATE OR REPLACE FUNCTION get_canvassing_leaderboard(
  p_org_id uuid,
  p_start_date timestamptz DEFAULT now() - interval '30 days',
  p_end_date timestamptz DEFAULT now()
)
RETURNS TABLE(
  user_id uuid,
  total_visits bigint,
  interested_count bigint,
  appointment_set_count bigint,
  doors_knocked bigint,
  conversion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.user_id,
    COUNT(cv.id) AS total_visits,
    COUNT(cv.id) FILTER (WHERE cv.outcome = 'INTERESTED') AS interested_count,
    COUNT(cv.id) FILTER (WHERE cv.outcome = 'APPOINTMENT_SET') AS appointment_set_count,
    COUNT(DISTINCT cv.door_id) AS doors_knocked,
    CASE
      WHEN COUNT(cv.id) = 0 THEN 0
      ELSE round(
        COUNT(cv.id) FILTER (WHERE cv.outcome IN ('INTERESTED','APPOINTMENT_SET'))::numeric
        / COUNT(cv.id) * 100,
        1
      )
    END AS conversion_rate
  FROM canvass_visits cv
  WHERE cv.organization_id = p_org_id
    AND cv.occurred_at BETWEEN p_start_date AND p_end_date
  GROUP BY cv.user_id
  ORDER BY total_visits DESC;
END;
$$;

-- get_doors_in_bbox: Returns doors within a bounding box
CREATE OR REPLACE FUNCTION get_doors_in_bbox(
  p_org_id uuid,
  p_min_lng double precision,
  p_min_lat double precision,
  p_max_lng double precision,
  p_max_lat double precision
)
RETURNS SETOF doors
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM doors
  WHERE organization_id = p_org_id
    AND lng BETWEEN p_min_lng AND p_max_lng
    AND lat BETWEEN p_min_lat AND p_max_lat
  ORDER BY lat, lng;
END;
$$;

-- get_doors_in_turf: Returns all doors belonging to a turf
CREATE OR REPLACE FUNCTION get_doors_in_turf(p_turf_id uuid)
RETURNS SETOF doors
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM doors
  WHERE turf_id = p_turf_id
  ORDER BY normalized_address;
END;
$$;
