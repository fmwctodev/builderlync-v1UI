import { supabase } from '../shared/lib/supabase';
import type { AIReportSchedule, ReportScope } from '../types/aiReports';

export async function getSchedules(organizationId: string): Promise<AIReportSchedule[]> {
  const { data, error } = await supabase
    .from('ai_report_schedules')
    .select('*, original_report:ai_reports(id, report_name, status)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AIReportSchedule[];
}

export async function getSchedulesByReportId(reportId: string): Promise<AIReportSchedule[]> {
  const { data, error } = await supabase
    .from('ai_report_schedules')
    .select('*')
    .eq('original_report_id', reportId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AIReportSchedule[];
}

export async function createSchedule(
  organizationId: string,
  userId: string,
  params: {
    originalReportId?: string;
    cadenceDays: number;
    reportNameTemplate: string;
    scope: ReportScope;
    promptTemplate: string;
    reportPlanTemplateJson?: Record<string, unknown>;
  }
): Promise<AIReportSchedule> {
  const nextRunAt = new Date(Date.now() + params.cadenceDays * 86400000).toISOString();

  const { data, error } = await supabase
    .from('ai_report_schedules')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      original_report_id: params.originalReportId ?? null,
      cadence_days: params.cadenceDays,
      next_run_at: nextRunAt,
      is_active: true,
      report_name_template: params.reportNameTemplate,
      scope: params.scope,
      prompt_template: params.promptTemplate,
      report_plan_template_json: params.reportPlanTemplateJson ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as AIReportSchedule;
}

export async function updateSchedule(
  scheduleId: string,
  params: Partial<{
    cadenceDays: number;
    reportNameTemplate: string;
    scope: ReportScope;
    promptTemplate: string;
    reportPlanTemplateJson: Record<string, unknown>;
  }>
): Promise<AIReportSchedule> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (params.cadenceDays !== undefined) {
    update.cadence_days = params.cadenceDays;
    update.next_run_at = new Date(Date.now() + params.cadenceDays * 86400000).toISOString();
  }
  if (params.reportNameTemplate !== undefined) update.report_name_template = params.reportNameTemplate;
  if (params.scope !== undefined) update.scope = params.scope;
  if (params.promptTemplate !== undefined) update.prompt_template = params.promptTemplate;
  if (params.reportPlanTemplateJson !== undefined) update.report_plan_template_json = params.reportPlanTemplateJson;

  const { data, error } = await supabase
    .from('ai_report_schedules')
    .update(update)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data as AIReportSchedule;
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_report_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
}

export async function toggleSchedule(scheduleId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('ai_report_schedules')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', scheduleId);

  if (error) throw error;
}
