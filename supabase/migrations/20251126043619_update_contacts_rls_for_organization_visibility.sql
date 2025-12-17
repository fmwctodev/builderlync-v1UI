/*
  # Update Contacts RLS for Organization-Wide Visibility

  ## Overview
  This migration updates the RLS policies on the contacts table to allow all authenticated users
  within an organization to view all contacts, not just their own. This enables the Contacts module
  to display contacts from all users when loading the contacts list.

  ## Changes Made

  ### 1. Updated Policies
  - Modified "Users can view own contacts" policy to allow viewing all contacts
  - Kept INSERT policy to set user_id to authenticated user
  - Kept UPDATE and DELETE policies restricted to contact owners for data security
  
  ## Security Considerations
  - All authenticated users can now view all contacts (READ access)
  - Only contact creators can update or delete their contacts (WRITE access)
  - New contacts automatically get user_id set to the creator
  - This assumes a single-tenant organization model where all users should see all contacts

  ## Note
  If multi-tenant isolation is needed in the future, add an organization_id column and filter by it.
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;

-- Create new SELECT policy that allows all authenticated users to view all contacts
CREATE POLICY "All authenticated users can view contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

-- Update the INSERT policy to ensure user_id is always set to the authenticated user
DROP POLICY IF EXISTS "Users can create own contacts" ON contacts;

CREATE POLICY "Authenticated users can create contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
