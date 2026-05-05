import { getAuthToken } from '../../utils/auth';
import type { AIReport } from '../../../modules/roof-runner/types/aiReports';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

class AIReportsApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || error.error || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  async generateReport(data: {
    question: string;
  }): Promise<{ success: boolean; answer?: string; downloadLink?: string; error?: string }> {
    try {
      const result = await this.makeRequest('/ai-reporting/query', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      const answer = result.data?.answer || result.answer;
      const downloadLink = result.data?.downloadLink;
      
      return {
        success: true,
        answer,
        downloadLink
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      };
    }
  }

  async getAIReports(filters?: {
    status?: string;
    category?: string;
    scope?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<AIReport[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.scope) params.append('scope', filters.scope);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const result = await this.makeRequest(`/ai-reporting/reports?${params}`);
      return result.data || result || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  async getAIReport(reportId: string): Promise<AIReport> {
    const result = await this.makeRequest(`/ai-reporting/reports/${reportId}`);
    return result.data || result;
  }

  async deleteAIReport(reportId: string): Promise<void> {
    await this.makeRequest(`/ai-reporting/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  async pollReportStatus(
    reportId: string,
    onUpdate?: (report: AIReport) => void,
    maxAttempts: number = 60,
    intervalMs: number = 3000
  ): Promise<AIReport> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const report = await this.getAIReport(reportId);
          if (onUpdate) onUpdate(report);

          if (report.status === 'complete' || report.status === 'failed') {
            resolve(report);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, intervalMs);
          } else {
            reject(new Error('Report generation timeout'));
          }
        } catch (err) {
          reject(err);
        }
      };

      poll();
    });
  }
}

export const aiReportsBackendApi = new AIReportsApiService();
