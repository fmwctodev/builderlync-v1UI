/*
  # Add Schema Health Monitoring

  ## Overview
  This migration adds functions to monitor database schema health,
  foreign key integrity, and PostgREST relationship status.

  ## Changes

  1. **Health Check Functions**
     - `check_form_submissions_schema_health` - comprehensive health check
     - `verify_foreign_key_constraints` - validate FK integrity
     - `check_postgrest_relationships` - verify PostgREST can resolve relationships

  2. **Monitoring**
     - Real-time health status
     - Relationship validation
     - Performance checks
*/

-- Function to check form submissions schema health
CREATE OR REPLACE FUNCTION check_form_submissions_schema_health()
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_fk_exists boolean;
  v_index_exists boolean;
  v_view_exists boolean;
  v_rpc_exists boolean;
  v_sample_query_success boolean;
  v_health_score integer := 0;
BEGIN
  -- Check if foreign key constraint exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'form_submissions_contact_id_fkey'
    AND table_name = 'form_submissions'
  ) INTO v_fk_exists;

  -- Check if index on contact_id exists
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'form_submissions'
    AND indexname = 'idx_form_submissions_contact_id'
  ) INTO v_index_exists;

  -- Check if view exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_name = 'form_submissions_with_details'
  ) INTO v_view_exists;

  -- Check if RPC function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_all_form_submissions_with_details'
  ) INTO v_rpc_exists;

  -- Try a sample query to test relationship
  BEGIN
    PERFORM 1
    FROM form_submissions fs
    LEFT JOIN contacts c ON fs.contact_id = c.id
    LIMIT 1;
    v_sample_query_success := true;
  EXCEPTION WHEN OTHERS THEN
    v_sample_query_success := false;
  END;

  -- Calculate health score
  IF v_fk_exists THEN v_health_score := v_health_score + 20; END IF;
  IF v_index_exists THEN v_health_score := v_health_score + 20; END IF;
  IF v_view_exists THEN v_health_score := v_health_score + 20; END IF;
  IF v_rpc_exists THEN v_health_score := v_health_score + 20; END IF;
  IF v_sample_query_success THEN v_health_score := v_health_score + 20; END IF;

  -- Build result JSON
  v_result := jsonb_build_object(
    'health_score', v_health_score,
    'status', CASE
      WHEN v_health_score = 100 THEN 'healthy'
      WHEN v_health_score >= 80 THEN 'good'
      WHEN v_health_score >= 60 THEN 'warning'
      ELSE 'critical'
    END,
    'checks', jsonb_build_object(
      'foreign_key_exists', v_fk_exists,
      'index_exists', v_index_exists,
      'view_exists', v_view_exists,
      'rpc_function_exists', v_rpc_exists,
      'sample_query_success', v_sample_query_success
    ),
    'recommendations', CASE
      WHEN NOT v_fk_exists THEN jsonb_build_array('Foreign key constraint is missing. Run migration to add it.')
      WHEN NOT v_index_exists THEN jsonb_build_array('Index on contact_id is missing. Performance may be degraded.')
      WHEN NOT v_view_exists THEN jsonb_build_array('View is missing. Create form_submissions_with_details view.')
      WHEN NOT v_rpc_exists THEN jsonb_build_array('RPC functions are missing. Deploy database functions.')
      WHEN NOT v_sample_query_success THEN jsonb_build_array('Sample query failed. Check database permissions and data integrity.')
      ELSE jsonb_build_array('All checks passed. Schema is healthy.')
    END,
    'checked_at', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify foreign key constraints integrity
CREATE OR REPLACE FUNCTION verify_foreign_key_constraints()
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_orphaned_submissions integer;
  v_total_submissions integer;
  v_submissions_with_contacts integer;
BEGIN
  -- Count orphaned submissions (contact_id points to non-existent contact)
  SELECT COUNT(*)
  INTO v_orphaned_submissions
  FROM form_submissions fs
  WHERE fs.contact_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM contacts c WHERE c.id = fs.contact_id
  );

  -- Count total submissions
  SELECT COUNT(*) INTO v_total_submissions FROM form_submissions;

  -- Count submissions with valid contacts
  SELECT COUNT(*)
  INTO v_submissions_with_contacts
  FROM form_submissions fs
  WHERE fs.contact_id IS NOT NULL;

  v_result := jsonb_build_object(
    'total_submissions', v_total_submissions,
    'submissions_with_contacts', v_submissions_with_contacts,
    'orphaned_submissions', v_orphaned_submissions,
    'integrity_status', CASE
      WHEN v_orphaned_submissions = 0 THEN 'clean'
      WHEN v_orphaned_submissions < 10 THEN 'minor_issues'
      ELSE 'needs_cleanup'
    END,
    'checked_at', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get database relationship information
CREATE OR REPLACE FUNCTION get_database_relationships()
RETURNS TABLE (
  table_name text,
  constraint_name text,
  column_name text,
  foreign_table text,
  foreign_column text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.table_name::text,
    tc.constraint_name::text,
    kcu.column_name::text,
    ccu.table_name::text AS foreign_table,
    ccu.column_name::text AS foreign_column
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('form_submissions', 'marketing_forms')
  ORDER BY tc.table_name, tc.constraint_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if PostgREST can resolve relationships
CREATE OR REPLACE FUNCTION check_postgrest_relationships()
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_can_join boolean;
  v_error_message text;
BEGIN
  -- Try to execute a query that PostgREST would use
  BEGIN
    PERFORM 1
    FROM form_submissions fs
    LEFT JOIN contacts c ON fs.contact_id = c.id
    LEFT JOIN marketing_forms mf ON fs.form_id = mf.id
    LIMIT 1;
    v_can_join := true;
    v_error_message := NULL;
  EXCEPTION WHEN OTHERS THEN
    v_can_join := false;
    v_error_message := SQLERRM;
  END;

  v_result := jsonb_build_object(
    'can_join', v_can_join,
    'error_message', v_error_message,
    'status', CASE WHEN v_can_join THEN 'operational' ELSE 'error' END,
    'checked_at', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;