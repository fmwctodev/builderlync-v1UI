/*
  # Update Appointments RLS for Organization-Wide Visibility

  ## Overview
  This migration updates the RLS policies on the appointments table to allow all authenticated users
  within an organization to view all appointments, not just their own. This enables the Appointment
  List View to display appointments from all users when filtering by status (Upcoming, Cancelled, All).

  ## Changes Made

  ### 1. Updated Policies
  - Modified "Users can view their own appointments" policy to allow viewing all appointments
  - Kept INSERT, UPDATE, DELETE policies restricted to appointment owners for data security
  
  ## Security Considerations
  - All authenticated users can now view all appointments (READ access)
  - Only appointment owners can create, update, or delete appointments (WRITE access)
  - This assumes a single-tenant organization model where all users should see all appointments

  ## Note
  If multi-tenant isolation is needed in the future, add an organization_id column and filter by it.
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;

-- Create new SELECT policy that allows all authenticated users to view all appointments
CREATE POLICY "All authenticated users can view appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (true);
