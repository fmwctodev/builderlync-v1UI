/*
  # Extend Proposal Line Items Table

  1. Changes
    - Add `organization_id` column for multi-tenant support
    - Add `line_number` column for ordering
    - Add `name` column (will use item_name if exists)
    - Add `source_tag` column to track origin
    - Add `was_edited` column to track manual edits
    - Add `catalog_sku` column to link to pricing catalog

  2. Security
    - Update RLS policies to use organization_id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_line_items' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE proposal_line_items ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_line_items' AND column_name = 'line_number'
  ) THEN
    ALTER TABLE proposal_line_items ADD COLUMN line_number integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_line_items' AND column_name = 'name'
  ) THEN
    ALTER TABLE proposal_line_items ADD COLUMN name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_line_items' AND column_name = 'source_tag'
  ) THEN
    ALTER TABLE proposal_line_items ADD COLUMN source_tag text DEFAULT 'manual';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_line_items' AND column_name = 'was_edited'
  ) THEN
    ALTER TABLE proposal_line_items ADD COLUMN was_edited boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'proposal_line_items' AND column_name = 'catalog_sku'
  ) THEN
    ALTER TABLE proposal_line_items ADD COLUMN catalog_sku text;
  END IF;
END $$;

UPDATE proposal_line_items SET name = item_name WHERE name IS NULL AND item_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_proposal_line_items_organization_id ON proposal_line_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposal_line_items_line_number ON proposal_line_items(proposal_id, line_number);

DROP POLICY IF EXISTS "Organization members can view proposal line items" ON proposal_line_items;
DROP POLICY IF EXISTS "Organization members can create proposal line items" ON proposal_line_items;
DROP POLICY IF EXISTS "Organization members can update proposal line items" ON proposal_line_items;
DROP POLICY IF EXISTS "Organization members can delete proposal line items" ON proposal_line_items;

CREATE POLICY "Organization members can view proposal line items"
  ON proposal_line_items
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposal_line_items.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can create proposal line items"
  ON proposal_line_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposal_line_items.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can update proposal line items"
  ON proposal_line_items
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposal_line_items.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  )
  WITH CHECK (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposal_line_items.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can delete proposal line items"
  ON proposal_line_items
  FOR DELETE
  TO authenticated
  USING (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proposal_line_items.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = true
    )
  );