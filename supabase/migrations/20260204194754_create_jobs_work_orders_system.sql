/*
  # Create Jobs & Work Orders System Tables
  
  1. New Tables
    - job_stage_tasks: Stage task templates for jobs
    - job_photos: Job photo documentation
    - photo_albums: Photo album organization
    - photo_album_items: Album-photo associations
    - photo_annotations: Photo annotations
    - work_orders: Work order management
    - work_order_tasks: Work order tasks
    - work_order_assignments: Work order assignments
    - work_order_checklists: Work order checklists
    - work_order_materials_used: Materials tracking
    - work_order_timesheets: Time tracking
    - work_order_equipment: Equipment used
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Job Stage Tasks Table
CREATE TABLE IF NOT EXISTS job_stage_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_stage text NOT NULL,
  task_name text NOT NULL,
  description text,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  estimated_duration_minutes integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_stage_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view job stage tasks in their org"
    ON job_stage_tasks FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = job_stage_tasks.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage job stage tasks in their org"
    ON job_stage_tasks FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = job_stage_tasks.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Job Photos Table
CREATE TABLE IF NOT EXISTS job_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  thumbnail_url text,
  caption text,
  photo_type text,
  taken_at timestamptz,
  location_lat numeric,
  location_lng numeric,
  uploaded_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage job photos in their org"
    ON job_photos FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = job_photos.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Photo Albums Table
CREATE TABLE IF NOT EXISTS photo_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cover_photo_url text,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage photo albums in their org"
    ON photo_albums FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = photo_albums.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Photo Album Items Table
CREATE TABLE IF NOT EXISTS photo_album_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES job_photos(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(album_id, photo_id)
);

ALTER TABLE photo_album_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage photo album items"
    ON photo_album_items FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM photo_albums
        JOIN user_organizations ON user_organizations.organization_id = photo_albums.organization_id
        WHERE photo_albums.id = photo_album_items.album_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Photo Annotations Table
CREATE TABLE IF NOT EXISTS photo_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES job_photos(id) ON DELETE CASCADE,
  annotation_type text NOT NULL,
  annotation_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE photo_annotations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage photo annotations"
    ON photo_annotations FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM job_photos
        JOIN user_organizations ON user_organizations.organization_id = job_photos.organization_id
        WHERE job_photos.id = photo_annotations.photo_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Orders Table
CREATE TABLE IF NOT EXISTS work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  wo_number text,
  title text NOT NULL,
  description text,
  status text DEFAULT 'draft',
  priority text DEFAULT 'normal',
  work_type text,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  location_address text,
  location_lat numeric,
  location_lng numeric,
  estimated_hours numeric,
  actual_hours numeric,
  estimated_cost numeric,
  actual_cost numeric,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work orders in their org"
    ON work_orders FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = work_orders.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Order Tasks Table
CREATE TABLE IF NOT EXISTS work_order_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id),
  display_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_order_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work order tasks"
    ON work_order_tasks FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM work_orders
        JOIN user_organizations ON user_organizations.organization_id = work_orders.organization_id
        WHERE work_orders.id = work_order_tasks.work_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Order Assignments Table
CREATE TABLE IF NOT EXISTS work_order_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'worker',
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(work_order_id, user_id)
);

ALTER TABLE work_order_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work order assignments"
    ON work_order_assignments FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM work_orders
        JOIN user_organizations ON user_organizations.organization_id = work_orders.organization_id
        WHERE work_orders.id = work_order_assignments.work_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Order Checklists Table
CREATE TABLE IF NOT EXISTS work_order_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  checklist_items jsonb DEFAULT '[]'::jsonb,
  is_template boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_order_checklists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work order checklists"
    ON work_order_checklists FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM work_orders
        JOIN user_organizations ON user_organizations.organization_id = work_orders.organization_id
        WHERE work_orders.id = work_order_checklists.work_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Order Materials Used Table
CREATE TABLE IF NOT EXISTS work_order_materials_used (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  material_name text NOT NULL,
  material_sku text,
  quantity numeric NOT NULL,
  unit text DEFAULT 'each',
  unit_cost numeric,
  total_cost numeric,
  notes text,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_order_materials_used ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work order materials"
    ON work_order_materials_used FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM work_orders
        JOIN user_organizations ON user_organizations.organization_id = work_orders.organization_id
        WHERE work_orders.id = work_order_materials_used.work_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Order Timesheets Table
CREATE TABLE IF NOT EXISTS work_order_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clock_in timestamptz NOT NULL,
  clock_out timestamptz,
  break_minutes integer DEFAULT 0,
  hours_worked numeric,
  hourly_rate numeric,
  total_pay numeric,
  notes text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_order_timesheets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work order timesheets"
    ON work_order_timesheets FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM work_orders
        JOIN user_organizations ON user_organizations.organization_id = work_orders.organization_id
        WHERE work_orders.id = work_order_timesheets.work_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work Order Equipment Table
CREATE TABLE IF NOT EXISTS work_order_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  equipment_name text NOT NULL,
  equipment_id text,
  check_out_time timestamptz,
  check_in_time timestamptz,
  condition_out text,
  condition_in text,
  notes text,
  checked_out_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_order_equipment ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage work order equipment"
    ON work_order_equipment FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM work_orders
        JOIN user_organizations ON user_organizations.organization_id = work_orders.organization_id
        WHERE work_orders.id = work_order_equipment.work_order_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_stage_tasks_org ON job_stage_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_job ON job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_org ON job_photos(organization_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_org ON photo_albums(organization_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_job ON photo_albums(job_id);
CREATE INDEX IF NOT EXISTS idx_photo_album_items_album ON photo_album_items(album_id);
CREATE INDEX IF NOT EXISTS idx_photo_annotations_photo ON photo_annotations(photo_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_job ON work_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_order_tasks_wo ON work_order_tasks(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_assignments_wo ON work_order_assignments(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_timesheets_wo ON work_order_timesheets(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_timesheets_user ON work_order_timesheets(user_id);
