import { supabase } from '../../../shared/lib/supabase';

export interface InstantEstimator {
  id: string;
  organization_id: string;
  name: string;
  slug: string | null;
  is_active: boolean;
  embed_code: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const instantEstimatorsApi = {
  async getInstantEstimators(
    organizationId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<InstantEstimator>> {
    const offset = (page - 1) * limit;

    const { count } = await supabase
      .from('instant_estimators')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const { data, error } = await supabase
      .from('instant_estimators')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching instant estimators:', error);
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getInstantEstimator(
    id: string
  ): Promise<InstantEstimator | null> {
    const { data, error } = await supabase
      .from('instant_estimators')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching instant estimator:', error);
      throw error;
    }

    return data;
  },

  async createInstantEstimator(
    organizationId: string,
    name: string
  ): Promise<InstantEstimator> {
    const { data, error } = await supabase
      .from('instant_estimators')
      .insert({
        organization_id: organizationId,
        name,
        is_active: true,
        settings: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating instant estimator:', error);
      throw error;
    }

    return data;
  },

  async renameInstantEstimator(
    id: string,
    name: string
  ): Promise<InstantEstimator> {
    const { data, error } = await supabase
      .from('instant_estimators')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error renaming instant estimator:', error);
      throw error;
    }

    return data;
  },

  async duplicateInstantEstimator(
    id: string,
    organizationId: string
  ): Promise<InstantEstimator> {
    const original = await this.getInstantEstimator(id);

    if (!original) {
      throw new Error('Estimator not found');
    }

    const { data, error } = await supabase
      .from('instant_estimators')
      .insert({
        organization_id: organizationId,
        name: `${original.name} (Copy)`,
        is_active: original.is_active,
        settings: original.settings,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating instant estimator:', error);
      throw error;
    }

    return data;
  },

  async deleteInstantEstimator(id: string): Promise<void> {
    const { error } = await supabase
      .from('instant_estimators')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting instant estimator:', error);
      throw error;
    }
  },

  async updateInstantEstimator(
    id: string,
    updates: Partial<Pick<InstantEstimator, 'name' | 'is_active' | 'settings' | 'embed_code'>>
  ): Promise<InstantEstimator> {
    const { data, error } = await supabase
      .from('instant_estimators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating instant estimator:', error);
      throw error;
    }

    return data;
  },
};
