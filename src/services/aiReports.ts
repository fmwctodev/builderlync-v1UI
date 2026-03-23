import { supabase } from '../shared/lib/supabase';
import type {
  AIReport,
  AIReportFilters,
  AIReportStats,
  GenerateReportRequest,
  GenerateReportResponse,
  CATEGORY_LABELS,
} from '../types/aiReports';
import { CATEGORY_LABELS as LABELS } from '../types/aiReports';

export async function generateReport(
  organizationId: string,
  _userId: string,
  request: GenerateReportRequest
): Promise<GenerateReportResponse> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-report-generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        prompt: request.prompt,
        scope: request.scope,
        timeframe: request.timeframe,
        parent_report_id: request.parent_report_id ?? null,
        organization_id: organizationId,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    return { success: false, report_id: '', error: err?.error?.message ?? 'Failed to start report generation' };
  }

  const result = await response.json();
  return result;
}

export async function getAIReports(
  organizationId: string,
  filters?: AIReportFilters
): Promise<AIReport[]> {
  let query = supabase
    .from('ai_reports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (filters?.category) query = query.eq('report_category', filters.category);
  if (filters?.scope) query = query.eq('scope', filters.scope);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.search) query = query.ilike('report_name', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AIReport[];
}

export async function getAIReportById(reportId: string): Promise<AIReport | null> {
  const { data, error } = await supabase
    .from('ai_reports')
    .select('*')
    .eq('id', reportId)
    .maybeSingle();

  if (error) throw error;
  return data as AIReport | null;
}

export async function getReportVersions(reportId: string): Promise<AIReport[]> {
  const report = await getAIReportById(reportId);
  if (!report) return [];

  const rootId = report.parent_report_id ?? report.id;

  const { data, error } = await supabase
    .from('ai_reports')
    .select('*')
    .or(`id.eq.${rootId},parent_report_id.eq.${rootId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as AIReport[];
}

export async function duplicateReport(reportId: string, userId: string): Promise<AIReport> {
  const original = await getAIReportById(reportId);
  if (!original) throw new Error('Report not found');

  const { id, created_at, updated_at, delete_at, ...fields } = original;

  const { data, error } = await supabase
    .from('ai_reports')
    .insert({
      ...fields,
      report_name: `${original.report_name} (Copy)`,
      created_by_user_id: userId,
      parent_report_id: null,
      status: original.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AIReport;
}

export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_reports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
}

export async function getAIReportStats(organizationId: string): Promise<AIReportStats> {
  const [totalRes, runningRes, scheduledRes, lastRes] = await Promise.all([
    supabase
      .from('ai_reports')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    supabase
      .from('ai_reports')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'running'),
    supabase
      .from('ai_report_schedules')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true),
    supabase
      .from('ai_reports')
      .select('created_at')
      .eq('organization_id', organizationId)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    totalReports: totalRes.count ?? 0,
    runningReports: runningRes.count ?? 0,
    scheduledReports: scheduledRes.count ?? 0,
    lastGeneratedDate: (lastRes.data as { created_at: string } | null)?.created_at ?? null,
  };
}

export async function pollReportStatus(
  reportId: string,
  onUpdate?: (report: AIReport) => void,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<AIReport> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = async () => {
      try {
        const report = await getAIReportById(reportId);
        if (!report) {
          reject(new Error('Report not found'));
          return;
        }

        if (onUpdate) onUpdate(report);

        if (report.status === 'complete' || report.status === 'failed') {
          resolve(report);
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Report generation timed out'));
          return;
        }

        setTimeout(poll, intervalMs);
      } catch (err) {
        reject(err);
      }
    };

    poll();
  });
}

export function getReportCategoryLabel(category: string): string {
  return LABELS[category] ?? 'Custom';
}

export function getScopeLabel(scope: string): string {
  const map: Record<string, string> = {
    my: 'My Data',
    team: 'Team',
    org: 'Organization',
  };
  return map[scope] ?? scope;
}
