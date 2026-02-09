import { supabase, handleSupabaseError } from './supabase-client';
import { FeatureFlag } from '../types';

export const getFeatureFlags = async (): Promise<FeatureFlag[]> => {
  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(flag => ({
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description,
      status: flag.status,
      rolloutType: flag.rollout_type,
      rolloutConfig: flag.rollout_config || {},
    }));
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const updateFeatureFlag = async (
  key: string,
  updates: Partial<FeatureFlag>
): Promise<void> => {
  try {
    const dbUpdates: any = {};

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.rolloutType) dbUpdates.rollout_type = updates.rolloutType;
    if (updates.rolloutConfig) dbUpdates.rollout_config = updates.rolloutConfig;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('feature_flags')
      .update(dbUpdates)
      .eq('key', key);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating feature flag:', error);
    throw new Error(handleSupabaseError(error));
  }
};
