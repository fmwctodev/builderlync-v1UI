/*
  # Update RLS Policies for Opportunities, Invoices, Orders

  ## Overview
  Continues updating RLS policies to organization-scoped access for business
  critical tables.

  ## Tables Updated
  - opportunities
  - pipelines  
  - invoices
  - material_orders
  - work_orders
*/

-- ============================================
-- OPPORTUNITIES TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read all opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can create opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can update opportunities" ON opportunities;
DROP POLICY IF EXISTS "Authenticated users can delete opportunities" ON opportunities;

CREATE POLICY "Organization members can view opportunities"
  ON opportunities FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can create opportunities"
  ON opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can update opportunities"
  ON opportunities FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can delete opportunities"
  ON opportunities FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- ============================================
-- PIPELINES TABLE
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can read pipelines" ON pipelines;
DROP POLICY IF EXISTS "Authenticated users can create pipelines" ON pipelines;
DROP POLICY IF EXISTS "Authenticated users can update pipelines" ON pipelines;
DROP POLICY IF EXISTS "Authenticated users can delete pipelines" ON pipelines;

CREATE POLICY "Organization members can view pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization admins can create pipelines"
  ON pipelines FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can update pipelines"
  ON pipelines FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
      AND om.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can delete pipelines"
  ON pipelines FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
      AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- INVOICES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

CREATE POLICY "Organization members can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- ============================================
-- MATERIAL_ORDERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own material orders" ON material_orders;
DROP POLICY IF EXISTS "Users can create own material orders" ON material_orders;
DROP POLICY IF EXISTS "Users can update own material orders" ON material_orders;
DROP POLICY IF EXISTS "Users can delete own material orders" ON material_orders;

CREATE POLICY "Organization members can view material orders"
  ON material_orders FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can create material orders"
  ON material_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can update material orders"
  ON material_orders FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can delete material orders"
  ON material_orders FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

-- ============================================
-- WORK_ORDERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own work orders" ON work_orders;
DROP POLICY IF EXISTS "Users can create own work orders" ON work_orders;
DROP POLICY IF EXISTS "Users can update own work orders" ON work_orders;
DROP POLICY IF EXISTS "Users can delete own work orders" ON work_orders;

CREATE POLICY "Organization members can view work orders"
  ON work_orders FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can create work orders"
  ON work_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can update work orders"
  ON work_orders FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );

CREATE POLICY "Organization members can delete work orders"
  ON work_orders FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid() AND om.is_active = true
    )
  );
