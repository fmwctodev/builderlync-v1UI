/*
  # Create Opportunity Extended Features

  1. New Tables
    - `opportunity_tasks`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `status` (text: todo, in_progress, completed)
      - `priority` (text: low, medium, high)
      - `assigned_to` (uuid)
      - `due_date` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `opportunity_notes`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `is_pinned` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `opportunity_payments`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, foreign key to auth.users)
      - `amount` (numeric)
      - `payment_date` (date)
      - `payment_method` (text)
      - `transaction_reference` (text)
      - `status` (text: pending, completed, failed, refunded)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `opportunity_appointments`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `user_id` (uuid, foreign key to auth.users)
      - `appointment_type` (text)
      - `appointment_date` (timestamptz)
      - `status` (text: scheduled, completed, cancelled, rescheduled)
      - `assigned_to` (uuid)
      - `location` (text)
      - `notes` (text)
      - `reminder_enabled` (boolean)
      - `reminder_minutes_before` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `opportunity_associated_objects`
      - `id` (uuid, primary key)
      - `opportunity_id` (uuid, foreign key to opportunities)
      - `object_type` (text: job, contact, document, proposal, estimate)
      - `object_id` (text)
      - `object_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their organization's data
*/

-- Create opportunity_tasks table
CREATE TABLE IF NOT EXISTS opportunity_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid,
  title text NOT NULL,
  description text,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to uuid,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity_notes table
CREATE TABLE IF NOT EXISTS opportunity_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity_payments table
CREATE TABLE IF NOT EXISTS opportunity_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid,
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  payment_method text,
  transaction_reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity_appointments table
CREATE TABLE IF NOT EXISTS opportunity_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid,
  appointment_type text NOT NULL,
  appointment_date timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  assigned_to uuid,
  location text,
  notes text,
  reminder_enabled boolean DEFAULT true,
  reminder_minutes_before integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create opportunity_associated_objects table
CREATE TABLE IF NOT EXISTS opportunity_associated_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  object_type text NOT NULL CHECK (object_type IN ('job', 'contact', 'document', 'proposal', 'estimate')),
  object_id text NOT NULL,
  object_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_opportunity_id ON opportunity_tasks(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_user_id ON opportunity_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_status ON opportunity_tasks(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_due_date ON opportunity_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_opportunity_notes_opportunity_id ON opportunity_notes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_user_id ON opportunity_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_is_pinned ON opportunity_notes(is_pinned);

CREATE INDEX IF NOT EXISTS idx_opportunity_payments_opportunity_id ON opportunity_payments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_payments_user_id ON opportunity_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_payments_status ON opportunity_payments(status);

CREATE INDEX IF NOT EXISTS idx_opportunity_appointments_opportunity_id ON opportunity_appointments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_appointments_user_id ON opportunity_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_appointments_date ON opportunity_appointments(appointment_date);

CREATE INDEX IF NOT EXISTS idx_opportunity_associated_objects_opportunity_id ON opportunity_associated_objects(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_associated_objects_type ON opportunity_associated_objects(object_type);

-- Enable Row Level Security
ALTER TABLE opportunity_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_associated_objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunity_tasks
CREATE POLICY "Users can view tasks in their organization"
  ON opportunity_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_tasks.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their opportunities"
  ON opportunity_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_tasks.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their organization"
  ON opportunity_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_tasks.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_tasks.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their organization"
  ON opportunity_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_tasks.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

-- RLS Policies for opportunity_notes
CREATE POLICY "Users can view notes in their organization"
  ON opportunity_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_notes.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes for their opportunities"
  ON opportunity_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_notes.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in their organization"
  ON opportunity_notes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_notes.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_notes.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in their organization"
  ON opportunity_notes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_notes.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

-- RLS Policies for opportunity_payments
CREATE POLICY "Users can view payments in their organization"
  ON opportunity_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_payments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their opportunities"
  ON opportunity_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_payments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments in their organization"
  ON opportunity_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_payments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_payments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payments in their organization"
  ON opportunity_payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_payments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

-- RLS Policies for opportunity_appointments
CREATE POLICY "Users can view appointments in their organization"
  ON opportunity_appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_appointments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments for their opportunities"
  ON opportunity_appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_appointments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments in their organization"
  ON opportunity_appointments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_appointments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_appointments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments in their organization"
  ON opportunity_appointments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_appointments.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

-- RLS Policies for opportunity_associated_objects
CREATE POLICY "Users can view associated objects in their organization"
  ON opportunity_associated_objects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_associated_objects.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create associated objects for their opportunities"
  ON opportunity_associated_objects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_associated_objects.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete associated objects in their organization"
  ON opportunity_associated_objects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_associated_objects.opportunity_id
      AND opportunities.user_id = auth.uid()
    )
  );