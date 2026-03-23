/*
  # Create Job Photos and Google Cloud Storage System

  1. New Tables
    - `job_photos`
      - Photo documentation for jobs
      - Links to Google Cloud Storage
      - GPS location tracking
      - Links to jobs, contacts, and work orders
      - Tag system for organization
    
    - `photo_albums`
      - Organize photos into collections
      - Per-job albums
      - Cover photo selection
    
    - `photo_album_items`
      - Junction table for photos in albums
      - Sort order management
    
    - `photo_annotations` (future feature)
      - Drawing and markup on photos
      - Annotations for damage, measurements, etc.

  2. Security
    - Enable RLS on all tables
    - Users can view photos in their organization
    - Anyone can upload photos
    - Only uploaders and admins can delete

  3. Indexes
    - Photo lookup by job, contact, work order
    - Album queries
    - Tag searches
    - Date range queries

  4. Features
    - Google Cloud Storage integration
    - Automatic thumbnail generation
    - GPS location tracking
    - Photo tagging system
    - Album organization
    - Before/after photo linking
*/

-- Create job_photos table
CREATE TABLE IF NOT EXISTS job_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Relationships
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
  
  -- Google Cloud Storage Information
  file_url text NOT NULL, -- Full GCS URL
  thumbnail_url text, -- GCS thumbnail URL
  gcs_bucket_name text NOT NULL,
  gcs_file_path text NOT NULL, -- Path within bucket
  
  -- File Information
  file_name text NOT NULL,
  file_size bigint, -- Size in bytes
  mime_type text,
  
  -- Image Metadata
  width integer,
  height integer,
  orientation integer DEFAULT 1,
  
  -- Capture Information
  capture_date timestamptz DEFAULT now(),
  gps_latitude numeric(10, 8),
  gps_longitude numeric(11, 8),
  gps_accuracy numeric(8, 2),
  
  -- Organization and Tagging
  description text,
  tags text[], -- Array of tags
  category text, -- 'before', 'during', 'after', 'damage', 'inspection', etc.
  
  -- Photo Relationships
  is_before_photo boolean DEFAULT false,
  is_after_photo boolean DEFAULT false,
  related_photo_id uuid, -- Link before/after photos
  
  -- Status
  is_linked_to_job boolean DEFAULT false,
  is_public boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  
  -- Processing Status
  processing_status text DEFAULT 'uploaded' CHECK (processing_status IN (
    'uploading',
    'uploaded',
    'processing',
    'ready',
    'failed'
  )),
  
  -- User Tracking
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photo_albums table
CREATE TABLE IF NOT EXISTS photo_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Album Information
  name text NOT NULL,
  description text,
  
  -- Relationships
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
  
  -- Album Settings
  cover_photo_id uuid, -- Will reference job_photos after creation
  photo_count integer DEFAULT 0,
  is_public boolean DEFAULT false,
  
  -- Sorting
  sort_order text DEFAULT 'date_desc' CHECK (sort_order IN (
    'date_asc',
    'date_desc',
    'name_asc',
    'name_desc',
    'manual'
  )),
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photo_album_items junction table
CREATE TABLE IF NOT EXISTS photo_album_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES photo_albums(id) ON DELETE CASCADE NOT NULL,
  photo_id uuid REFERENCES job_photos(id) ON DELETE CASCADE NOT NULL,
  
  -- Ordering
  sort_order integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  
  -- Unique constraint: each photo can only be in an album once
  UNIQUE(album_id, photo_id)
);

