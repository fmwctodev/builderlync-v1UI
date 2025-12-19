const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthToken = () => localStorage.getItem('token');

const transformKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = transformKeys(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  const data = await response.json();
  return data;
};
import type {
  MarketingForm,
  FormSubmission,
  FormSubmissionWithDetails,
  CreateFormRequest,
  UpdateFormRequest,
  FormFolder,
  CreateFolderRequest,
  UpdateFolderRequest,
  FormAnalyticsData,
  FormAnalyticsFilters,
} from '../types/forms';

export const formsApi = {
  async getForms(organizationId: string | null, searchQuery?: string): Promise<MarketingForm[]> {
    try {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const response = await apiRequest(`/form-builder/forms${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },

  async getFormsByFolder(folderId: string, organizationId: string | null): Promise<MarketingForm[]> {
    try {
      const response = await apiRequest(`/form-builder/folders/${folderId}/forms`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching forms by folder:', error);
      throw error;
    }
  },

  async getFormById(
    id: string,
    organizationId: string | null
  ): Promise<MarketingForm | null> {
    try {
      const response = await apiRequest(`/form-builder/forms/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  },

  async getFormByPublicId(publicId: string): Promise<MarketingForm | null> {
    try {
      const response = await apiRequest(`/form-builder/forms/public/${publicId}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching form by public ID:', error);
      throw error;
    }
  },

  async submitPublicForm(publicId: string, submissionData: Record<string, any>, metadata?: any): Promise<{ id: string; submittedAt: string }> {
    try {
      const payload: any = submissionData;
      
      const response = await fetch(`${API_BASE_URL}/form-builder/forms/public/${publicId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(metadata?.ip && { 'X-User-IP': metadata.ip }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Submission failed' }));
        throw new Error(error.error || error.message || 'Submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  },

  async createForm(
    formData: CreateFormRequest,
    organizationId: string | null
  ): Promise<MarketingForm> {
    try {
      const response = await apiRequest('/form-builder/forms', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  },

  async updateForm(
    id: string,
    formData: UpdateFormRequest,
    organizationId: string | null
  ): Promise<MarketingForm> {
    try {
      const response = await apiRequest(`/form-builder/forms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  },

  async deleteForm(id: string, organizationId: string | null): Promise<void> {
    try {
      await apiRequest(`/form-builder/forms/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  },

  async duplicateForm(
    id: string,
    organizationId: string | null
  ): Promise<MarketingForm> {
    requireOrganizationId(organizationId, 'duplicateForm');

    try {
      const original = await this.getFormById(id, organizationId);
      if (!original) throw new Error('Form not found');

      const { data: { user } } = await supabase.auth.getUser();

      const duplicate = {
        name: `${original.name} (Copy)`,
        description: original.description,
        fields: original.fields,
        settings: original.settings,
        pipeline_id: original.pipeline_id,
        stage_id: original.stage_id,
        status: 'draft',
        created_by: user?.id,
      };

      return await this.createForm(duplicate, organizationId);
    } catch (error) {
      console.error('Error duplicating form:', error);
      throw error;
    }
  },

  async generateEmbedCode(
    formId: string,
    publicId: string,
    organizationId: string | null
  ): Promise<void> {
    requireOrganizationId(organizationId, 'generateEmbedCode');

    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/f/${publicId}`;

    const embedCode = `<!-- BuilderLynk Form Embed -->
<div id="builderlynk-form-${publicId}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${formUrl}';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '500px';
    iframe.onload = function() {
      window.addEventListener('message', function(e) {
        if (e.data.type === 'builderlynk-form-resize') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    };
    document.getElementById('builderlynk-form-${publicId}').appendChild(iframe);
  })();
</script>`;

    try {
      await supabase
        .from('marketing_forms')
        .update({ embed_code: embedCode })
        .eq('id', formId)
        .eq('organization_id', organizationId);
    } catch (error) {
      console.error('Error generating embed code:', error);
    }
  },

  async getSubmissions(
    formId: string,
    organizationId: string | null,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{ data: FormSubmissionWithDetails[]; count: number }> {
    try {
      const response = await apiRequest(`/form-builder/forms/${formId}/submissions`);
      return {
        data: response.data || [],
        count: response.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  async getSubmissionsOld(
    formId: string,
    organizationId: string | null,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{ data: FormSubmissionWithDetails[]; count: number }> {
    requireOrganizationId(organizationId, 'getSubmissions');

    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    const status = options?.status || null;

    return queryMonitoring.trackQuery(
      'getSubmissions',
      'rpc',
      async () => {
        try {
          const { data, error } = await supabase.rpc(
            'get_form_submissions_with_details',
            {
              p_form_id: formId,
              p_organization_id: organizationId,
              p_limit: limit,
              p_offset: offset,
              p_status: status,
            }
          );

          if (error) throw error;

          const { data: countData, error: countError } = await supabase.rpc(
            'count_form_submissions',
            {
              p_form_id: formId,
              p_organization_id: organizationId,
              p_status: status,
            }
          );

          if (countError) throw countError;

          return {
            data: (data || []).map((row: any) => ({
              ...row,
              form: row.form || { name: 'Unknown Form' },
              contact: row.contact || null,
            })),
            count: countData || 0,
          };
        } catch (rpcError) {
          await errorLogging.logWarning('RPC query failed, falling back to direct query', {
            error: rpcError,
            query: 'getSubmissions',
            formId,
            organizationId,
          });

          let query = supabase
            .from('form_submissions')
            .select('*', { count: 'exact' })
            .eq('form_id', formId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

          if (status) {
            query = query.eq('status', status);
          }

          if (limit) {
            query = query.limit(limit);
          }

          if (offset) {
            query = query.range(offset, offset + limit - 1);
          }

          const { data: submissions, error: submissionsError, count } = await query;

          if (submissionsError) throw submissionsError;

          if (!submissions || submissions.length === 0) {
            return { data: [], count: count || 0 };
          }

          const formIds = [...new Set(submissions.map((s) => s.form_id))];
          const contactIds = submissions
            .map((s) => s.contact_id)
            .filter((id): id is string => id != null);

          const { data: forms } = await supabase
            .from('marketing_forms')
            .select('id, name, status')
            .in('id', formIds);

          const { data: contacts } = contactIds.length > 0
            ? await supabase
                .from('contacts')
                .select('id, first_name, last_name, email')
                .in('id', contactIds)
            : { data: [] };

          const formsMap = new Map(forms?.map((f) => [f.id, f]) || []);
          const contactsMap = new Map(contacts?.map((c) => [c.id, c]) || []);

          const enrichedData: FormSubmissionWithDetails[] = submissions.map((sub) => ({
            ...sub,
            form: formsMap.get(sub.form_id) || { name: 'Unknown Form' },
            contact: sub.contact_id ? contactsMap.get(sub.contact_id) || null : null,
          }));

          return { data: enrichedData, count: count || 0 };
        }
      },
      { organizationId, metadata: { formId, limit, offset, status } }
    );
  },

  async getAllSubmissions(
    organizationId: string | null,
    options?: {
      limit?: number;
      offset?: number;
      page?: number;
      perPage?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
      formId?: string;
    }
  ): Promise<{ data: FormSubmissionWithDetails[]; count: number }> {
    try {
      const params = new URLSearchParams();
      if (options?.formId) params.append('form_id', options.formId);
      if (options?.startDate) params.append('start_date', options.startDate);
      if (options?.endDate) params.append('end_date', options.endDate);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.perPage) params.append('per_page', options.perPage.toString());
      
      const queryString = params.toString();
      const endpoint = queryString ? `/form-builder/submissions?${queryString}` : '/form-builder/submissions';
      
      const response = await apiRequest(endpoint);
      
      // Handle nested response structure: {success: true, data: {data: [...], pagination: {...}}}
      const actualData = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};
      const total = pagination.total || actualData.length || 0;
      
      return {
        data: actualData,
        count: total
      };
    } catch (error) {
      console.error('Error fetching all submissions:', error);
      return { data: [], count: 0 };
    }
  },

  async getAllSubmissionsOld(
    organizationId: string | null,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<{ data: FormSubmissionWithDetails[]; count: number }> {

    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    const status = options?.status || null;

    return queryMonitoring.trackQuery(
      'getAllSubmissions',
      'rpc',
      async () => {
        try {
          const { data, error } = await supabase.rpc(
            'get_all_form_submissions_with_details',
            {
              p_organization_id: organizationId,
              p_limit: limit,
              p_offset: offset,
              p_status: status,
            }
          );

          if (error) throw error;

          const { data: countData, error: countError } = await supabase.rpc(
            'count_form_submissions',
            {
              p_organization_id: organizationId,
              p_status: status,
            }
          );

          if (countError) throw countError;

          return {
            data: (data || []).map((row: any) => ({
              ...row,
              form: row.form || { name: 'Unknown Form' },
              contact: row.contact || null,
            })),
            count: countData || 0,
          };
        } catch (rpcError) {
          await errorLogging.logWarning('RPC query failed, falling back to direct query', {
            error: rpcError,
            query: 'getAllSubmissions',
            organizationId,
          });

          let query = supabase
            .from('form_submissions')
            .select('*', { count: 'exact' })
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

          if (status) {
            query = query.eq('status', status);
          }

          if (limit) {
            query = query.limit(limit);
          }

          if (offset) {
            query = query.range(offset, offset + limit - 1);
          }

          const { data: submissions, error: submissionsError, count } = await query;

          if (submissionsError) throw submissionsError;

          if (!submissions || submissions.length === 0) {
            return { data: [], count: count || 0 };
          }

          const formIds = [...new Set(submissions.map((s) => s.form_id))];
          const contactIds = submissions
            .map((s) => s.contact_id)
            .filter((id): id is string => id != null);

          const { data: forms } = await supabase
            .from('marketing_forms')
            .select('id, name, status')
            .in('id', formIds);

          const { data: contacts } = contactIds.length > 0
            ? await supabase
                .from('contacts')
                .select('id, first_name, last_name, email')
                .in('id', contactIds)
            : { data: [] };

          const formsMap = new Map(forms?.map((f) => [f.id, f]) || []);
          const contactsMap = new Map(contacts?.map((c) => [c.id, c]) || []);

          const enrichedData: FormSubmissionWithDetails[] = submissions.map((sub) => ({
            ...sub,
            form: formsMap.get(sub.form_id) || { name: 'Unknown Form' },
            contact: sub.contact_id ? contactsMap.get(sub.contact_id) || null : null,
          }));

          return { data: enrichedData, count: count || 0 };
        }
      },
      { organizationId, metadata: { limit, offset, status } }
    );
  },

  async deleteSubmission(
    id: string,
    organizationId: string | null
  ): Promise<void> {
    requireOrganizationId(organizationId, 'deleteSubmission');

    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  },

  async exportSubmissions(
    formId: string,
    organizationId: string | null,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('form_id', formId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/form-builder/submissions/export?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting submissions:', error);
      throw error;
    }
  },

  async getFolders(organizationId: string | null, searchQuery?: string): Promise<FormFolder[]> {
    try {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const response = await apiRequest(`/form-builder/folders${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  async createFolder(
    folderData: CreateFolderRequest,
    organizationId: string | null
  ): Promise<FormFolder> {
    try {
      const response = await apiRequest('/form-builder/folders', {
        method: 'POST',
        body: JSON.stringify(folderData),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  async updateFolder(
    id: string,
    folderData: UpdateFolderRequest,
    organizationId: string | null
  ): Promise<FormFolder> {
    requireOrganizationId(organizationId, 'updateFolder');

    try {
      const { data, error } = await supabase
        .from('form_folders')
        .update(folderData)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  async deleteFolder(id: string, organizationId: string | null): Promise<void> {
    try {
      await apiRequest(`/form-builder/folders/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  async moveFormToFolder(
    formId: string,
    folderId: string | null,
    organizationId: string | null
  ): Promise<void> {
    try {
      await apiRequest(`/form-builder/forms/${formId}`, {
        method: 'PUT',
        body: JSON.stringify({ folder_id: folderId }),
      });
    } catch (error) {
      console.error('Error moving form to folder:', error);
      throw error;
    }
  },

  async getFormAnalytics(
    organizationId: string | null,
    filters?: FormAnalyticsFilters
  ): Promise<FormAnalyticsData> {
    requireOrganizationId(organizationId, 'getFormAnalytics');

    try {
      let query = supabase
        .from('form_submissions')
        .select('form_id, created_at')
        .eq('organization_id', organizationId);

      if (filters?.formId) {
        query = query.eq('form_id', filters.formId);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data: submissions, error } = await query;

      if (error) throw error;

      const totalResponses = submissions?.length || 0;

      const viewsByDate: { [key: string]: number } = {};
      const responsesByDate: { [key: string]: number } = {};

      submissions?.forEach((sub) => {
        const date = new Date(sub.created_at).toISOString().split('T')[0];
        responsesByDate[date] = (responsesByDate[date] || 0) + 1;
        viewsByDate[date] = (viewsByDate[date] || 0) + 2;
      });

      const views_by_date = Object.entries(viewsByDate).map(([date, views]) => ({
        date,
        views,
      }));

      const responses_by_date = Object.entries(responsesByDate).map(
        ([date, responses]) => ({
          date,
          responses,
        })
      );

      const completionRate = totalResponses > 0 ? 0.75 : 0;

      return {
        total_views: totalResponses * 2,
        total_responses: totalResponses,
        average_completion_time: 180,
        completion_rate: completionRate,
        views_by_date,
        responses_by_date,
      };
    } catch (error) {
      console.error('Error fetching form analytics:', error);
      throw error;
    }
  },
};
