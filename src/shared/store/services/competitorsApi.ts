import { supabase } from '../../lib/supabase';

export interface Competitor {
  id: string;
  user_id: string;
  company_name: string;
  website_url?: string;
  google_business_url?: string;
  facebook_url?: string;
  yelp_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompetitorInput {
  company_name: string;
  website_url?: string;
  google_business_url?: string;
  facebook_url?: string;
  yelp_url?: string;
  notes?: string;
}

export interface UpdateCompetitorInput extends Partial<CreateCompetitorInput> {}

export const getCompetitors = async (): Promise<Competitor[]> => {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return [];
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch competitors: ${error.message}`);
  }

  return data || [];
};

export const addCompetitor = async (competitorData: CreateCompetitorInput): Promise<Competitor> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('competitors')
    .insert({
      ...competitorData,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add competitor: ${error.message}`);
  }

  return data;
};

export const updateCompetitor = async (
  id: string,
  updates: UpdateCompetitorInput
): Promise<Competitor> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('competitors')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update competitor: ${error.message}`);
  }

  return data;
};

export const deleteCompetitor = async (id: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase
    .from('competitors')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete competitor: ${error.message}`);
  }
};
