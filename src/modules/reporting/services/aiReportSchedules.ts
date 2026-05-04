import { apiClient } from '../../../shared/utils/api';
import type { AIReportSchedule, ReportScope } from '../types/aiReports';

const BASE_URL = '/ai-reports';

export async function getSchedulesByReportId(reportId: string): Promise<AIReportSchedule[]> {
  const response = await apiClient.get<any>(`${BASE_URL}/${reportId}/schedules`);
  return response.data || [];
}

export async function createSchedule(
  _organizationId: string,
  _userId: string,
  params: {
    originalReportId?: string;
    cadenceDays: number;
    reportNameTemplate: string;
    scope: ReportScope;
    promptTemplate: string;
    reportPlanTemplateJson?: Record<string, unknown>;
  }
): Promise<AIReportSchedule> {
  const response = await apiClient.post<any>(`${BASE_URL}/schedules`, {
    original_report_id: params.originalReportId,
    cadence_days: params.cadenceDays,
    report_name_template: params.reportNameTemplate,
    scope: params.scope,
    prompt_template: params.promptTemplate,
    report_plan_template_json: params.reportPlanTemplateJson,
  });
  return response.data;
}