-- Create photo_annotations table (future feature - for drawing on photos)
CREATE TABLE IF NOT EXISTS photo_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid REFERENCES job_photos(id) ON DELETE CASCADE NOT NULL,
  
  -- Annotation Data (stored as JSON)
  annotation_type text CHECK (annotation_type IN (
    'arrow',
    'circle',
    'rectangle',
    'line',
    'text',
    'freehand',
    'measurement'
  )),
  annotation_data jsonb NOT NULL,
  -- Example structure:
  -- {
  --   "type": "arrow",
  --   "start": {"x": 100, "y": 150},
  --   "end": {"x": 200, "y": 250},
  --   "color": "#ff0000",
  --   "thickness": 2,
  --   "label": "Damage here"
  -- }
  
  -- Color and Style
  color text DEFAULT '#ff0000',
  thickness integer DEFAULT 2,
  label text,
  
  -- User Tracking
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_photos_organization ON job_photos(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_job ON job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_contact ON job_photos(contact_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_work_order ON job_photos(work_order_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_uploaded_by ON job_photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_job_photos_capture_date ON job_photos(capture_date DESC);
CREATE INDEX IF NOT EXISTS idx_job_photos_category ON job_photos(category);
CREATE INDEX IF NOT EXISTS idx_job_photos_tags ON job_photos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_job_photos_location ON job_photos(gps_latitude, gps_longitude) WHERE gps_latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_photos_linked ON job_photos(is_linked_to_job) WHERE is_linked_to_job = true;
CREATE INDEX IF NOT EXISTS idx_job_photos_gcs_path ON job_photos(gcs_bucket_name, gcs_file_path);

CREATE INDEX IF NOT EXISTS idx_photo_albums_organization ON photo_albums(organization_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_job ON photo_albums(job_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_work_order ON photo_albums(work_order_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_created_by ON photo_albums(created_by);

CREATE INDEX IF NOT EXISTS idx_photo_album_items_album ON photo_album_items(album_id);
CREATE INDEX IF NOT EXISTS idx_photo_album_items_photo ON photo_album_items(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_album_items_sort ON photo_album_items(album_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_photo_annotations_photo ON photo_annotations(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_annotations_type ON photo_annotations(annotation_type);

-- Enable Row Level Security
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_album_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_photos
CREATE POLICY "Users can view photos in their organization"
  ON job_photos FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos"
  ON job_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own photos"
  ON job_photos FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Uploaders and admins can delete photos"
  ON job_photos FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for photo_albums
CREATE POLICY "Users can view albums in their organization"
  ON photo_albums FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create albums"
  ON photo_albums FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators and admins can update albums"
  ON photo_albums FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Creators and admins can delete albums"
  ON photo_albums FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for photo_album_items
CREATE POLICY "Users can view album items in their organization"
  ON photo_album_items FOR SELECT
  TO authenticated
  USING (
    album_id IN (
      SELECT id FROM photo_albums
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage album items"
  ON photo_album_items FOR ALL
  TO authenticated
  USING (
    album_id IN (
      SELECT id FROM photo_albums
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for photo_annotations
CREATE POLICY "Users can view annotations in their organization"
  ON photo_annotations FOR SELECT
  TO authenticated
  USING (
    photo_id IN (
      SELECT id FROM job_photos
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create annotations"
  ON photo_annotations FOR INSERT
  TO authenticated
  WITH CHECK (
    photo_id IN (
      SELECT id FROM job_photos
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators and admins can update annotations"
  ON photo_annotations FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR photo_id IN (
      SELECT jp.id FROM job_photos jp
      JOIN organization_members om ON jp.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Creators and admins can delete annotations"
  ON photo_annotations FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR photo_id IN (
      SELECT jp.id FROM job_photos jp
      JOIN organization_members om ON jp.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Function to update album photo count
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_albums
    SET photo_count = photo_count + 1
    WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_albums
    SET photo_count = GREATEST(photo_count - 1, 0)
    WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update photo count
DROP TRIGGER IF EXISTS trigger_update_album_photo_count ON photo_album_items;
CREATE TRIGGER trigger_update_album_photo_count
  AFTER INSERT OR DELETE ON photo_album_items
  FOR EACH ROW
  EXECUTE FUNCTION update_album_photo_count();

-- Function to update job_photos updated_at
CREATE OR REPLACE FUNCTION update_photo_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps
DROP TRIGGER IF EXISTS trigger_update_photo_timestamp ON job_photos;
CREATE TRIGGER trigger_update_photo_timestamp
  BEFORE UPDATE ON job_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_timestamp();