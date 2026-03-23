import { supabase } from '../../lib/supabase';

export interface WorkflowTemplateCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  display_order: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  icon: string | null;
  gradient_colors: string[];
  trigger_config: any;
  actions_config: any[];
  is_system_template: boolean;
  is_favorite: boolean;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: WorkflowTemplateCategory;
}

export const workflowTemplateApi = {
  async getCategories(): Promise<WorkflowTemplateCategory[]> {
    const { data, error } = await supabase
      .from('workflow_template_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTemplates(filters?: {
    categoryId?: string;
    tags?: string[];
    searchQuery?: string;
    isFavorite?: boolean;
  }): Promise<WorkflowTemplate[]> {
    let query = supabase
      .from('workflow_templates')
      .select(`
        *,
        category:workflow_template_categories(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.isFavorite) {
      query = query.eq('is_favorite', true);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getTemplateById(id: string): Promise<WorkflowTemplate | null> {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select(`
        *,
        category:workflow_template_categories(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('workflow_templates')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) throw error;
  },

  async createTemplate(template: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('workflow_templates')
      .insert({
        ...template,
        created_by: user?.id,
        is_system_template: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, updates: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const { data, error } = await supabase
      .from('workflow_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
