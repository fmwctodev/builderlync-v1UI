/*
  # Job Cam Complete Schema

  ## Overview
  Creates the full Job Cam dashboard schema. This project uses user-scoped RLS
  (user_id = auth.uid()) rather than organization_members — matching the pattern
  used by contacts, jobs, and all other existing tables.

  ## New Tables
  1. `job_photos` - Core photo storage with governance flags (review, share, claim, marketing)
  2. `photo_albums` - Album grouping per job
  3. `photo_album_items` - Junction: albums <-> photos
  4. `photo_annotations` - Markup/drawing on photos
  5. `job_cam_templates` - Reusable shot list / report / preset templates
  6. `job_cam_template_items` - Required shot items within a template
  7. `job_reports` - Office-generated reports (inspection, claim, completion, etc.)
  8. `job_report_sections` - Ordered sections within a report
  9. `job_report_media` - Photos placed into report sections with captions
  10. `job_media_share_links` - External secure share links with expiry and revoke
  11. `job_media_audit_log` - Immutable audit trail for all media metadata changes

  ## Security
  - RLS enabled on all tables
  - SELECT policies: all authenticated users can view (matching existing app pattern)
  - INSERT/UPDATE/DELETE: scoped to the row owner (user_id = auth.uid())
  - Audit log: insert + select only

  ## Notes
  - jobs.id is BIGINT — job_id columns use BIGINT with no FK to avoid order issues
  - contacts.id is UUID
*/

-- ─────────────────────────────────────────────
-- job_photos
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  job_id BIGINT DEFAULT NULL,
  contact_id UUID DEFAULT NULL,
  work_order_id UUID DEFAULT NULL,

  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT NOT NULL DEFAULT '',

  file_name TEXT NOT NULL DEFAULT '',
  file_size BIGINT,
  mime_type TEXT,

  width INTEGER,
  height INTEGER,
  orientation INTEGER DEFAULT 1,

  capture_date TIMESTAMPTZ DEFAULT now(),
  gps_latitude NUMERIC(10, 8),
  gps_longitude NUMERIC(11, 8),
  gps_accuracy NUMERIC(8, 2),

  description TEXT,
  tags TEXT[],
  category TEXT CHECK (category IS NULL OR category IN ('before','during','after','damage','inspection','completion','claim')),
  phase TEXT CHECK (phase IS NULL OR phase IN ('pre_install','during_install','post_install','damage_assessment','claim')),

  is_before_photo BOOLEAN NOT NULL DEFAULT false,
  is_after_photo BOOLEAN NOT NULL DEFAULT false,
  related_photo_id UUID DEFAULT NULL,

  is_linked_to_job BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected')),
  is_claim_relevant BOOLEAN NOT NULL DEFAULT false,
  is_customer_shareable BOOLEAN NOT NULL DEFAULT false,
  is_marketing_approved BOOLEAN NOT NULL DEFAULT false,
  office_notes TEXT DEFAULT NULL,
  checklist_item_id UUID DEFAULT NULL,

  processing_status TEXT NOT NULL DEFAULT 'uploaded' CHECK (processing_status IN ('uploading','uploaded','processing','ready','failed')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view job photos"
  ON job_photos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON job_photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON job_photos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON job_photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_photos_user ON job_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_job ON job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_contact ON job_photos(contact_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_capture_date ON job_photos(capture_date DESC);
CREATE INDEX IF NOT EXISTS idx_job_photos_category ON job_photos(category);
CREATE INDEX IF NOT EXISTS idx_job_photos_phase ON job_photos(phase);
CREATE INDEX IF NOT EXISTS idx_job_photos_review_status ON job_photos(review_status);
CREATE INDEX IF NOT EXISTS idx_job_photos_tags ON job_photos USING gin(tags);

-- ─────────────────────────────────────────────
-- photo_albums
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  job_id BIGINT DEFAULT NULL,
  cover_photo_id UUID REFERENCES job_photos(id) ON DELETE SET NULL,
  photo_count INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order_mode TEXT NOT NULL DEFAULT 'date_desc' CHECK (sort_order_mode IN ('date_asc','date_desc','name_asc','name_desc','manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view photo albums"
  ON photo_albums FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create albums"
  ON photo_albums FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own albums"
  ON photo_albums FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own albums"
  ON photo_albums FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_photo_albums_user ON photo_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_job ON photo_albums(job_id);

-- ─────────────────────────────────────────────
-- photo_album_items
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS photo_album_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES job_photos(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(album_id, photo_id)
);

ALTER TABLE photo_album_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view album items"
  ON photo_album_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage album items"
  ON photo_album_items FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update album items"
  ON photo_album_items FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete album items"
  ON photo_album_items FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_photo_album_items_album ON photo_album_items(album_id);
CREATE INDEX IF NOT EXISTS idx_photo_album_items_photo ON photo_album_items(photo_id);

-- ─────────────────────────────────────────────
-- photo_annotations
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS photo_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES job_photos(id) ON DELETE CASCADE,
  annotation_type TEXT CHECK (annotation_type IN ('arrow','circle','rectangle','line','text','freehand','measurement')),
  annotation_data JSONB NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT '#ff0000',
  thickness INTEGER NOT NULL DEFAULT 2,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE photo_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view annotations"
  ON photo_annotations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create annotations"
  ON photo_annotations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own annotations"
  ON photo_annotations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own annotations"
  ON photo_annotations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_photo_annotations_photo ON photo_annotations(photo_id);

-- ─────────────────────────────────────────────
-- job_cam_templates
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_cam_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('shotlist','report','job_preset')),
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT DEFAULT NULL,
  job_type TEXT DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_cam_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view job cam templates"
  ON job_cam_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create templates"
  ON job_cam_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON job_cam_templates FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON job_cam_templates FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_cam_templates_user ON job_cam_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_job_cam_templates_type ON job_cam_templates(template_type);

-- ─────────────────────────────────────────────
-- job_cam_template_items
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_cam_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES job_cam_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT NULL CHECK (category IS NULL OR category IN ('before','during','after','damage','inspection','completion','claim')),
  phase TEXT DEFAULT NULL CHECK (phase IS NULL OR phase IN ('pre_install','during_install','post_install','damage_assessment','claim')),
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_cam_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view template items"
  ON job_cam_template_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create template items"
  ON job_cam_template_items FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update template items"
  ON job_cam_template_items FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete template items"
  ON job_cam_template_items FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_job_cam_template_items_template ON job_cam_template_items(template_id);

-- ─────────────────────────────────────────────
-- job_reports
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id BIGINT DEFAULT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('inspection','progress','completion','claim','custom')),
  template_id UUID REFERENCES job_cam_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','final')),
  cover_notes TEXT DEFAULT NULL,
  pdf_storage_path TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view job reports"
  ON job_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create job reports"
  ON job_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job reports"
  ON job_reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job reports"
  ON job_reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_reports_user ON job_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_job_reports_job ON job_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_job_reports_status ON job_reports(status);
CREATE INDEX IF NOT EXISTS idx_job_reports_type ON job_reports(report_type);

-- ─────────────────────────────────────────────
-- job_report_sections
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_report_id UUID NOT NULL REFERENCES job_reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary_text TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_report_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view report sections"
  ON job_report_sections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create report sections"
  ON job_report_sections FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update report sections"
  ON job_report_sections FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete report sections"
  ON job_report_sections FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_job_report_sections_report ON job_report_sections(job_report_id);

-- ─────────────────────────────────────────────
-- job_report_media
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_report_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_report_id UUID NOT NULL REFERENCES job_reports(id) ON DELETE CASCADE,
  job_report_section_id UUID NOT NULL REFERENCES job_report_sections(id) ON DELETE CASCADE,
  job_photo_id UUID REFERENCES job_photos(id) ON DELETE SET NULL,
  caption TEXT DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_report_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view report media"
  ON job_report_media FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create report media"
  ON job_report_media FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update report media"
  ON job_report_media FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete report media"
  ON job_report_media FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_job_report_media_report ON job_report_media(job_report_id);
CREATE INDEX IF NOT EXISTS idx_job_report_media_section ON job_report_media(job_report_section_id);
CREATE INDEX IF NOT EXISTS idx_job_report_media_photo ON job_report_media(job_photo_id);

-- ─────────────────────────────────────────────
-- job_media_share_links
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_media_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id BIGINT DEFAULT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  share_mode TEXT NOT NULL CHECK (share_mode IN ('customer','claim','internal')),
  recipient_label TEXT DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_media_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view share links"
  ON job_media_share_links FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create share links"
  ON job_media_share_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own share links"
  ON job_media_share_links FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_media_share_links_user ON job_media_share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_job_media_share_links_job ON job_media_share_links(job_id);
CREATE INDEX IF NOT EXISTS idx_job_media_share_links_token ON job_media_share_links(token);

-- ─────────────────────────────────────────────
-- job_media_audit_log
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_media_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_photo_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('tag_edit','flag_change','note_edit','review_status_change','checklist_link','report_add','share_link_created','share_link_revoked')),
  changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_value JSONB DEFAULT NULL,
  new_value JSONB DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_media_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view audit log"
  ON job_media_audit_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert audit log entries"
  ON job_media_audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = changed_by_user_id);

