export type PhotoCategory = 'before' | 'during' | 'after' | 'damage' | 'inspection' | 'completion' | 'claim';
export type PhotoPhase = 'pre_install' | 'during_install' | 'post_install' | 'damage_assessment' | 'claim';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ProcessingStatus = 'uploading' | 'uploaded' | 'processing' | 'ready' | 'failed';
export type TemplateType = 'shotlist' | 'report' | 'job_preset';
export type ReportType = 'inspection' | 'progress' | 'completion' | 'claim' | 'custom';
export type ReportStatus = 'draft' | 'final';
export type ShareMode = 'customer' | 'claim' | 'internal' | 'gallery' | 'timeline' | 'single_photo' | 'report';
export type AuditAction =
  | 'tag_edit'
  | 'flag_change'
  | 'note_edit'
  | 'review_status_change'
  | 'checklist_link'
  | 'report_add'
  | 'share_link_created'
  | 'share_link_revoked'
  | 'photo_uploaded'
  | 'photo_deleted'
  | 'file_uploaded'
  | 'file_deleted'
  | 'report_created'
  | 'report_finalized';

export type ActivityEventType =
  | 'photo_uploaded'
  | 'photo_deleted'
  | 'photo_tagged'
  | 'photo_reviewed'
  | 'checklist_completed'
  | 'report_created'
  | 'report_finalized'
  | 'file_uploaded'
  | 'file_deleted'
  | 'share_link_created'
  | 'share_link_revoked'
  | 'note_added'
  | 'bulk_update';

export type JobFileCategory = 'contract' | 'permit' | 'invoice' | 'inspection' | 'insurance' | 'warranty' | 'other';

export interface JobPhoto {
  id: string;
  user_id: string;
  job_id: number | null;
  contact_id: string | null;
  work_order_id: string | null;
  file_url: string;
  thumbnail_url: string | null;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  orientation: number;
  capture_date: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy: number | null;
  description: string | null;
  tags: string[] | null;
  category: PhotoCategory | null;
  phase: PhotoPhase | null;
  is_before_photo: boolean;
  is_after_photo: boolean;
  related_photo_id: string | null;
  is_linked_to_job: boolean;
  is_public: boolean;
  is_featured: boolean;
  review_status: ReviewStatus;
  is_claim_relevant: boolean;
  is_customer_shareable: boolean;
  is_marketing_approved: boolean;
  office_notes: string | null;
  checklist_item_id: string | null;
  is_hidden_from_timeline: boolean;
  processing_status: ProcessingStatus;
  created_at: string;
  updated_at: string;
  job_name?: string;
  contact_name?: string;
  uploader_email?: string;
}

export interface PhotoAlbum {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  job_id: number | null;
  cover_photo_id: string | null;
  photo_count: number;
  is_public: boolean;
  sort_order_mode: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface JobCamTemplate {
  id: string;
  user_id: string;
  template_type: TemplateType;
  name: string;
  description: string | null;
  service_type: string | null;
  job_type: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  items?: JobCamTemplateItem[];
}

export interface JobCamTemplateItem {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  category: PhotoCategory | null;
  phase: PhotoPhase | null;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  completed?: boolean;
  linked_photo?: JobPhoto | null;
}

export interface JobReport {
  id: string;
  user_id: string;
  job_id: number | null;
  report_type: ReportType;
  template_id: string | null;
  title: string;
  status: ReportStatus;
  cover_notes: string | null;
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
  sections?: JobReportSection[];
  job_name?: string;
  creator_email?: string;
}

export interface JobReportSection {
  id: string;
  job_report_id: string;
  title: string;
  summary_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  media?: JobReportMedia[];
}

export interface JobReportMedia {
  id: string;
  job_report_id: string;
  job_report_section_id: string;
  job_photo_id: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
  photo?: JobPhoto;
}

export interface JobMediaShareLink {
  id: string;
  user_id: string;
  job_id: number | null;
  token: string;
  share_mode: ShareMode;
  recipient_label: string | null;
  expires_at: string | null;
  is_revoked: boolean;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
  job_name?: string;
}

export interface JobMediaAuditLog {
  id: string;
  job_photo_id: string;
  action: AuditAction;
  changed_by_user_id: string | null;
  user_email?: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
}

export interface JobCamOverviewStats {
  jobsWithMediaThisWeek: number;
  jobsMissingRequiredShots: number;
  pendingReviewCount: number;
  reportsCreatedThisWeek: number;
  totalPhotosThisWeek: number;
}

export interface ChecklistReviewItem {
  templateItem: JobCamTemplateItem;
  linkedPhotos: JobPhoto[];
  status: 'complete' | 'needs_review' | 'missing';
  assignedTo: string | null;
}

export interface JobMediaFilters {
  uploader?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  category?: PhotoCategory;
  phase?: PhotoPhase;
  reviewStatus?: ReviewStatus;
  isClaimRelevant?: boolean;
  isCustomerShareable?: boolean;
  isMarketingApproved?: boolean;
  search?: string;
}

export interface BulkUpdatePayload {
  tags?: string[];
  category?: PhotoCategory;
  phase?: PhotoPhase;
  review_status?: ReviewStatus;
  is_claim_relevant?: boolean;
  is_customer_shareable?: boolean;
  is_marketing_approved?: boolean;
  is_hidden_from_timeline?: boolean;
  office_notes?: string;
}

export interface JobFile {
  id: string;
  user_id: string;
  job_id: number;
  file_url: string;
  storage_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  category: JobFileCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
  uploader_email?: string;
}

export interface JobActivityEvent {
  id: string;
  job_id: number;
  event_type: ActivityEventType;
  user_id: string;
  entity_id: string | null;
  entity_type: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_email?: string;
}

export interface JobWithMediaSummary {
  id: number;
  name: string;
  location: string | null;
  contact_name: string | null;
  status: string;
  photo_count: number;
  pending_review_count: number;
  latest_photo_date: string | null;
  latest_photo_url: string | null;
  checklist_progress: number | null;
}

export interface CreateReportInput {
  job_id?: number;
  report_type: ReportType;
  title: string;
  template_id?: string;
  cover_notes?: string;
}

export interface CreateShareLinkInput {
  job_id?: number;
  share_mode: ShareMode;
  recipient_label?: string;
  expires_at?: string;
  photo_ids?: string[];
  report_id?: string;
}

export interface UploadJobFileInput {
  job_id: number;
  category: JobFileCategory;
  description?: string;
}
