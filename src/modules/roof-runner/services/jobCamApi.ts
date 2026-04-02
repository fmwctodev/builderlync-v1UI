import { apiService } from '../store/services/api';
import type {
  JobPhoto,
  JobCamTemplate,
  JobCamTemplateItem,
  JobReport,
  JobReportSection,
  JobMediaShareLink,
  JobMediaAuditLog,
  JobCamOverviewStats,
  JobMediaFilters,
  BulkUpdatePayload,
  CreateReportInput,
  CreateShareLinkInput,
  AuditAction,
  JobFile,
  ActivityEventType,
  JobActivityEvent,
  JobWithMediaSummary,
  UploadJobFileInput,
} from '../types/jobCam';

function mapMediaToJobPhoto(m: any): JobPhoto {
  return {
    ...m,
    id: String(m.id),
    capture_date: m.captured_at || m.created_at,
    user_id: m.uploaded_by_id || m.user_id,
    review_status: (m.processing_status === 'PROCESSED' ? 'approved' : 'pending') as any,
    is_claim_relevant: !!m.is_claim_relevant,
    is_customer_shareable: !!m.is_customer_shareable,
    is_marketing_approved: !!m.is_marketing_approved,
    is_hidden_from_timeline: !!m.is_hidden_from_timeline,
    category: m.category || null,
    phase: m.phase || null,
  };
}

export async function fetchJobCamOverviewStats(): Promise<JobCamOverviewStats> {
  const res = await apiService.getJobCamStats('all');
  const stats = res?.data || res;
  
  if (!stats) return {
    jobsWithMediaThisWeek: 0,
    jobsMissingRequiredShots: 0,
    pendingReviewCount: 0,
    reportsCreatedThisWeek: 0,
    totalPhotosThisWeek: 0,
  };

  return {
    jobsWithMediaThisWeek: 0,
    jobsMissingRequiredShots: 0,
    pendingReviewCount: stats.pending_review_count || 0,
    reportsCreatedThisWeek: 0,
    totalPhotosThisWeek: stats.total || 0,
  };
}

export async function fetchRecentJobActivity(limit = 20): Promise<JobPhoto[]> {
  const res = await apiService.getJobMedia('all', { limit });
  const items = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : (res || []));
  return items.map(mapMediaToJobPhoto);
}

export async function fetchJobMediaByJob(
  jobId: number,
  filters?: JobMediaFilters
): Promise<JobPhoto[]> {
  const res = await apiService.getJobMedia(jobId, filters);
  const items = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : (res || []));
  return items.map(mapMediaToJobPhoto);
}

export async function fetchAllJobPhotos(filters?: JobMediaFilters): Promise<JobPhoto[]> {
  const res = await apiService.getJobMedia('all', filters);
  const items = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : (res || []));
  return items.map(mapMediaToJobPhoto);
}

export async function fetchPhotoById(id: string): Promise<JobPhoto | null> {
  const res = await apiService.getJobMediaDetail(id);
  const data = res.data || res;
  return data ? mapMediaToJobPhoto(data) : null;
}

export async function uploadJobPhoto(
  _file: File,
  _jobId?: number,
  _metadata?: Partial<JobPhoto>
): Promise<JobPhoto> {
  throw new Error('Upload via backend API not fully implemented in web yet');
}

export async function updateJobPhoto(
  id: string,
  patch: Partial<JobPhoto>
): Promise<JobPhoto> {
  const res = await apiService.updateJobMedia(id, patch);
  const data = res.data || res;
  return mapMediaToJobPhoto(data);
}

export async function bulkUpdateJobPhotos(
  mediaIds: string[],
  patch: BulkUpdatePayload
): Promise<void> {
  await apiService.updateJobMedia('bulk-update', { mediaIds, updates: patch });
}

export async function deleteJobPhoto(id: string): Promise<void> {
  await apiService.deleteJobMedia(id);
}

export async function logAuditAction(
  _photoId: string,
  _action: AuditAction,
  _oldValue?: Record<string, unknown>,
  _newValue?: Record<string, unknown>,
  _notes?: string
): Promise<void> {
  // Not implemented in unified yet
}

export async function fetchAuditLog(_photoId: string): Promise<JobMediaAuditLog[]> {
  return [];
}

export async function fetchTemplates(_type?: string): Promise<JobCamTemplate[]> {
  return [];
}

export async function fetchTemplateById(_id: string): Promise<JobCamTemplate | null> {
  return null;
}

export async function createTemplate(_input: Partial<JobCamTemplate>): Promise<JobCamTemplate> {
  throw new Error('Templates via backend API not fully implemented');
}

export async function updateTemplate(_id: string, _patch: Partial<JobCamTemplate>): Promise<JobCamTemplate> {
  throw new Error('Templates via backend API not fully implemented');
}

export async function deleteTemplate(_id: string): Promise<void> {}

export async function upsertTemplateItems(_templateId: string, _items: Partial<JobCamTemplateItem>[]): Promise<void> {}

export async function fetchReports(_filters?: { jobId?: number; reportType?: string; status?: string; }): Promise<JobReport[]> {
  return [];
}

export async function fetchReportById(_id: string): Promise<JobReport | null> {
  return null;
}

export async function createReport(_input: CreateReportInput): Promise<JobReport> {
  throw new Error('Reports via backend API not fully implemented');
}

export async function updateReport(_id: string, _patch: Partial<JobReport>): Promise<JobReport> {
  throw new Error('Reports via backend API not fully implemented');
}

export async function deleteReport(_id: string): Promise<void> {}

export async function duplicateReport(_id: string): Promise<JobReport> {
  throw new Error('Reports via backend API not fully implemented');
}

export async function upsertReportSection(_section: Partial<JobReportSection> & { job_report_id: string }): Promise<JobReportSection> {
  throw new Error('Reports via backend API not fully implemented');
}

export async function deleteReportSection(_id: string): Promise<void> {}

export async function addMediaToReportSection(_reportId: string, _sectionId: string, _photoIds: string[]): Promise<void> {}

export async function updateReportMediaCaption(_id: string, _caption: string): Promise<void> {}

export async function removeMediaFromSection(_id: string): Promise<void> {}

export async function fetchShareLinks(_jobId?: number): Promise<JobMediaShareLink[]> {
  return [];
}

export async function createShareLink(_input: CreateShareLinkInput): Promise<JobMediaShareLink> {
  throw new Error('Share links via backend API not fully implemented');
}

export async function revokeShareLink(_id: string): Promise<void> {}

export async function fetchJobsWithMedia(): Promise<JobWithMediaSummary[]> {
  const response = await apiService.getJobsWithMedia();
  const items = response.data || [];
  return items.map((j: any) => ({
    ...j,
    latest_photo_date: j.latest_photo_date || null,
  }));
}

export async function fetchJobFiles(_jobId: number): Promise<JobFile[]> {
  return [];
}

export async function uploadJobFile(_file: File, _input: UploadJobFileInput): Promise<JobFile> {
  throw new Error('Files via backend API not fully implemented');
}

export async function deleteJobFile(_id: string): Promise<void> {}

export async function fetchJobActivity(_jobId: number, _limit = 50): Promise<JobActivityEvent[]> {
  return [];
}

export async function logJobActivity(
  _jobId: number,
  _eventType: ActivityEventType,
  _summary: string,
  _entityId?: string,
  _entityType?: string,
  _metadata?: Record<string, unknown>
): Promise<void> {}
