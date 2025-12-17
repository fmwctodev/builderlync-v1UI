import { supabase } from '../../lib/supabase';

export interface InstantEstimateReport {
  id: string;
  job_id?: number;
  job_address: string;
  report_name: string;
  report_data?: any;
  status: 'draft' | 'completed' | 'processing' | 'archived';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReportRequest {
  job_id?: number;
  job_address: string;
  report_name: string;
  report_data?: any;
  status?: 'draft' | 'completed' | 'processing' | 'archived';
}

export interface ReportsResponse {
  success: boolean;
  data: InstantEstimateReport[];
  message?: string;
}

export interface ReportResponse {
  success: boolean;
  data: InstantEstimateReport;
  message?: string;
}

export const getReportsByJobId = async (jobId: number): Promise<ReportsResponse> => {
  try {
    const { data, error } = await supabase
      .from('instant_estimate_reports')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data as InstantEstimateReport[]
    };
  } catch (error: any) {
    console.error('Error fetching reports by job ID:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch reports'
    };
  }
};

export const getReportsByAddress = async (address: string): Promise<ReportsResponse> => {
  try {
    const { data, error } = await supabase
      .from('instant_estimate_reports')
      .select('*')
      .eq('job_address', address)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data as InstantEstimateReport[]
    };
  } catch (error: any) {
    console.error('Error fetching reports by address:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch reports'
    };
  }
};

export const getAllReports = async (): Promise<ReportsResponse> => {
  try {
    const { data, error } = await supabase
      .from('instant_estimate_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data as InstantEstimateReport[]
    };
  } catch (error: any) {
    console.error('Error fetching all reports:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch reports'
    };
  }
};

export const getReportById = async (id: string): Promise<ReportResponse> => {
  try {
    const { data, error } = await supabase
      .from('instant_estimate_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error('Report not found');
    }

    return {
      success: true,
      data: data as InstantEstimateReport
    };
  } catch (error: any) {
    console.error('Error fetching report:', error);
    throw error;
  }
};

export const createReport = async (reportData: CreateReportRequest): Promise<ReportResponse> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const newReport = {
      job_id: reportData.job_id,
      job_address: reportData.job_address,
      report_name: reportData.report_name,
      report_data: reportData.report_data || {},
      status: reportData.status || 'draft',
      created_by: user?.id
    };

    const { data, error } = await supabase
      .from('instant_estimate_reports')
      .insert([newReport])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as InstantEstimateReport
    };
  } catch (error: any) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const updateReport = async (
  id: string,
  reportData: Partial<CreateReportRequest>
): Promise<ReportResponse> => {
  try {
    const updateData: any = {
      ...reportData
    };

    const { data, error } = await supabase
      .from('instant_estimate_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as InstantEstimateReport
    };
  } catch (error: any) {
    console.error('Error updating report:', error);
    throw error;
  }
};

export const deleteReport = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('instant_estimate_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting report:', error);
    throw error;
  }
};
