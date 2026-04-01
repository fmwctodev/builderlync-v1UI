import { aiReportsBackendApi } from '../../../shared/store/services/aiReportsApi';

export const aiReportsApi = {
  async generateReport(question: string) {
    return aiReportsBackendApi.generateReport({ question });
  },

  async getReports(filters?: any) {
    return aiReportsBackendApi.getAIReports(filters);
  },

  async getReport(reportId: string) {
    return aiReportsBackendApi.getAIReport(reportId);
  },

  async deleteReport(reportId: string) {
    return aiReportsBackendApi.deleteAIReport(reportId);
  }
};
