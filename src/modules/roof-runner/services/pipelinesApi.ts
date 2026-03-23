import { supabase } from '../../../shared/lib/supabase';
import type {
  Pipeline,
  PipelineStage,
  PipelineWithStages,
  PipelineFormData,
  JobType,
} from '../types/opportunities';

export const pipelinesApi = {
  async getPipelines(jobType?: JobType): Promise<PipelineWithStages[]> {
    try {
      let query = supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `);

      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(pipeline => ({
        ...pipeline,
        stages: (pipeline.stages || []).sort((a, b) => a.order_position - b.order_position),
      }));
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  },

  async getPipelinesByJobType(jobType: JobType): Promise<PipelineWithStages[]> {
    return this.getPipelines(jobType);
  },

  async getPipelineById(id: string): Promise<PipelineWithStages | null> {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `)
        .eq('id', id)
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
      console.error('Error fetching pipeline:', error);
      throw error;
    }
  },

  async getPipelineStages(pipeline_id: string): Promise<PipelineStage[]> {
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipeline_id)
        .order('order_position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pipeline stages:', error);
      throw error;
    }
  },

  async createPipeline(formData: PipelineFormData): Promise<PipelineWithStages> {
    try {
      if (!supabase) {
        throw new Error('Database connection not available. Please check your configuration.');
      }

      console.log('Creating pipeline with data:', formData);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!user) {
        throw new Error('User not authenticated. Please log in and try again.');
      }

      console.log('Authenticated user:', user.id);

      if (formData.is_default) {
        const { error: updateError } = await supabase
          .from('pipelines')
          .update({ is_default: false })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating default pipeline:', updateError);
        }
      }

      const pipelineData: Partial<Pipeline> = {
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        is_default: formData.is_default,
        job_type: formData.job_type,
      };

      console.log('Inserting pipeline:', pipelineData);

      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .insert(pipelineData)
        .select()
        .single();

      if (pipelineError) {
        console.error('Pipeline insert error:', pipelineError);
        throw new Error(`Failed to create pipeline: ${pipelineError.message}. ${pipelineError.hint || ''}`);
      }

      if (!pipeline) {
        throw new Error('Pipeline created but no data returned');
      }

      console.log('Pipeline created successfully:', pipeline.id);

      const stagesData = formData.stages.map((stage, index) => ({
        pipeline_id: pipeline.id,
        name: stage.name,
        color: stage.color,
        order_position: stage.order_position !== undefined ? stage.order_position : index,
        include_in_funnel: stage.include_in_funnel !== undefined ? stage.include_in_funnel : true,
        include_in_distribution: stage.include_in_distribution !== undefined ? stage.include_in_distribution : true,
      }));

      console.log('Inserting stages:', stagesData.length);

      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .insert(stagesData)
        .select();

      if (stagesError) {
        console.error('Stages insert error:', stagesError);
        throw new Error(`Failed to create pipeline stages: ${stagesError.message}. ${stagesError.hint || ''}`);
      }

      console.log('Stages created successfully:', stages?.length);

      return {
        ...pipeline,
        stages: (stages || []).sort((a, b) => a.order_position - b.order_position),
      };
    } catch (error) {
      console.error('Error creating pipeline:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the pipeline');
    }
  },

  async updatePipeline(id: string, formData: Partial<PipelineFormData>): Promise<Pipeline> {
    try {
      const updateData: Partial<Pipeline> = {
        ...(formData.name && { name: formData.name }),
        ...(formData.description !== undefined && { description: formData.description }),
        ...(formData.is_default !== undefined && { is_default: formData.is_default }),
        ...(formData.job_type && { job_type: formData.job_type }),
        updated_at: new Date().toISOString(),
      };

      if (formData.is_default) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('pipelines')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .neq('id', id);
        }
      }

      const { data, error } = await supabase
        .from('pipelines')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating pipeline:', error);
      throw error;
    }
  },

  async deletePipeline(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      throw error;
    }
  },

  async createDefaultPipeline(jobType: JobType = 'Commercial'): Promise<PipelineWithStages> {
    const pipelineNames: Record<JobType, string> = {
      Commercial: 'Commercial Leads',
      Residential: 'Residential Leads',
      Insurance: 'Insurance Leads',
    };

    const defaultPipeline: PipelineFormData = {
      name: pipelineNames[jobType],
      description: `Pipeline for ${jobType.toLowerCase()} opportunities`,
      is_default: jobType === 'Commercial',
      job_type: jobType,
      stages: [
        { name: 'New Lead', color: '#dc2626', order_position: 0 },
        { name: 'Follow-up 1', color: '#DC2626', order_position: 1 },
        { name: 'Follow-up 2', color: '#eab308', order_position: 2 },
        { name: 'Follow-up 3', color: '#16a34a', order_position: 3 },
        { name: 'Long Term Follow Up', color: '#DC2626', order_position: 4 },
        { name: 'In Convo', color: '#10b981', order_position: 5 },
        { name: 'Inspection/Estimate Booked', color: '#059669', order_position: 6 },
        { name: 'Job Qualified', color: '#DC2626', order_position: 7 },
        { name: 'Job Unqualified', color: '#dc2626', order_position: 8 },
      ],
    };

    return this.createPipeline(defaultPipeline);
  },

  async getOrCreateDefaultPipeline(): Promise<PipelineWithStages> {
    try {
      const pipelines = await this.getPipelines();

      if (pipelines.length === 0) {
        return await this.createDefaultPipeline();
      }

      const defaultPipeline = pipelines.find(p => p.is_default);
      return defaultPipeline || pipelines[0];
    } catch (error) {
      console.error('Error getting/creating default pipeline:', error);
      throw error;
    }
  },
};
