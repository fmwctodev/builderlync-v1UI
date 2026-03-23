/*
  # Create Proposals Table

  1. New Tables
    - `proposals`
      - `id` (uuid, primary key) - Unique identifier
      - `organization_id` (uuid, not null) - References organizations
      - `title` (text, not null) - Proposal title
      - `type` (text) - Type: proposal, estimate, contract
      - `customer_id` (uuid) - References contacts table
      - `contact_id` (uuid) - Alternative reference to contacts
      - `job_id` (uuid) - References jobs table
      - `opportunity_id` (uuid) - References opportunities table
      - `status` (text) - Status: draft, waiting, completed, accepted, declined, expired, archived
      - `value` (decimal) - Total proposal value
      - `content` (jsonb) - Structured content sections
      - `property_id` (text) - Property identifier
      - `property_address` (text) - Human-readable address
      - `linked_estimate_snapshot_id` (uuid) - Links to estimate_snapshots
      - `sent_at` (timestamptz) - When proposal was sent
      - `viewed_at` (timestamptz) - When customer viewed
      - `accepted_at` (timestamptz) - When accepted
      - `declined_at` (timestamptz) - When declined
      - `expires_at` (timestamptz) - Expiration date
      - `signature_url` (text) - URL to signed document
      - `signature_received_at` (timestamptz) - When signature received
      - `created_by` (uuid) - User who created
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Policies for organization members

  3. Indexes
    - Multiple indexes for common queries
*/

CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text DEFAULT 'proposal' CHECK (type IN ('proposal', 'estimate', 'contract')),
  customer_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'completed', 'accepted', 'declined', 'expired', 'archived', 'payments')),
  value decimal DEFAULT 0,
  content jsonb DEFAULT '{}',
  property_id text,
  property_address text,
  linked_estimate_snapshot_id uuid REFERENCES estimate_snapshots(id) ON DELETE SET NULL,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  expires_at timestamptz,
  signature_url text,
  signature_received_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view proposals"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposals.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can create proposals"
  ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposals.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can update proposals"
  ON proposals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposals.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposals.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can delete proposals"
  ON proposals
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposals.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_proposals_organization_id ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity_id ON proposals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_proposals_property_id ON proposals(property_id);
CREATE INDEX IF NOT EXISTS idx_proposals_linked_estimate_snapshot_id ON proposals(linked_estimate_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);

CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_proposals_updated_at ON proposals;
CREATE TRIGGER trigger_update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();