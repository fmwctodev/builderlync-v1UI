import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  order_position: number;
  include_in_funnel: boolean;
  include_in_distribution: boolean;
  category: string | null;
}

export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  job_type: 'Commercial' | 'Residential' | 'Insurance';
  stages: PipelineStage[];
  job_count?: number;
  is_job_workflow?: boolean;
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  is_default?: boolean;
  stages?: Partial<PipelineStage>[];
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  is_default: boolean;
  job_type: 'Commercial' | 'Residential' | 'Insurance';
  stages: Partial<PipelineStage>[];
}

export const pipelinesApi = createApi({
  reducerPath: 'pipelinesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/pipelines`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Pipeline'],
  endpoints: (builder) => ({
    getPipelines: builder.query<Pipeline[], void>({
      query: () => '/',
      transformResponse: (response: { data: Pipeline[] }) => response.data,
      providesTags: ['Pipeline'],
    }),
    getPipelineById: builder.query<Pipeline, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: { data: Pipeline }) => response.data,
      providesTags: (_, __, id) => [{ type: 'Pipeline', id }],
    }),
    createPipeline: builder.mutation<Pipeline, CreatePipelineRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { data: Pipeline }) => response.data,
      invalidatesTags: ['Pipeline'],
    }),
    updatePipeline: builder.mutation<Pipeline, { id: string; data: UpdatePipelineRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data: Pipeline }) => response.data,
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          pipelinesApi.util.updateQueryData('getPipelines', undefined, (draft) => {
            const pipeline = draft.find((p) => p.id === id);
            if (pipeline) {
              // Optimistically update the pipeline in the cache
              if (data.name) pipeline.name = data.name;
              if (data.stages) pipeline.stages = data.stages as PipelineStage[];
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_, __, { id }) => ['Pipeline', { type: 'Pipeline', id }],
    }),
  }),
});

export const {
  useGetPipelinesQuery,
  useGetPipelineByIdQuery,
  useUpdatePipelineMutation,
  useCreatePipelineMutation,
} = pipelinesApi;
