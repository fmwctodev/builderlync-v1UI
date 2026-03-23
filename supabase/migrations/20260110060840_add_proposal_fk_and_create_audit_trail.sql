/*
  # Add Foreign Key to Proposal Line Items and Create Audit Trail

  1. Changes to proposal_line_items
    - Add foreign key constraint to proposals table

  2. New Tables
    - `proposal_audit_trail` - Tracks all proposal events

  3. Security
    - RLS policies for audit trail
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'proposal_line_items_proposal_id_fkey_proposals'
    AND table_name = 'proposal_line_items'
  ) THEN
    ALTER TABLE proposal_line_items
    ADD CONSTRAINT proposal_line_items_proposal_id_fkey_proposals
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE TABLE IF NOT EXISTS proposal_audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'proposal_created_from_estimate',
    'proposal_updated_from_estimate',
    'proposal_sent',
    'proposal_viewed',
    'proposal_accepted',
    'proposal_declined',
    'line_item_edited',
    'line_item_added',
    'line_item_deleted',
    'signature_received',
    'proposal_expired',
    'proposal_archived',
    'proposal_created',
    'proposal_updated'
  )),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estimate_snapshot_id uuid REFERENCES estimate_snapshots(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proposal_audit_trail ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposal_audit_trail' AND policyname = 'Organization members can view proposal audit trail'
  ) THEN
    CREATE POLICY "Organization members can view proposal audit trail"
      ON proposal_audit_trail
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.organization_id = proposal_audit_trail.organization_id
          AND om.user_id = auth.uid()
          AND om.is_active = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'proposal_audit_trail' AND policyname = 'Organization members can create audit entries'
  ) THEN
    CREATE POLICY "Organization members can create audit entries"
      ON proposal_audit_trail
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM organization_members om
          WHERE om.organization_id = proposal_audit_trail.organization_id
          AND om.user_id = auth.uid()
          AND om.is_active = true
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposal_audit_trail_proposal_id ON proposal_audit_trail(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_audit_trail_event_type ON proposal_audit_trail(event_type);
CREATE INDEX IF NOT EXISTS idx_proposal_audit_trail_created_at ON proposal_audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_audit_trail_organization_id ON proposal_audit_trail(organization_id);