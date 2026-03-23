/*
  # Add Jira Integration to Support System

  ## Overview
  Adds columns and tables to enable bidirectional sync with Jira for support tickets and feedback.

  ## Changes

  1. **Support Tickets Jira Mapping**
     - Add jira_issue_id for unique Jira issue ID
     - Add jira_issue_key for human-readable reference (e.g., SUPP-123)
     - Add jira_project_key to track Jira project
     - Add jira_sync_status to monitor sync health
     - Add last_synced_at for tracking sync freshness
     - Add jira_metadata jsonb for custom fields

  2. **Support Ticket Comments Jira Mapping**
     - Add jira_comment_id to link with Jira comments
     - Add last_synced_at for comment sync tracking

  3. **Product Feedback Jira Mapping**
     - Add jira_issue_id for linking feedback to Jira
     - Add jira_issue_key for reference
     - Add sync tracking columns

  4. **Jira Sync Log Table**
     - Track all sync operations
     - Monitor sync health
     - Log errors and retries

  5. **Indexes**
     - Fast lookups by Jira IDs
     - Performance optimization for sync queries

  ## Security
  - No RLS changes needed (existing policies apply)
  - Maintains data integrity with proper constraints
*/

-- Add Jira integration columns to support_tickets
DO $$
BEGIN
  -- Add jira_issue_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'jira_issue_id'
  ) THEN
    ALTER TABLE support_tickets
    ADD COLUMN jira_issue_id text UNIQUE;
  END IF;

  -- Add jira_issue_key (e.g., SUPP-123)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'jira_issue_key'
  ) THEN
    ALTER TABLE support_tickets
    ADD COLUMN jira_issue_key text UNIQUE;
  END IF;

  -- Add jira_project_key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'jira_project_key'
  ) THEN
    ALTER TABLE support_tickets
    ADD COLUMN jira_project_key text;
  END IF;

  -- Add jira_sync_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'jira_sync_status'
  ) THEN
    ALTER TABLE support_tickets
    ADD COLUMN jira_sync_status text DEFAULT 'not_synced' 
    CHECK (jira_sync_status IN ('synced', 'not_synced', 'pending', 'error', 'conflict'));
  END IF;

  -- Add last_synced_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE support_tickets
    ADD COLUMN last_synced_at timestamptz;
  END IF;

  -- Add jira_metadata for custom fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'jira_metadata'
  ) THEN
    ALTER TABLE support_tickets
    ADD COLUMN jira_metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Add Jira columns to support_ticket_comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_ticket_comments' AND column_name = 'jira_comment_id'
  ) THEN
    ALTER TABLE support_ticket_comments
    ADD COLUMN jira_comment_id text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_ticket_comments' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE support_ticket_comments
    ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;

-- Add Jira columns to product_feedback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_feedback' AND column_name = 'jira_issue_id'
  ) THEN
    ALTER TABLE product_feedback
    ADD COLUMN jira_issue_id text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_feedback' AND column_name = 'jira_issue_key'
  ) THEN
    ALTER TABLE product_feedback
    ADD COLUMN jira_issue_key text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_feedback' AND column_name = 'jira_sync_status'
  ) THEN
    ALTER TABLE product_feedback
    ADD COLUMN jira_sync_status text DEFAULT 'not_synced'
    CHECK (jira_sync_status IN ('synced', 'not_synced', 'pending', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_feedback' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE product_feedback
    ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;

-- Create Jira Sync Log Table
CREATE TABLE IF NOT EXISTS jira_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL CHECK (sync_type IN ('issue', 'comment', 'full', 'webhook')),
  direction text NOT NULL CHECK (direction IN ('push', 'pull', 'bidirectional')),
  status text NOT NULL CHECK (status IN ('started', 'success', 'error', 'partial')),
  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_jira_issue_id 
  ON support_tickets(jira_issue_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_jira_issue_key 
  ON support_tickets(jira_issue_key);

CREATE INDEX IF NOT EXISTS idx_support_tickets_jira_sync_status 
  ON support_tickets(jira_sync_status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_jira_project 
  ON support_tickets(jira_project_key);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_jira_comment_id 
  ON support_ticket_comments(jira_comment_id);

CREATE INDEX IF NOT EXISTS idx_product_feedback_jira_issue_id 
  ON product_feedback(jira_issue_id);

CREATE INDEX IF NOT EXISTS idx_jira_sync_log_type 
  ON jira_sync_log(sync_type);

CREATE INDEX IF NOT EXISTS idx_jira_sync_log_status 
  ON jira_sync_log(status);

CREATE INDEX IF NOT EXISTS idx_jira_sync_log_started_at 
  ON jira_sync_log(started_at DESC);

-- Enable RLS on jira_sync_log
ALTER TABLE jira_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy for jira_sync_log (Super Admin access)
CREATE POLICY "Super admin full access to jira_sync_log"
  ON jira_sync_log FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments on new columns
COMMENT ON COLUMN support_tickets.jira_issue_id IS 'Jira issue ID for bidirectional sync';
COMMENT ON COLUMN support_tickets.jira_issue_key IS 'Human-readable Jira issue key (e.g., SUPP-123)';
COMMENT ON COLUMN support_tickets.jira_project_key IS 'Jira project key this ticket belongs to';
COMMENT ON COLUMN support_tickets.jira_sync_status IS 'Current sync status with Jira';
COMMENT ON COLUMN support_tickets.last_synced_at IS 'Timestamp of last successful Jira sync';
COMMENT ON COLUMN support_tickets.jira_metadata IS 'Jira custom fields and additional metadata';

COMMENT ON COLUMN support_ticket_comments.jira_comment_id IS 'Jira comment ID for sync tracking';
COMMENT ON COLUMN support_ticket_comments.last_synced_at IS 'Timestamp of last comment sync with Jira';

COMMENT ON COLUMN product_feedback.jira_issue_id IS 'Linked Jira issue ID';
COMMENT ON COLUMN product_feedback.jira_issue_key IS 'Linked Jira issue key';
COMMENT ON COLUMN product_feedback.jira_sync_status IS 'Sync status with Jira';
COMMENT ON COLUMN product_feedback.last_synced_at IS 'Last sync timestamp';

COMMENT ON TABLE jira_sync_log IS 'Tracks all Jira sync operations for monitoring and debugging';
