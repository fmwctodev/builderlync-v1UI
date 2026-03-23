import { supabase } from '../../../shared/lib/supabase';
import type {
  JobPhoto,
  JobCamTemplate,
  JobCamTemplateItem,
  JobReport,
  JobReportSection,
  JobReportMedia,
  JobMediaShareLink,
  JobMediaAuditLog,
  JobCamOverviewStats,
  JobMediaFilters,
  BulkUpdatePayload,
  CreateReportInput,
  CreateShareLinkInput,
  AuditAction,
} from '../types/jobCam';

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export async function fetchJobCamOverviewStats(): Promise<JobCamOverviewStats> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [photosRes, reportsRes, pendingRes] = await Promise.all([
    supabase!.from('job_photos').select('job_id').gte('created_at', weekAgo),
    supabase!.from('job_reports').select('id').gte('created_at', weekAgo),
    supabase!.from('job_photos').select('id', { count: 'exact', head: true }).eq('review_status', 'pending'),
  ]);

  const photosThisWeek = photosRes.data ?? [];
  const uniqueJobIds = new Set(photosThisWeek.map((p: { job_id: number | null }) => p.job_id).filter(Boolean));

  return {
    jobsWithMediaThisWeek: uniqueJobIds.size,
    jobsMissingRequiredShots: 0,
    pendingReviewCount: pendingRes.count ?? 0,
    reportsCreatedThisWeek: reportsRes.data?.length ?? 0,
    totalPhotosThisWeek: photosThisWeek.length,
  };
}

