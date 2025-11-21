import { supabase } from '../../../shared/lib/supabase';
import type {
  Pipeline,
  PipelineStage,
  PipelineWithStages,
  PipelineFormData,
} from '../types/opportunities';

export const pipelinesApi = {
  async getPipelines(): Promise<PipelineWithStages[]> {
    try {
      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `)
        .order('created_at', { ascending: false });

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (formData.is_default) {
        await supabase
          .from('pipelines')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const pipelineData: Partial<Pipeline> = {
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        is_default: formData.is_default,
      };

      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .insert(pipelineData)
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      const stagesData = formData.stages.map((stage, index) => ({
        pipeline_id: pipeline.id,
        name: stage.name,
        color: stage.color,
        order_position: stage.order_position !== undefined ? stage.order_position : index,
      }));

      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .insert(stagesData)
        .select();

      if (stagesError) throw stagesError;

      return {
        ...pipeline,
        stages: (stages || []).sort((a, b) => a.order_position - b.order_position),
      };
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  },

  async updatePipeline(id: string, formData: Partial<PipelineFormData>): Promise<Pipeline> {
    try {
      const updateData: Partial<Pipeline> = {
        ...(formData.name && { name: formData.name }),
        ...(formData.description !== undefined && { description: formData.description }),
        ...(formData.is_default !== undefined && { is_default: formData.is_default }),
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

  async createDefaultPipeline(): Promise<PipelineWithStages> {
    const defaultPipeline: PipelineFormData = {
      name: '001a.Commercial Leads',
      description: 'Default sales pipeline',
      is_default: true,
      stages: [
        { name: 'New Lead', color: '#dc2626', order_position: 0 },
        { name: 'Follow-up 1', color: '#2563eb', order_position: 1 },
        { name: 'Follow-up 2', color: '#eab308', order_position: 2 },
        { name: 'Follow-up 3', color: '#16a34a', order_position: 3 },
        { name: 'Long Term Follow Up', color: '#9333ea', order_position: 4 },
        { name: 'In Convo', color: '#10b981', order_position: 5 },
        { name: 'Inspection/Estimate Booked', color: '#059669', order_position: 6 },
        { name: 'Job Qualified', color: '#6366f1', order_position: 7 },
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
