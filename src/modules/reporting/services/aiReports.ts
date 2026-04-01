// src/modules/reporting/services/aiReports.ts

import { apiClient, buildQueryString } from '@/shared/utils/api';
import type {
  AIReport,
  AIReportFilters,
  GenerateReportRequest,
  GenerateReportResponse,
} from '@/modules/reporting/types/aiReports';

/**
 * Trigger AI report generation
 */
export async function generateReport(
  request: GenerateReportRequest
): Promise<GenerateReportResponse> {
  try {
    const response = await apiClient.post<any>('/ai-reports/generate', request);
    
    // Handle nested data response from backend ResponseHandler
    return {
      success: response.success && (response.data?.success !== false),
      report_id: response.data?.report_id || response.report_id,
      error: response.error || response.data?.error
    };
  } catch (error: any) {
    console.error('Failed to generate report:', error);
    return {
      success: false,
      report_id: '',
      error: error.response?.data?.error || 'Failed to start report generation'
    };
  }
}

/**
 * List historical AI reports
 */
export async function getAIReports(
  filters?: AIReportFilters
): Promise<AIReport[]> {
  const query = filters ? buildQueryString(filters) : '';
  const response = await apiClient.get<{ success: boolean; data: AIReport[] }>(`/ai-reports${query}`);
  return response.data || [];
}

/**
 * Get a single report by ID
 */
export async function getAIReportById(
  reportId: string
): Promise<AIReport | null> {
  const response = await apiClient.get<{ success: boolean; data: AIReport }>(`/ai-reports/${reportId}`);
  return response.data || null;
}

/**
 * Duplicate an existing report
 */
export async function duplicateReport(
  reportId: string
): Promise<AIReport> {
  const response = await apiClient.post<{ success: boolean; data: AIReport }>(`/ai-reports/${reportId}/duplicate`);
  return response.data;
}

/**
 * Delete a report
 */
export async function deleteReport(
  reportId: string
): Promise<void> {
  await apiClient.delete(`/ai-reports/${reportId}`);
}

/**
 * Poll for report completion status
 */
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
