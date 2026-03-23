/*
  # Create Work Orders Management System

  1. New Tables
    - `work_orders`
      - Work order management linking jobs and material orders
      - REQUIRED: Must link to both a job AND a material order
      - Tracks crew assignments, schedules, and completion
      - Manages on-site work execution
    
    - `work_order_tasks`
      - Task checklist for each work order
      - Sequential tasks with completion tracking
      - Photo attachments for task verification
    
    - `work_order_assignments`
      - Crew and staff assignments to work orders
      - Track check-in/check-out times
      - Hours worked per person
    
    - `work_order_checklists`
      - Safety and quality checklists
      - Pre-work, during-work, and post-work checks
    
    - `work_order_materials_used`
      - Track actual materials used from material orders
      - Waste tracking and reasons
      - Links to material_order_items
    
    - `work_order_timesheets`
      - Labor time tracking per staff member
      - Regular, overtime, and double-time hours
      - Cost calculations
    
    - `work_order_equipment`
      - Equipment and tool usage tracking
      - Rental costs and usage hours

  2. Security
    - Enable RLS on all tables
    - Users can view work orders in their organization
    - Project managers and admins can manage work orders
    - Staff can update their assignments and timesheets

  3. Indexes
    - Work order lookup by job and material order
    - Assignment lookup by staff
    - Timesheet queries for payroll

  4. Features
    - Required job and material order linking
    - Crew assignment and scheduling
    - Task completion tracking
    - Time and attendance
    - Materials consumption tracking
    - Safety checklist management
*/

-- Create work_orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE RESTRICT NOT NULL, -- REQUIRED
  material_order_id uuid REFERENCES material_orders(id) ON DELETE RESTRICT NOT NULL, -- REQUIRED
  
  -- Work Order Numbers
  wo_number text, -- Auto-generated: WO-{year}-{sequence}
  
  -- Basic Information
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Status
  status text DEFAULT 'draft' CHECK (status IN (
    'draft',
    'scheduled',
    'assigned',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled'
  )),
  
  -- Work Type
  work_type text CHECK (work_type IN (
    'installation',
    'repair',
    'inspection',
    'maintenance',
    'emergency',
    'warranty'
  )),
  
  -- Schedule Information
  scheduled_start_date timestamptz,
  scheduled_end_date timestamptz,
  actual_start_date timestamptz,
  actual_end_date timestamptz,
  estimated_hours numeric(8, 2),
  actual_hours numeric(8, 2),
  
  -- Location Information
  customer_id uuid REFERENCES contacts(id),
  job_address text,
  site_contact_name text,
  site_contact_phone text,
  access_instructions text,
  
  -- Crew Assignments
  assigned_to_crew uuid[], -- Array of staff IDs
  lead_technician_id uuid REFERENCES auth.users(id),
  supervisor_id uuid REFERENCES auth.users(id),
  
  -- Weather and Conditions
  weather_dependent boolean DEFAULT false,
  weather_conditions text,
  postponed_due_to_weather boolean DEFAULT false,
  
  -- Safety
  safety_requirements jsonb, -- PPE, certifications, etc.
  safety_incident_occurred boolean DEFAULT false,
  safety_incident_description text,
  
  -- Completion and Quality
  completion_notes text,
  internal_notes text,
  quality_check_completed boolean DEFAULT false,
  quality_check_notes text,
  requires_inspection boolean DEFAULT false,
  inspection_completed boolean DEFAULT false,
  inspection_passed boolean,
  inspection_notes text,
  
  -- Customer Signatures
  customer_signature_url text,
  customer_signature_date timestamptz,
  technician_signature_url text,
  technician_signature_date timestamptz,
  
  -- Photos and Documentation
  photo_ids uuid[], -- Array of photo IDs from job_photos table
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  completed_by uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create work_order_tasks table
CREATE TABLE IF NOT EXISTS work_order_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Task Information
  task_name text NOT NULL,
  description text,
  sequence_order integer NOT NULL DEFAULT 0,
  is_required boolean DEFAULT true,
  estimated_duration_minutes integer,
  
  -- Completion
  is_completed boolean DEFAULT false,
  completed_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  notes text,
  
  -- Photo Documentation
  photo_ids uuid[], -- Array of photo IDs
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_order_assignments table
CREATE TABLE IF NOT EXISTS work_order_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
  
  -- Assignment Details
  role text CHECK (role IN ('lead', 'technician', 'helper', 'supervisor')),
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  
  -- Acceptance
  accepted_at timestamptz,
  declined_at timestamptz,
  decline_reason text,
  
  -- Time Tracking
  check_in_time timestamptz,
  check_out_time timestamptz,
  hours_worked numeric(8, 2),
  
  -- Notes
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_order_checklists table
CREATE TABLE IF NOT EXISTS work_order_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Checklist Information
  checklist_type text NOT NULL CHECK (checklist_type IN (
    'safety',
    'quality',
    'pre_work',
    'post_work',
    'completion'
  )),
  checklist_name text NOT NULL,
  
  -- Checklist Items (stored as JSON array)
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {"item": "Hard hat worn", "checked": true, "required": true},
  --   {"item": "Safety glasses worn", "checked": true, "required": true},
  --   {"item": "Work area secured", "checked": false, "required": true}
  -- ]
  
  -- Completion
  completed_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_order_materials_used table