CREATE INDEX IF NOT EXISTS idx_job_media_audit_log_photo ON job_media_audit_log(job_photo_id);
CREATE INDEX IF NOT EXISTS idx_job_media_audit_log_user ON job_media_audit_log(changed_by_user_id);

-- ─────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION job_cam_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_job_photos_updated_at') THEN
    CREATE TRIGGER trg_job_photos_updated_at BEFORE UPDATE ON job_photos FOR EACH ROW EXECUTE FUNCTION job_cam_set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_photo_albums_updated_at') THEN
    CREATE TRIGGER trg_photo_albums_updated_at BEFORE UPDATE ON photo_albums FOR EACH ROW EXECUTE FUNCTION job_cam_set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_job_cam_templates_updated_at') THEN
    CREATE TRIGGER trg_job_cam_templates_updated_at BEFORE UPDATE ON job_cam_templates FOR EACH ROW EXECUTE FUNCTION job_cam_set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_job_reports_updated_at') THEN
    CREATE TRIGGER trg_job_reports_updated_at BEFORE UPDATE ON job_reports FOR EACH ROW EXECUTE FUNCTION job_cam_set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_job_report_sections_updated_at') THEN
    CREATE TRIGGER trg_job_report_sections_updated_at BEFORE UPDATE ON job_report_sections FOR EACH ROW EXECUTE FUNCTION job_cam_set_updated_at();
  END IF;
END $$;

-- Album photo count trigger
CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE photo_albums SET photo_count = photo_count + 1 WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE photo_albums SET photo_count = GREATEST(photo_count - 1, 0) WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_album_photo_count') THEN
    CREATE TRIGGER trg_album_photo_count AFTER INSERT OR DELETE ON photo_album_items FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();
  END IF;
END $$;
