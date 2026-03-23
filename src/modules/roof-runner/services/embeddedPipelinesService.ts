import { supabase } from '../../../shared/lib/supabase';
import {
  EMBEDDED_PIPELINE_IDS,
  EMBEDDED_PIPELINE_TYPES,
  DEFAULT_PIPELINE_STAGES,
  getEmbeddedPipelineId,
} from '../constants/embeddedPipelines';
import type { JobType } from '../types/opportunities';

export const embeddedPipelinesService = {
  async ensureEmbeddedPipelinesExist(): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('No authenticated user, skipping embedded pipelines check');
        return false;
      }

      for (const jobType of EMBEDDED_PIPELINE_TYPES) {
        const pipelineId = getEmbeddedPipelineId(jobType);
        await this.ensurePipelineExists(pipelineId, jobType, user.id);
      }

      return true;
    } catch (error) {
      console.error('Error ensuring embedded pipelines exist:', error);
      return false;
    }
  },

  async ensurePipelineExists(pipelineId: string, jobType: JobType, userId: string): Promise<void> {
    try {
      const { data: existingPipeline, error: checkError } = await supabase
        .from('pipelines')
        .select('id')
        .eq('id', pipelineId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingPipeline) {
        return;
      }

      const { error: insertError } = await supabase
        .from('pipelines')
        .insert({
          id: pipelineId,
          user_id: userId,
          name: jobType,
          description: `System pipeline for ${jobType.toLowerCase()} opportunities`,
          is_default: jobType === 'Commercial',
          job_type: jobType,
          pipeline_type: 'system',
        });

      if (insertError) throw insertError;

      for (const stage of DEFAULT_PIPELINE_STAGES) {
        const { error: stageError } = await supabase
          .from('pipeline_stages')
          .insert({
            pipeline_id: pipelineId,
            name: stage.name,
            order_position: stage.order_position,
            color: stage.color,
            include_in_funnel: stage.include_in_funnel,
            include_in_distribution: stage.include_in_distribution,
          });

        if (stageError) {
          console.error(`Error creating stage ${stage.name}:`, stageError);
        }
      }

      console.log(`Created embedded ${jobType} pipeline with ${DEFAULT_PIPELINE_STAGES.length} stages`);
    } catch (error) {
      console.error(`Error ensuring ${jobType} pipeline exists:`, error);
      throw error;
    }
  },

  async getEmbeddedPipelines() {
    try {
      const pipelineIds = Object.values(EMBEDDED_PIPELINE_IDS);

      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `)
        .in('id', pipelineIds)
        .eq('pipeline_type', 'system')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(pipeline => ({
        ...pipeline,
        stages: (pipeline.stages || []).sort((a, b) => a.order_position - b.order_position),
      }));
    } catch (error) {
      console.error('Error fetching embedded pipelines:', error);
      throw error;
    }
  },

  async getEmbeddedPipelineByJobType(jobType: JobType) {
    try {
      const pipelineId = getEmbeddedPipelineId(jobType);

      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `)
        .eq('id', pipelineId)
        .eq('pipeline_type', 'system')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          stages: (data.stages || []).sort((a, b) => a.order_position - b.order_position),
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching ${jobType} embedded pipeline:`, error);
      throw error;
    }
  },
};
