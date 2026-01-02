import { pipelinesApi } from './pipelinesApi';
import {
  EMBEDDED_PIPELINE_IDS,
  EMBEDDED_PIPELINE_TYPES,
  DEFAULT_PIPELINE_STAGES,
  getEmbeddedPipelineId,
} from '../constants/embeddedPipelines';
import type { JobType, PipelineFormData, PipelineWithStages } from '../types/opportunities';

export const embeddedPipelinesService = {
  async ensureEmbeddedPipelinesExist(): Promise<boolean> {
    try {
      // Check if embedded pipelines exist by trying to fetch them
      const existingPipelines = await this.getEmbeddedPipelines();

      if (existingPipelines.length === EMBEDDED_PIPELINE_TYPES.length) {
        console.log('All embedded pipelines already exist');
        return true;
      }

      // Create missing embedded pipelines
      for (const jobType of EMBEDDED_PIPELINE_TYPES) {
        const pipelineId = getEmbeddedPipelineId(jobType);
        const existingPipeline = existingPipelines.find(p => p.id === pipelineId);

        if (!existingPipeline) {
          await this.ensurePipelineExists(pipelineId, jobType);
        }
      }

      return true;
    } catch (error) {
      console.error('Error ensuring embedded pipelines exist:', error);
      return false;
    }
  },

  async ensurePipelineExists(pipelineId: keyof typeof EMBEDDED_PIPELINE_IDS | string, jobType: JobType): Promise<void> {
    try {
      // Check if pipeline already exists
      const existingPipeline = await pipelinesApi.getPipelineById(pipelineId);

      if (existingPipeline) {
        return;
      }

      // Create the embedded pipeline with stages
      const pipelineData: any = {
        name: jobType,
        description: `System pipeline for ${jobType.toLowerCase()} opportunities`,
        is_default: jobType === 'Commercial',
        job_type: jobType,
        pipeline_type: 'system',
        stages: DEFAULT_PIPELINE_STAGES.map(stage => ({
          name: stage.name,
          color: stage.color,
          order_position: stage.order_position,
          include_in_funnel: stage.include_in_funnel,
          include_in_distribution: stage.include_in_distribution,
        })),
      };

      await pipelinesApi.createPipeline(pipelineData);
      console.log(`Created embedded ${jobType} pipeline with ${DEFAULT_PIPELINE_STAGES.length} stages`);
    } catch (error) {
      console.error(`Error ensuring ${jobType} pipeline exists:`, error);
      throw error;
    }
  },

  async getEmbeddedPipelines(): Promise<PipelineWithStages[]> {
    try {
      // Get all pipelines and filter for embedded ones
      const allPipelines = await pipelinesApi.getPipelines();
      const embeddedPipelineIds = Object.values(EMBEDDED_PIPELINE_IDS);

      return allPipelines.filter(pipeline =>
        embeddedPipelineIds.includes(pipeline.id as any) &&
        pipeline.pipeline_type === 'system'
      );
    } catch (error) {
      console.error('Error fetching embedded pipelines:', error);
      throw error;
    }
  },

  async getEmbeddedPipelineByJobType(jobType: JobType): Promise<PipelineWithStages | null> {
    try {
      const pipelineId = getEmbeddedPipelineId(jobType);
      const pipeline = await pipelinesApi.getPipelineById(pipelineId);

      // Check if it's a system pipeline
      if (pipeline && pipeline.pipeline_type === 'system') {
        return pipeline;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching ${jobType} embedded pipeline:`, error);
      throw error;
    }
  },
};