export async function fetchRecentJobActivity(limit = 20): Promise<JobPhoto[]> {
  const { data, error } = await supabase!
    .from('job_photos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as JobPhoto[];
}

export async function fetchJobMediaByJob(
  jobId: number,
  filters?: JobMediaFilters
): Promise<JobPhoto[]> {
  let query = supabase!
    .from('job_photos')
    .select('*')
    .eq('job_id', jobId)
    .order('capture_date', { ascending: false });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.phase) query = query.eq('phase', filters.phase);
  if (filters?.reviewStatus) query = query.eq('review_status', filters.reviewStatus);
  if (filters?.isClaimRelevant !== undefined) query = query.eq('is_claim_relevant', filters.isClaimRelevant);
  if (filters?.isCustomerShareable !== undefined) query = query.eq('is_customer_shareable', filters.isCustomerShareable);
  if (filters?.isMarketingApproved !== undefined) query = query.eq('is_marketing_approved', filters.isMarketingApproved);
  if (filters?.dateFrom) query = query.gte('capture_date', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('capture_date', filters.dateTo);
  if (filters?.search) query = query.ilike('description', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as JobPhoto[];
}

export async function fetchAllJobPhotos(filters?: JobMediaFilters): Promise<JobPhoto[]> {
  let query = supabase!
    .from('job_photos')
    .select('*')
    .order('capture_date', { ascending: false });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.phase) query = query.eq('phase', filters.phase);
  if (filters?.reviewStatus) query = query.eq('review_status', filters.reviewStatus);
  if (filters?.isClaimRelevant !== undefined) query = query.eq('is_claim_relevant', filters.isClaimRelevant);
  if (filters?.isCustomerShareable !== undefined) query = query.eq('is_customer_shareable', filters.isCustomerShareable);
  if (filters?.isMarketingApproved !== undefined) query = query.eq('is_marketing_approved', filters.isMarketingApproved);
  if (filters?.dateFrom) query = query.gte('capture_date', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('capture_date', filters.dateTo);
  if (filters?.search) query = query.ilike('description', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as JobPhoto[];
}

export async function fetchPhotoById(id: string): Promise<JobPhoto | null> {
  const { data, error } = await supabase!
    .from('job_photos')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as JobPhoto | null;
}

export async function uploadJobPhoto(
  file: File,
  jobId?: number,
  metadata?: Partial<JobPhoto>
): Promise<JobPhoto> {
  const userId = await getCurrentUserId();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase!.storage
    .from('job-photos')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase!.storage
    .from('job-photos')
    .getPublicUrl(fileName);

  const { data, error } = await supabase!
    .from('job_photos')
    .insert({
      user_id: userId,
      job_id: jobId ?? null,
      file_url: publicUrl,
      storage_path: fileName,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      ...metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data as JobPhoto;
}

export async function updateJobPhoto(
  id: string,
  patch: Partial<JobPhoto>
): Promise<JobPhoto> {
  const { data, error } = await supabase!
    .from('job_photos')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as JobPhoto;
}

export async function bulkUpdateJobPhotos(
  photoIds: string[],
  patch: BulkUpdatePayload
): Promise<void> {
  const { error } = await supabase!
    .from('job_photos')
    .update(patch)
    .in('id', photoIds);
  if (error) throw error;
}

export async function deleteJobPhoto(id: string): Promise<void> {
  const { error } = await supabase!.from('job_photos').delete().eq('id', id);
  if (error) throw error;
}

export async function logAuditAction(
  photoId: string,
  action: AuditAction,
  oldValue?: Record<string, unknown>,
  newValue?: Record<string, unknown>,
  notes?: string
): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase!.from('job_media_audit_log').insert({
    job_photo_id: photoId,
    action,
    changed_by_user_id: userId,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
    notes: notes ?? null,
  });
  if (error) throw error;
}

export async function fetchAuditLog(photoId: string): Promise<JobMediaAuditLog[]> {
  const { data, error } = await supabase!
    .from('job_media_audit_log')
    .select('*')
    .eq('job_photo_id', photoId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as JobMediaAuditLog[];
}

export async function fetchTemplates(type?: string): Promise<JobCamTemplate[]> {
  let query = supabase!
    .from('job_cam_templates')
    .select('*, items:job_cam_template_items(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (type) query = query.eq('template_type', type);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as JobCamTemplate[];
}

export async function fetchTemplateById(id: string): Promise<JobCamTemplate | null> {
  const { data, error } = await supabase!
    .from('job_cam_templates')
    .select('*, items:job_cam_template_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as JobCamTemplate | null;
}

export async function createTemplate(
  input: Partial<JobCamTemplate>
): Promise<JobCamTemplate> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase!
    .from('job_cam_templates')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as JobCamTemplate;
}

export async function updateTemplate(
  id: string,
  patch: Partial<JobCamTemplate>
): Promise<JobCamTemplate> {
  const { data, error } = await supabase!
    .from('job_cam_templates')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as JobCamTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase!
    .from('job_cam_templates')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

export async function upsertTemplateItems(
  templateId: string,
  items: Partial<JobCamTemplateItem>[]
): Promise<void> {
  await supabase!.from('job_cam_template_items').delete().eq('template_id', templateId);
  if (items.length === 0) return;
  const { error } = await supabase!.from('job_cam_template_items').insert(
    items.map((item, i) => ({ ...item, template_id: templateId, sort_order: i }))
  );
  if (error) throw error;
}

export async function fetchReports(filters?: {
  jobId?: number;
  reportType?: string;
  status?: string;
}): Promise<JobReport[]> {
  let query = supabase!
    .from('job_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.jobId) query = query.eq('job_id', filters.jobId);
  if (filters?.reportType) query = query.eq('report_type', filters.reportType);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as JobReport[];
}

export async function fetchReportById(id: string): Promise<JobReport | null> {
  const { data: report, error: rErr } = await supabase!
    .from('job_reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (rErr) throw rErr;
  if (!report) return null;

  const { data: sections, error: sErr } = await supabase!
    .from('job_report_sections')
    .select('*')
    .eq('job_report_id', id)
    .order('sort_order', { ascending: true });
  if (sErr) throw sErr;

  const sectionsWithMedia = await Promise.all(
    (sections ?? []).map(async (section: JobReportSection) => {
      const { data: media } = await supabase!
        .from('job_report_media')
        .select('*, photo:job_photo_id(*)')
        .eq('job_report_section_id', section.id)
        .order('sort_order', { ascending: true });
      return { ...section, media: media ?? [] };
    })
  );

  return { ...(report as JobReport), sections: sectionsWithMedia };
}

export async function createReport(input: CreateReportInput): Promise<JobReport> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase!
    .from('job_reports')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as JobReport;
}

export async function updateReport(
  id: string,
  patch: Partial<JobReport>
): Promise<JobReport> {
  const { data, error } = await supabase!
    .from('job_reports')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as JobReport;
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase!.from('job_reports').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateReport(id: string): Promise<JobReport> {
  const original = await fetchReportById(id);
  if (!original) throw new Error('Report not found');

  const newReport = await createReport({
    job_id: original.job_id ?? undefined,
    report_type: original.report_type,
    title: `${original.title} (Copy)`,
    template_id: original.template_id ?? undefined,
    cover_notes: original.cover_notes ?? undefined,
  });

  if (original.sections) {
    for (const section of original.sections) {
      const { data: newSection } = await supabase!
        .from('job_report_sections')
        .insert({
          job_report_id: newReport.id,
          title: section.title,
          summary_text: section.summary_text,
          sort_order: section.sort_order,
        })
        .select()
        .single();

      if (newSection && section.media) {
        for (const m of section.media) {
          await supabase!.from('job_report_media').insert({
            job_report_id: newReport.id,
            job_report_section_id: (newSection as JobReportSection).id,
            job_photo_id: m.job_photo_id,
            caption: m.caption,
            sort_order: m.sort_order,
          });
        }
      }
    }
  }

  return newReport;
}

export async function upsertReportSection(
  section: Partial<JobReportSection> & { job_report_id: string }
): Promise<JobReportSection> {
  if (section.id) {
    const { data, error } = await supabase!
      .from('job_report_sections')
      .update(section)
      .eq('id', section.id)
      .select()
      .single();
    if (error) throw error;
    return data as JobReportSection;
  }
  const { data, error } = await supabase!
    .from('job_report_sections')
    .insert(section)
    .select()
    .single();
  if (error) throw error;
  return data as JobReportSection;
}

export async function deleteReportSection(id: string): Promise<void> {
  const { error } = await supabase!.from('job_report_sections').delete().eq('id', id);
  if (error) throw error;
}

export async function addMediaToReportSection(
  reportId: string,
  sectionId: string,
  photoIds: string[]
): Promise<void> {
  const { data: existing } = await supabase!
    .from('job_report_media')
    .select('sort_order')
    .eq('job_report_section_id', sectionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const startOrder = existing?.[0]?.sort_order ?? -1;
  const rows = photoIds.map((photoId, i) => ({
    job_report_id: reportId,
    job_report_section_id: sectionId,
    job_photo_id: photoId,
    sort_order: startOrder + 1 + i,
  }));

  const { error } = await supabase!.from('job_report_media').insert(rows);
  if (error) throw error;
}

export async function updateReportMediaCaption(
  id: string,
  caption: string
): Promise<void> {
  const { error } = await supabase!
    .from('job_report_media')
    .update({ caption })
    .eq('id', id);
  if (error) throw error;
}

export async function removeMediaFromSection(id: string): Promise<void> {
  const { error } = await supabase!.from('job_report_media').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchShareLinks(jobId?: number): Promise<JobMediaShareLink[]> {
  let query = supabase!
    .from('job_media_share_links')
    .select('*')
    .order('created_at', { ascending: false });

  if (jobId) query = query.eq('job_id', jobId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as JobMediaShareLink[];
}

export async function createShareLink(
  input: CreateShareLinkInput
): Promise<JobMediaShareLink> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase!
    .from('job_media_share_links')
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as JobMediaShareLink;
}

export async function revokeShareLink(id: string): Promise<void> {
  const { error } = await supabase!
    .from('job_media_share_links')
    .update({ is_revoked: true })
    .eq('id', id);
  if (error) throw error;
}
