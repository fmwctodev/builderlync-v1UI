import axios from 'axios';
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

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3202/api').replace(/\/api$/, '');
const GCS_BUCKET_URL = `https://storage.googleapis.com/builderlync-test`;

function getFullUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's already an absolute URL, just ensure it's encoded for spaces
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url.replace(/ /g, '%20');
  }
  
  // Encode the relative path
  const encodedPath = url.split('/').map(segment => encodeURIComponent(segment)).join('/');
  
  // High confidence prefixes for GCS
  if (url.startsWith('documents/') || url.startsWith('staff-images/') || url.startsWith('job-cam/')) {
    return `${GCS_BUCKET_URL}/${encodedPath}`;
  }
  
  // Fallback to local static
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  const encodedCleanPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${API_ROOT}/static/${encodedCleanPath}`;
}

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
    file_url: getFullUrl(m.file_url),
    thumbnail_url: m.thumbnail_url ? getFullUrl(m.thumbnail_url) : getFullUrl(m.file_url),
  };
}

function mapDocumentToJobFile(doc: any): JobFile {
  return {
    id: `doc_${doc.id}`,
    user_id: String(doc.created_by_id || doc.user_id || ''),
    job_id: Number(doc.job_id),
    file_url: getFullUrl(doc.file_url || doc.file_path),
    storage_path: doc.storage_path || '',
    file_name: doc.title || doc.file_name || doc.filename || 'Untitled Document',
    file_size: doc.file_size || null,
    mime_type: doc.mime_type || (doc.file_url?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
    category: doc.category || 'other',
    description: doc.body || doc.description,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

function mapAttachmentToJobFile(a: any): JobFile {
  return {
    id: `att_${a.id}`,
    user_id: String(a.created_by),
    job_id: Number(a.job_id),
    file_url: getFullUrl(a.file_url),
    storage_path: '',
    file_name: a.file_name || 'Untitled File',
    file_size: a.file_size,
    mime_type: null,
    category: (a.category as any) || 'other',
    description: a.description,
    created_at: a.created_at,
    updated_at: a.updated_at,
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
  file: File,
  jobId: number,
  metadata?: Partial<JobPhoto>,
  onProgress?: (progress: number) => void
): Promise<JobPhoto> {
  // 1. Create upload session
  const session = await apiService.createUploadSession(jobId, {
    file_name: file.name,
    mime_type: file.type,
    category: metadata?.category || 'other',
    phase: metadata?.phase || null,
    is_claim_relevant: !!metadata?.is_claim_relevant,
    is_customer_shareable: !!metadata?.is_customer_shareable
  });

  const { mediaId, uploadUrl, storageKey } = session;

  // 2. Upload file directly to signed URL
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
      'x-upsert': 'true'
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      }
    }
  });

  // 3. Finalize upload
  const res = await apiService.finalizeUpload({
    mediaId,
    storageKey
  });

  return mapMediaToJobPhoto(res.data || res);
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
  await apiService.bulkUpdateJobMedia(mediaIds, patch);
}

export async function bulkDeleteJobPhotos(mediaIds: string[]): Promise<void> {
  await apiService.bulkDeleteJobMedia(mediaIds);
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

export async function fetchTemplates(type?: string): Promise<JobCamTemplate[]> {
  const res = await apiService.getJobCamTemplates(type);
  const data = res.data?.data || res.data || res || [];
  return Array.isArray(data) ? data : [];
}

export async function fetchTemplateById(id: string): Promise<JobCamTemplate | null> {
  const res = await apiService.getJobCamTemplateDetail(id);
  return res.data?.data || res.data || res;
}

export async function createTemplate(input: Partial<JobCamTemplate>): Promise<JobCamTemplate> {
  const res = await apiService.createJobCamTemplate(input);
  return res.data?.data || res.data || res;
}

export async function updateTemplate(id: string, patch: Partial<JobCamTemplate>): Promise<JobCamTemplate> {
  const res = await apiService.updateJobCamTemplate(id, patch);
  return res.data?.data || res.data || res;
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiService.deleteJobCamTemplate(id);
}

export async function upsertTemplateItems(templateId: string, items: Partial<JobCamTemplateItem>[]): Promise<void> {
  await apiService.upsertJobCamTemplateItems(templateId, items);
}

export async function fetchJobShotlist(jobId: number): Promise<any> {
  const res = await apiService.getJobShotlist(jobId);
  return res.data?.data || res.data || res;
}

export async function createJobShotlist(jobId: number, name: string, templateId?: string): Promise<any> {
  const res = await apiService.createJobShotlist(jobId, { name, templateId });
  return res.data?.data || res.data || res;
}

export async function updateShotlistItem(itemId: string, updates: any): Promise<any> {
  const res = await apiService.updateShotlistItem(itemId, updates);
  return res.data?.data || res.data || res;
}

export async function addItemToShotlist(shotlistId: string, item: any): Promise<any> {
  const res = await apiService.addItemToShotlist(shotlistId, item);
  return res.data?.data || res.data || res;
}

export async function deleteShotlistItem(itemId: string): Promise<any> {
  const res = await apiService.deleteShotlistItem(itemId);
  return res.data?.data || res.data || res;
}

export async function reorderShotlistItems(items: { id: string; sort_order: number }[]): Promise<any> {
  const res = await apiService.reorderShotlistItems(items);
  return res.data?.data || res.data || res;
}


export async function fetchReports(filters?: { jobId?: number; reportType?: string; status?: string; }): Promise<JobReport[]> {
  const res = await apiService.getJobReports(filters?.jobId || 'all');
  return res.data || res || [];
}

export async function fetchReportById(id: string): Promise<JobReport | null> {
  const res = await apiService.getJobReportDetail(id);
  return res.data || res || null;
}

export async function createReport(input: CreateReportInput): Promise<JobReport> {
  const res = await apiService.createJobReport(input);
  return res.data || res;
}

export async function updateReport(id: string, patch: Partial<JobReport>): Promise<JobReport> {
  const res = await apiService.updateJobReport(id, patch);
  return res.data || res;
}

export async function deleteReport(id: string): Promise<void> {
  await apiService.deleteJobReport(id);
}

export async function duplicateReport(id: string): Promise<JobReport> {
  const res = await apiService.duplicateJobReport(id);
  return res.data || res;
}

export async function upsertReportSection(section: Partial<JobReportSection> & { job_report_id: string }): Promise<JobReportSection> {
  const res = await apiService.upsertJobReportSection(section);
  return res.data || res;
}

export async function deleteReportSection(id: string): Promise<void> {
  await apiService.deleteJobReportSection(id);
}

export async function addMediaToReportSection(_reportId: string, _sectionId: string, _photoIds: string[]): Promise<void> {
  // Not fully implemented on backend yet as items are usually upserted via report detail save
}

export async function updateReportMediaCaption(_id: string, _caption: string): Promise<void> { }

export async function removeMediaFromSection(_id: string): Promise<void> { }

export async function fetchShareLinks(jobId?: number): Promise<JobMediaShareLink[]> {
  const res = await apiService.getJobShareLinks(jobId || 'all');
  return res.data || res || [];
}

export async function createShareLink(input: CreateShareLinkInput): Promise<JobMediaShareLink> {
  const res = await apiService.createJobShareLink(input);
  return res.data || res;
}

export async function revokeShareLink(id: string): Promise<void> {
  await apiService.revokeJobShareLink(id);
}

export async function fetchJobsWithMedia(): Promise<JobWithMediaSummary[]> {
  const response = await apiService.getJobsWithMedia();
  const items = response.data || [];
  return items.map((j: any) => ({
    ...j,
    latest_photo_date: j.latest_photo_date || null,
  }));
}

export async function fetchJobFiles(jobId: number): Promise<JobFile[]> {
  const [docs, attachments] = await Promise.all([
    apiService.getJobDocuments(jobId),
    apiService.getJobAttachments(jobId)
  ]);

  const docList = Array.isArray(docs.data) ? docs.data : (Array.isArray(docs) ? docs : []);
  const attachList = Array.isArray(attachments.data) ? attachments.data : (Array.isArray(attachments) ? attachments : []);

  const mappedDocs = docList.map(mapDocumentToJobFile);
  const mappedAttaches = attachList.map(mapAttachmentToJobFile);

  return [...mappedDocs, ...mappedAttaches].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function uploadJobFile(file: File, input: UploadJobFileInput): Promise<JobFile> {
  // 1. Upload binary to local storage/cloud
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', input.description || '');
  formData.append('cloudProvider', 'local');

  const uploadRes = await apiService.uploadDocumentFile(formData);
  const data = uploadRes.data || uploadRes;
  const { file_path, original_filename, file_size } = data;

  // 2. Link to job as attachment
  const attachment = await apiService.createJobAttachment(input.job_id, {
    file_name: original_filename || file.name,
    file_url: file_path,
    file_size: file_size || file.size,
    category: input.category
  });

  return mapAttachmentToJobFile(attachment.data || attachment);
}

export async function deleteJobFile(id: string, jobId: number): Promise<void> {
  if (id.startsWith('doc_')) {
    await apiService.deleteJobDocument(id.replace('doc_', ''));
  } else if (id.startsWith('att_')) {
    await apiService.deleteJobAttachment(jobId, id.replace('att_', ''));
  }
}

export function getJobFileDownloadUrl(id: string, jobId: number): string {
  if (id.startsWith('doc_')) {
    return apiService.downloadJobDocument(id.replace('doc_', ''));
  } else if (id.startsWith('att_')) {
    return apiService.downloadJobAttachment(jobId, id.replace('att_', ''));
  }
  return '';
}

export async function fetchJobActivity(jobId: number, _limit = 50): Promise<JobActivityEvent[]> {
  const res = await apiService.getJobActivity(jobId);
  return res.data || res || [];
}

export async function logJobActivity(
  _jobId: number,
  _eventType: ActivityEventType,
  _summary: string,
  _entityId?: string,
  _entityType?: string,
  _metadata?: Record<string, unknown>
): Promise<void> { }

export async function fetchJobGalleries(jobId: number): Promise<any[]> {
  const res = await apiService.getJobGalleries(jobId);
  return res.data || res || [];
}

export async function createJobGallery(jobId: number, data: { name: string; description?: string }): Promise<any> {
  const res = await apiService.createJobGallery(jobId, data);
  return res.data || res;
}

export async function deleteJobGallery(galleryId: string): Promise<void> {
  await apiService.deleteJobGallery(galleryId);
}

export async function fetchGalleryItems(galleryId: string): Promise<any[]> {
  const res = await apiService.getGalleryItems(galleryId);
  return res.data || res || [];
}

export async function addMediaToGallery(galleryId: string, mediaIds: string[]): Promise<void> {
  await apiService.addMediaToGallery(galleryId, mediaIds);
}

export async function removeMediaFromGallery(galleryId: string, mediaId: string): Promise<void> {
  await apiService.removeMediaFromGallery(galleryId, mediaId);
}

export async function fetchPublicShareDetails(token: string): Promise<any> {
  const res = await apiService.getPublicShareDetails(token);
  const data = res.data || res;
  if (data.media) {
    data.media = data.media.map(mapMediaToJobPhoto);
  }
  return data;
}
