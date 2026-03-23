/*
  # Create Indexes and Helper Functions for Storm Canvassing

  This migration creates:
  1. Spatial indexes for geographic queries (GIST)
  2. Performance indexes for common queries
  3. Helper functions for spatial operations

  ## Indexes Created
  - GIST index on turfs.geometry for spatial queries
  - GIST index on doors.location for spatial queries
  - B-tree indexes on common filter columns

  ## Functions Created
  - get_doors_in_turf: Returns all doors within a turf polygon
  - get_doors_in_bbox: Returns doors within a bounding box
  - calculate_turf_progress: Calculates completion stats for a turf
  - get_credit_balance: Returns current credit balance for an org
  - check_contact_reveal_cache: Checks if a reveal is cached and valid
*/

-- ============================================
-- SPATIAL INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_turfs_geometry 
  ON turfs USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_doors_location 
  ON doors USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_canvass_appointments_location 
  ON canvass_appointments USING GIST (location);

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_storm_events_org_active
  ON storm_events(organization_id, is_active);

CREATE INDEX IF NOT EXISTS idx_storm_events_org_date
  ON storm_events(organization_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_storm_layers_event
  ON storm_layers(storm_event_id);

CREATE INDEX IF NOT EXISTS idx_turfs_org_status
  ON turfs(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_turfs_storm_event
  ON turfs(storm_event_id);

CREATE INDEX IF NOT EXISTS idx_turf_assignments_turf
  ON turf_assignments(turf_id);

CREATE INDEX IF NOT EXISTS idx_turf_assignments_user
  ON turf_assignments(user_id);

CREATE INDEX IF NOT EXISTS idx_doors_org_turf
  ON doors(organization_id, turf_id);

CREATE INDEX IF NOT EXISTS idx_doors_normalized_address
  ON doors(organization_id, normalized_address);

CREATE INDEX IF NOT EXISTS idx_canvass_visits_door
  ON canvass_visits(door_id);

CREATE INDEX IF NOT EXISTS idx_canvass_visits_user_date
  ON canvass_visits(user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_canvass_visits_turf
  ON canvass_visits(turf_id);

CREATE INDEX IF NOT EXISTS idx_canvass_visits_device_id
  ON canvass_visits(organization_id, device_visit_id) 
  WHERE device_visit_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_reveals_door
  ON contact_reveals(door_id, revealed_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_reveals_cache
  ON contact_reveals(organization_id, door_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_org_date
  ON credit_ledger(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_canvass_leads_org_status
  ON canvass_leads(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_canvass_leads_assigned
  ON canvass_leads(assigned_to);

CREATE INDEX IF NOT EXISTS idx_canvass_appointments_lead
  ON canvass_appointments(lead_id);

CREATE INDEX IF NOT EXISTS idx_canvass_appointments_date
  ON canvass_appointments(organization_id, start_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get all doors within a turf polygon
CREATE OR REPLACE FUNCTION get_doors_in_turf(p_turf_id uuid)
RETURNS SETOF doors
LANGUAGE sql
STABLE
AS $$
  SELECT d.*
  FROM doors d
  JOIN turfs t ON t.id = p_turf_id
  WHERE ST_Within(d.location::geometry, t.geometry::geometry)
    AND d.organization_id = t.organization_id;
$$;

-- Get doors within a bounding box
CREATE OR REPLACE FUNCTION get_doors_in_bbox(
  p_org_id uuid,
  p_min_lng double precision,
  p_min_lat double precision,
  p_max_lng double precision,
  p_max_lat double precision
)
RETURNS SETOF doors
LANGUAGE sql
STABLE
AS $$
  SELECT d.*
  FROM doors d
  WHERE d.organization_id = p_org_id
    AND ST_Within(
      d.location::geometry,
      ST_MakeEnvelope(p_min_lng, p_min_lat, p_max_lng, p_max_lat, 4326)
    );
$$;

-- Calculate turf progress statistics
CREATE OR REPLACE FUNCTION calculate_turf_progress(p_turf_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_doors integer;
  v_visited_doors integer;
  v_outcomes jsonb;
BEGIN
  SELECT COUNT(*)
  INTO v_total_doors
  FROM doors
  WHERE turf_id = p_turf_id;

  SELECT COUNT(DISTINCT door_id)
  INTO v_visited_doors
  FROM canvass_visits
  WHERE turf_id = p_turf_id;

  SELECT COALESCE(jsonb_object_agg(outcome, cnt), '{}'::jsonb)
  INTO v_outcomes
  FROM (
    SELECT outcome::text, COUNT(*) as cnt
    FROM canvass_visits
    WHERE turf_id = p_turf_id
    GROUP BY outcome
  ) sub;

  RETURN jsonb_build_object(
    'total_doors', v_total_doors,
    'visited_doors', v_visited_doors,
    'completion_percentage', 
      CASE WHEN v_total_doors > 0 
        THEN ROUND((v_visited_doors::numeric / v_total_doors) * 100, 1)
        ELSE 0 
      END,
    'outcomes', v_outcomes
  );
END;
$$;

-- Get current credit balance for an organization
CREATE OR REPLACE FUNCTION get_credit_balance(p_org_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(delta), 0)::integer
  FROM credit_ledger
  WHERE organization_id = p_org_id;
$$;

-- Check if contact reveal is cached and valid
CREATE OR REPLACE FUNCTION check_contact_reveal_cache(
  p_org_id uuid,
  p_door_id uuid
)
RETURNS contact_reveals
LANGUAGE sql
STABLE
AS $$
  SELECT cr.*
  FROM contact_reveals cr
  WHERE cr.organization_id = p_org_id
    AND cr.door_id = p_door_id
    AND (cr.expires_at IS NULL OR cr.expires_at > now())
  ORDER BY cr.revealed_at DESC
  LIMIT 1;
$$;

-- Generate doors within a turf polygon
CREATE OR REPLACE FUNCTION generate_doors_in_turf(
  p_turf_id uuid,
  p_count integer DEFAULT 100
)
RETURNS SETOF doors
LANGUAGE plpgsql
AS $$
DECLARE
  v_turf turfs;
  v_bbox geometry;
  v_point geometry;
  v_door doors;
  i integer := 0;
  attempts integer := 0;
  max_attempts integer := p_count * 10;
BEGIN
  SELECT * INTO v_turf FROM turfs WHERE id = p_turf_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turf not found: %', p_turf_id;
  END IF;

  v_bbox := ST_Envelope(v_turf.geometry::geometry);

  WHILE i < p_count AND attempts < max_attempts LOOP
    attempts := attempts + 1;
    
    v_point := ST_SetSRID(
      ST_MakePoint(
        ST_XMin(v_bbox) + random() * (ST_XMax(v_bbox) - ST_XMin(v_bbox)),
        ST_YMin(v_bbox) + random() * (ST_YMax(v_bbox) - ST_YMin(v_bbox))
      ),
      4326
    );

    IF ST_Within(v_point, v_turf.geometry::geometry) THEN
      INSERT INTO doors (
        organization_id,
        turf_id,
        address1,
        city,
        state,
        zip,
        location,
        normalized_address
      ) VALUES (
        v_turf.organization_id,
        p_turf_id,
        (1000 + floor(random() * 9000)::integer)::text || ' ' || 
          (ARRAY['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Main', 'First', 'Second', 'Third', 'Park'])[floor(random() * 10 + 1)::integer] || ' ' ||
          (ARRAY['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Way', 'Ct', 'Pl'])[floor(random() * 8 + 1)::integer],
        'Generated City',
        'CO',
        '80' || (200 + floor(random() * 100))::text,
        v_point::geography,
        NULL
      )
      RETURNING * INTO v_door;

      UPDATE doors SET normalized_address = LOWER(address1 || ' ' || city || ' ' || state || ' ' || zip)
      WHERE id = v_door.id;

      i := i + 1;
      RETURN NEXT v_door;
    END IF;
  END LOOP;

  UPDATE turfs SET total_doors = (
    SELECT COUNT(*) FROM doors WHERE turf_id = p_turf_id
  ) WHERE id = p_turf_id;

  RETURN;
END;
$$;

-- Update door stats after visit
CREATE OR REPLACE FUNCTION update_door_after_visit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE doors SET
    last_visit_at = NEW.occurred_at,
    last_outcome = NEW.outcome,
    visit_count = visit_count + 1,
    is_do_not_knock = CASE WHEN NEW.outcome = 'DO_NOT_KNOCK' THEN true ELSE is_do_not_knock END
  WHERE id = NEW.door_id;

  IF NEW.turf_id IS NOT NULL THEN
    UPDATE turfs SET visited_doors = (
      SELECT COUNT(DISTINCT door_id) 
      FROM canvass_visits 
      WHERE turf_id = NEW.turf_id
    ) WHERE id = NEW.turf_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_door_after_visit
  AFTER INSERT ON canvass_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_door_after_visit();

-- Record credit usage for contact reveal
CREATE OR REPLACE FUNCTION record_contact_reveal_credit(
  p_org_id uuid,
  p_reveal_id uuid,
  p_cost integer,
  p_user_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance integer;
BEGIN
  SELECT get_credit_balance(p_org_id) INTO v_balance;

  INSERT INTO credit_ledger (
    organization_id,
    ledger_type,
    delta,
    reason,
    related_id,
    balance_after,
    created_by
  ) VALUES (
    p_org_id,
    'CONTACT_REVEAL',
    -p_cost,
    'Contact reveal',
    p_reveal_id,
    v_balance - p_cost,
    p_user_id
  );

  RETURN v_balance - p_cost;
END;
$$;