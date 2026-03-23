import { supabase } from '../../../shared/lib/supabase';

export interface InstantEstimateReport {
  id: string;
  job_id?: number;
  opportunity_id?: string;
  job_address: string;
  report_name: string;
  report_data: any;
  status: 'draft' | 'completed' | 'processing' | 'archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EagleViewReport {
  id: string;
  opportunity_id?: string;
  job_id?: number;
  report_id?: string;
  property_address: string;
  report_name: string;
  measurement_data: any;
  report_url?: string;
  status: 'pending' | 'completed' | 'error';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type Report = (InstantEstimateReport | EagleViewReport) & { report_type: 'instant_estimate' | 'eagleview' };

export const reportsApi = {
  async getReportsByOpportunity(opportunityId: string): Promise<Report[]> {
    try {
      const [instantEstimates, eagleViewReports] = await Promise.all([
        this.getInstantEstimateReportsByOpportunity(opportunityId),
        this.getEagleViewReportsByOpportunity(opportunityId),
      ]);

      const allReports: Report[] = [
        ...instantEstimates.map(r => ({ ...r, report_type: 'instant_estimate' as const })),
        ...eagleViewReports.map(r => ({ ...r, report_type: 'eagleview' as const })),
      ];

      return allReports.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async getInstantEstimateReportsByOpportunity(opportunityId: string): Promise<InstantEstimateReport[]> {
    try {
      const { data, error } = await supabase
        .from('instant_estimate_reports')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching instant estimate reports:', error);
      throw error;
    }
  },

  async getEagleViewReportsByOpportunity(opportunityId: string): Promise<EagleViewReport[]> {
    try {
      const { data, error } = await supabase
        .from('eagleview_measurement_reports')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching eagleview reports:', error);
      throw error;
    }
  },

  async getAvailableInstantEstimateReports(excludeOpportunityId?: string): Promise<InstantEstimateReport[]> {
    try {
      let query = supabase
        .from('instant_estimate_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (excludeOpportunityId) {
        query = query.or(`opportunity_id.is.null,opportunity_id.neq.${excludeOpportunityId}`);
      } else {
        query = query.is('opportunity_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available instant estimate reports:', error);
      throw error;
    }
  },

  async getAvailableEagleViewReports(excludeOpportunityId?: string): Promise<EagleViewReport[]> {
    try {
      let query = supabase
        .from('eagleview_measurement_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (excludeOpportunityId) {
        query = query.or(`opportunity_id.is.null,opportunity_id.neq.${excludeOpportunityId}`);
      } else {
        query = query.is('opportunity_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available eagleview reports:', error);
      throw error;
    }
  },

  async linkInstantEstimateToOpportunity(reportId: string, opportunityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('instant_estimate_reports')
        .update({ opportunity_id: opportunityId })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking instant estimate to opportunity:', error);
      throw error;
    }
  },

  async linkEagleViewReportToOpportunity(reportId: string, opportunityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('eagleview_measurement_reports')
        .update({ opportunity_id: opportunityId })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking eagleview report to opportunity:', error);
      throw error;
    }
  },

  async unlinkReportFromOpportunity(reportId: string, reportType: 'instant_estimate' | 'eagleview'): Promise<void> {
    try {
      const tableName = reportType === 'instant_estimate'
        ? 'instant_estimate_reports'
        : 'eagleview_measurement_reports';

      const { error } = await supabase
        .from(tableName)
        .update({ opportunity_id: null })
        .eq('id', reportId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unlinking report from opportunity:', error);
      throw error;
    }
  },
};
