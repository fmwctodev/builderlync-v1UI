import { supabase } from '../../../shared/lib/supabase';
import type { StormIngestionJob, StormProcessingRun, IngestionJobStatus } from '../types';

export async function getIngestionJobs(
  organizationId: string,
  limit: number = 20
): Promise<StormIngestionJob[]> {
  const { data, error } = await supabase
    .from('storm_ingestion_jobs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch ingestion jobs: ${error.message}`);
  return data || [];
}

export async function getIngestionJobById(
  organizationId: string,
  jobId: string
): Promise<StormIngestionJob | null> {
  const { data, error } = await supabase
    .from('storm_ingestion_jobs')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', jobId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch ingestion job: ${error.message}`);
  return data;
}

export async function createIngestionJob(
  organizationId: string,
  provider: string,
  config: Record<string, unknown>,
  userId?: string
): Promise<StormIngestionJob> {
  const { data, error } = await supabase
    .from('storm_ingestion_jobs')
    .insert({
      organization_id: organizationId,
      provider,
      status: 'PENDING',
      events_found: 0,
      events_imported: 0,
      config,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create ingestion job: ${error.message}`);
  return data;
}

export async function updateIngestionJobStatus(
  jobId: string,
  status: IngestionJobStatus,
  updates?: {
    events_found?: number;
    events_imported?: number;
    error_message?: string;
    started_at?: string;
    completed_at?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('storm_ingestion_jobs')
    .update({ status, ...updates })
    .eq('id', jobId);

  if (error) throw new Error(`Failed to update ingestion job: ${error.message}`);
}

export async function getProcessingRuns(
  organizationId: string,
  stormEventId?: string
): Promise<StormProcessingRun[]> {
  let query = supabase
    .from('storm_processing_runs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (stormEventId) {
    query = query.eq('storm_event_id', stormEventId);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch processing runs: ${error.message}`);
  return data || [];
}