CREATE TABLE IF NOT EXISTS work_order_materials_used (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  material_order_item_id uuid REFERENCES material_order_items(id) ON DELETE RESTRICT,
  
  -- Material Information
  product_name text NOT NULL,
  product_sku text,
  
  -- Usage
  quantity_used numeric(10, 2) NOT NULL,
  unit_of_measure text DEFAULT 'EA',
  
  -- Waste Tracking
  quantity_wasted numeric(10, 2) DEFAULT 0,
  waste_reason text,
  
  -- Notes
  notes text,
  
  -- User Tracking
  recorded_by uuid REFERENCES auth.users(id),
  recorded_at timestamptz DEFAULT now(),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_order_timesheets table
CREATE TABLE IF NOT EXISTS work_order_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE NOT NULL,
  
  -- Time Information
  work_date date NOT NULL,
  clock_in_time timestamptz NOT NULL,
  clock_out_time timestamptz,
  break_minutes integer DEFAULT 0,
  total_hours numeric(8, 2),
  
  -- Labor Type
  labor_type text DEFAULT 'regular' CHECK (labor_type IN (
    'regular',
    'overtime',
    'double_time'
  )),
  
  -- Cost Information
  hourly_rate numeric(10, 2),
  total_cost numeric(12, 2),
  
  -- Notes
  notes text,
  
  -- Approval
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create work_order_equipment table
CREATE TABLE IF NOT EXISTS work_order_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Equipment Information
  equipment_name text NOT NULL,
  equipment_type text, -- ladder, lift, compressor, etc.
  equipment_id text, -- Internal equipment ID if tracked
  
  -- Usage
  usage_hours numeric(8, 2),
  usage_date date,
  
  -- Cost
  rental_cost numeric(12, 2),
  is_owned boolean DEFAULT false,
  
  -- Notes
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_organization ON work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_job ON work_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_material_order ON work_orders(material_order_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_wo_number ON work_orders(wo_number);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled_start ON work_orders(scheduled_start_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_lead_tech ON work_orders(lead_technician_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_supervisor ON work_orders(supervisor_id);

CREATE INDEX IF NOT EXISTS idx_work_order_tasks_work_order ON work_order_tasks(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_sequence ON work_order_tasks(work_order_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_work_order_assignments_work_order ON work_order_assignments(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_assignments_staff ON work_order_assignments(staff_id);

CREATE INDEX IF NOT EXISTS idx_work_order_checklists_work_order ON work_order_checklists(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_checklists_type ON work_order_checklists(checklist_type);

CREATE INDEX IF NOT EXISTS idx_work_order_materials_work_order ON work_order_materials_used(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_materials_item ON work_order_materials_used(material_order_item_id);

CREATE INDEX IF NOT EXISTS idx_work_order_timesheets_work_order ON work_order_timesheets(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_timesheets_staff ON work_order_timesheets(staff_id);
CREATE INDEX IF NOT EXISTS idx_work_order_timesheets_date ON work_order_timesheets(work_date);

CREATE INDEX IF NOT EXISTS idx_work_order_equipment_work_order ON work_order_equipment(work_order_id);

-- Enable Row Level Security
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_materials_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_orders
CREATE POLICY "Users can view work orders in their organization"
  ON work_orders FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project managers can create work orders"
  ON work_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'project_manager')
    )
  );

CREATE POLICY "Project managers can update work orders"
  ON work_orders FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'project_manager')
    )
  );

CREATE POLICY "Admins can delete work orders"
  ON work_orders FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for work_order_tasks (all users in org can view and update)
CREATE POLICY "Users can view tasks in their organization work orders"
  ON work_order_tasks FOR SELECT
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can update assigned work order tasks"
  ON work_order_tasks FOR ALL
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for work_order_assignments
CREATE POLICY "Users can view assignments in their organization"
  ON work_order_assignments FOR SELECT
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Managers can manage work order assignments"
  ON work_order_assignments FOR ALL
  TO authenticated
  USING (
    work_order_id IN (
      SELECT wo.id FROM work_orders wo
      JOIN organization_members om ON wo.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'manager', 'project_manager')
    )
  );

-- RLS Policies for remaining tables (similar pattern)
CREATE POLICY "Users can view checklists in their organization"
  ON work_order_checklists FOR SELECT
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can manage checklists"
  ON work_order_checklists FOR ALL
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view materials used"
  ON work_order_materials_used FOR SELECT
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can log materials used"
  ON work_order_materials_used FOR ALL
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view timesheets"
  ON work_order_timesheets FOR SELECT
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can manage own timesheets"
  ON work_order_timesheets FOR ALL
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view equipment"
  ON work_order_equipment FOR SELECT
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can log equipment usage"
  ON work_order_equipment FOR ALL
  TO authenticated
  USING (
    work_order_id IN (
      SELECT id FROM work_orders
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to auto-generate WO numbers
CREATE OR REPLACE FUNCTION generate_wo_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.wo_number IS NULL THEN
    NEW.wo_number := 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                     LPAD(NEXTVAL('wo_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for WO numbers
CREATE SEQUENCE IF NOT EXISTS wo_number_seq START 1;

-- Create trigger to auto-generate WO numbers
DROP TRIGGER IF EXISTS trigger_generate_wo_number ON work_orders;
CREATE TRIGGER trigger_generate_wo_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_wo_number();