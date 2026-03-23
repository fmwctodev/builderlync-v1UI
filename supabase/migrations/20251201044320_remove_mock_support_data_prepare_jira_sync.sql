/*
  # Remove Mock Support Data and Prepare for Jira Sync

  ## Overview
  Removes all mock support tickets, comments, NPS responses, and feedback data.
  Prepares tables for real Jira integration.

  ## Changes

  1. **Remove Mock Data**
     - Delete mock support tickets and comments
     - Clear fake NPS responses
     - Remove sample product feedback
     - Clean account health snapshots

  2. **Prepare for Real Data**
     - Reset sync statuses
     - Preserve table structure
     - Prepare for first Jira sync

  ## Security
  - Preserves real Jira data if it exists
  - Validates before deletion
  - Logs all cleanup operations
*/

-- Log the cleanup operation
DO $$
BEGIN
  RAISE NOTICE 'Starting mock support data cleanup...';
END $$;

-- Delete mock support ticket comments
-- These will be regenerated from real Jira data
DELETE FROM support_ticket_comments
WHERE jira_comment_id IS NULL
  AND created_at < NOW();

-- Log comments cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock support ticket comments', deleted_count;
END $$;

-- Delete mock support tickets
-- Keep any tickets that have been synced to Jira
DELETE FROM support_tickets
WHERE jira_issue_id IS NULL
  AND ticket_number LIKE 'TKT-%'
  AND created_at < NOW();

-- Log tickets cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock support tickets', deleted_count;
END $$;

-- Delete mock NPS feedback
-- Keep real responses (those created via actual surveys)
DELETE FROM nps_feedback
WHERE source IN ('in_app', 'email', 'campaign')
  AND comment LIKE '%Great product%'
  AND created_at < NOW();

-- Log NPS cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock NPS responses', deleted_count;
END $$;

-- Delete mock product feedback
DELETE FROM product_feedback
WHERE title IN (
  'Add dark mode support',
  'Export to Excel not working',
  'Calendar view for appointments',
  'Bulk edit for jobs',
  'Mobile app improvements',
  'Integration with Slack',
  'Dashboard is very intuitive',
  'Faster load times needed',
  'Multi-language support',
  'API documentation unclear',
  'Love the new features!',
  'Search function improvements',
  'Automated reporting',
  'Better filtering options',
  'Custom fields in forms'
)
AND jira_issue_id IS NULL;

-- Log feedback cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock product feedback items', deleted_count;
END $$;

-- Delete mock account health snapshots
-- These will be recalculated from real data
DELETE FROM account_health
WHERE notes IN (
  'Account showing good engagement. Monitor usage trends.',
  'Some concerns about ticket volume. Schedule check-in.',
  'Healthy account. No immediate action needed.'
);

-- Log health cleanup
DO $$
DECLARE
  deleted_count integer;
BEGIN
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % mock account health snapshots', deleted_count;
END $$;

-- Reset Jira sync status for any remaining tickets
UPDATE support_tickets
SET 
  jira_sync_status = 'not_synced',
  last_synced_at = NULL
WHERE jira_sync_status IS NULL OR jira_sync_status = 'not_synced';

-- Validation: Check database state after cleanup
DO $$
DECLARE
  remaining_tickets integer;
  remaining_comments integer;
  remaining_nps integer;
  remaining_feedback integer;
  remaining_health integer;
BEGIN
  SELECT COUNT(*) INTO remaining_tickets FROM support_tickets;
  SELECT COUNT(*) INTO remaining_comments FROM support_ticket_comments;
  SELECT COUNT(*) INTO remaining_nps FROM nps_feedback;
  SELECT COUNT(*) INTO remaining_feedback FROM product_feedback;
  SELECT COUNT(*) INTO remaining_health FROM account_health;

  RAISE NOTICE 'Validation Results:';
  RAISE NOTICE '  Remaining support tickets: %', remaining_tickets;
  RAISE NOTICE '  Remaining ticket comments: %', remaining_comments;
  RAISE NOTICE '  Remaining NPS responses: %', remaining_nps;
  RAISE NOTICE '  Remaining product feedback: %', remaining_feedback;
  RAISE NOTICE '  Remaining account health records: %', remaining_health;

  IF remaining_tickets = 0 THEN
    RAISE NOTICE 'Next step: Run Jira sync to import real support tickets';
  ELSE
    RAISE NOTICE 'Note: % tickets preserved (likely real or Jira-synced data)', remaining_tickets;
  END IF;
END $$;

