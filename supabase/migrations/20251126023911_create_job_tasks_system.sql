/*
  # Job Tasks Management System

  1. New Tables
    - `job_stage_tasks`
      - `id` (uuid, primary key)
      - `stage_name` (text) - The job workflow stage this task belongs to
      - `task_name` (text) - Name/title of the task
      - `task_description` (text, nullable) - Detailed description
      - `is_auto_created` (boolean) - Whether this task auto-creates when job enters stage
      - `task_order` (integer) - Display order within stage
      - `task_category` (text) - Category for optional tasks (e.g., 'inspection', 'proposal', etc.)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `job_tasks`
      - `id` (uuid, primary key)
      - `job_id` (integer) - Reference to the job (external API)
      - `stage_task_id` (uuid, nullable) - Reference to template task (null for custom tasks)
      - `task_name` (text) - Task name (copied from template or custom)
      - `task_description` (text, nullable) - Task description
      - `assigned_to` (uuid, nullable) - Reference to staff member
      - `status` (text) - pending, in_progress, completed
      - `due_date` (date, nullable) - When task should be completed
      - `completed_at` (timestamptz, nullable) - When task was marked complete
      - `notes` (text, nullable) - Additional notes
      - `task_order` (integer) - Custom ordering
      - `created_by` (uuid, nullable) - User who created the task
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage tasks
*/

-- Create job_stage_tasks table
CREATE TABLE IF NOT EXISTS job_stage_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_name text NOT NULL,
  task_name text NOT NULL,
  task_description text,
  is_auto_created boolean DEFAULT false,
  task_order integer DEFAULT 0,
  task_category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_tasks table
CREATE TABLE IF NOT EXISTS job_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id integer NOT NULL,
  stage_task_id uuid REFERENCES job_stage_tasks(id) ON DELETE SET NULL,
  task_name text NOT NULL,
  task_description text,
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date date,
  completed_at timestamptz,
  notes text,
  task_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_stage_tasks_stage_name ON job_stage_tasks(stage_name);
CREATE INDEX IF NOT EXISTS idx_job_stage_tasks_auto_created ON job_stage_tasks(is_auto_created);
CREATE INDEX IF NOT EXISTS idx_job_tasks_job_id ON job_tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tasks_assigned_to ON job_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_tasks_status ON job_tasks(status);

-- Enable RLS
ALTER TABLE job_stage_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_stage_tasks (read-only for users, templates are system-managed)
CREATE POLICY "Users can view task templates"
  ON job_stage_tasks FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for job_tasks
CREATE POLICY "Users can view job tasks"
  ON job_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create job tasks"
  ON job_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update job tasks"
  ON job_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete job tasks"
  ON job_tasks FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_stage_tasks_updated_at
  BEFORE UPDATE ON job_stage_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_tasks_updated_at
  BEFORE UPDATE ON job_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();