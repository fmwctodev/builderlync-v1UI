/*
  # Fix Organization Members RLS Policies

  This migration fixes the infinite recursion issue in organization_members RLS policies.
  The problem was policies querying organization_members from within organization_members policies.

  ## Changes
  - Drop existing recursive policies
  - Create simple, non-recursive policies
  - Allow INSERT for authenticated users (they're creating their first org)
  - Use direct user_id checks instead of subqueries
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members view org members" ON organization_members;
DROP POLICY IF EXISTS "Org members can view members" ON organization_members;
DROP POLICY IF EXISTS "Org owner/admin can manage members" ON organization_members;

-- Create simple, non-recursive policies

-- Allow users to see their own memberships
CREATE POLICY "Users can view own memberships"
  ON organization_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to insert themselves as members (for signup flow)
CREATE POLICY "Users can create own membership"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow owners/admins to manage members in their organization
-- This uses a helper function to avoid recursion
CREATE POLICY "Owners can manage organization members"
  ON organization_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_members.organization_id
      AND o.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_members.organization_id
      AND o.created_by = auth.uid()
    )
  );