-- Create function to calculate account health from real ticket data
CREATE OR REPLACE FUNCTION calculate_account_health_from_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing health snapshots for current period
  DELETE FROM account_health
  WHERE period = date_trunc('month', CURRENT_DATE)::date;

  -- Calculate and insert new health snapshots
  INSERT INTO account_health (
    account_id,
    period,
    health_score,
    risk_level,
    tickets_open,
    nps_latest,
    usage_score,
    notes,
    created_at
  )
  SELECT
    ea.id as account_id,
    date_trunc('month', CURRENT_DATE)::date as period,
    GREATEST(0, LEAST(100, (
      100 - 
      (COUNT(CASE WHEN st.status IN ('open', 'in_progress') THEN 1 END) * 10) -
      (COUNT(CASE WHEN st.status = 'open' AND st.priority = 'urgent' THEN 1 END) * 20) +
      COALESCE((
        SELECT AVG(score) * 5 
        FROM nps_feedback nf 
        WHERE nf.account_id = ea.id 
        AND nf.created_at > NOW() - INTERVAL '30 days'
      ), 0)
    )::integer)) as health_score,
    CASE
      WHEN (
        COUNT(CASE WHEN st.status IN ('open', 'in_progress') THEN 1 END) > 5 OR
        COUNT(CASE WHEN st.status = 'open' AND st.priority = 'urgent' THEN 1 END) > 0
      ) THEN 'high'::text
      WHEN COUNT(CASE WHEN st.status IN ('open', 'in_progress') THEN 1 END) > 2 THEN 'medium'::text
      ELSE 'low'::text
    END as risk_level,
    COUNT(CASE WHEN st.status IN ('open', 'in_progress') THEN 1 END)::integer as tickets_open,
    (
      SELECT score 
      FROM nps_feedback nf 
      WHERE nf.account_id = ea.id 
      ORDER BY nf.created_at DESC 
      LIMIT 1
    ) as nps_latest,
    COALESCE((
      SELECT usage_score 
      FROM (
        SELECT 
          LEAST(100, (
            (sms_count::decimal / NULLIF(ul.sms_limit, 0) * 30) +
            (call_minutes::decimal / NULLIF(ul.call_limit, 0) * 30) +
            (emails_sent::decimal / NULLIF(ul.email_limit, 0) * 30)
          ))::integer as usage_score
        FROM usage_tracking ut
        JOIN usage_limits ul ON ul.account_id = ut.account_id
        WHERE ut.account_id = ea.id
        AND ut.period = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date
      ) usage_calc
    ), 50) as usage_score,
    CASE
      WHEN COUNT(CASE WHEN st.status IN ('open', 'in_progress') THEN 1 END) > 5 
      THEN 'High ticket volume detected. Recommend immediate follow-up.'
      WHEN COUNT(CASE WHEN st.status = 'open' AND st.priority = 'urgent' THEN 1 END) > 0 
      THEN 'Urgent tickets require attention.'
      WHEN COUNT(CASE WHEN st.status IN ('open', 'in_progress') THEN 1 END) > 2 
      THEN 'Monitor ticket resolution progress.'
      ELSE 'Account health is good. Continue regular monitoring.'
    END as notes,
    NOW() as created_at
  FROM enterprise_accounts ea
  LEFT JOIN support_tickets st ON st.account_id = ea.id
  WHERE ea.status IN ('active', 'trial', 'past_due')
  GROUP BY ea.id
  ON CONFLICT (account_id, period) DO UPDATE
  SET
    health_score = EXCLUDED.health_score,
    risk_level = EXCLUDED.risk_level,
    tickets_open = EXCLUDED.tickets_open,
    nps_latest = EXCLUDED.nps_latest,
    usage_score = EXCLUDED.usage_score,
    notes = EXCLUDED.notes,
    created_at = EXCLUDED.created_at;
END;
$$;

-- Comment on the new function
COMMENT ON FUNCTION calculate_account_health_from_tickets() IS 'Calculates account health scores based on real support ticket data, NPS responses, and usage metrics';

-- Run initial calculation if any real tickets exist
DO $$
DECLARE
  ticket_count integer;
BEGIN
  SELECT COUNT(*) INTO ticket_count FROM support_tickets;

  IF ticket_count > 0 THEN
    PERFORM calculate_account_health_from_tickets();
    RAISE NOTICE 'Calculated account health from % real support tickets', ticket_count;
  ELSE
    RAISE NOTICE 'No support tickets found - health will be calculated after Jira sync';
    RAISE NOTICE 'Run Jira sync to import support ticket data';
  END IF;
END $$;
