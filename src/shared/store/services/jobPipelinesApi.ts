import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth';
import { Pipeline, PipelineStage, CreatePipelineRequest, UpdatePipelineRequest } from './pipelinesApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api';

export const jobPipelinesApi = createApi({
  reducerPath: 'jobPipelinesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/job-pipelines`,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['JobPipeline'],
  endpoints: (builder) => ({
    getJobPipelines: builder.query<Pipeline[], void>({
      query: () => '/',
      transformResponse: (response: { data: Pipeline[] }) => response.data,
      providesTags: ['JobPipeline'],
    }),
    getJobPipelineById: builder.query<Pipeline, string>({
      query: (id) => `/${id}`,
      transformResponse: (response: { data: Pipeline }) => response.data,
      providesTags: (_, __, id) => [{ type: 'JobPipeline', id }],
    }),
    createJobPipeline: builder.mutation<Pipeline, CreatePipelineRequest>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { data: Pipeline }) => response.data,
      invalidatesTags: ['JobPipeline'],
    }),
    updateJobPipeline: builder.mutation<Pipeline, { id: string; data: UpdatePipelineRequest }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data: Pipeline }) => response.data,
      invalidatesTags: (_, __, { id }) => ['JobPipeline', { type: 'JobPipeline', id }],
    }),
    deleteJobPipeline: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['JobPipeline'],
    }),
  }),
});

export const {
  useGetJobPipelinesQuery,
  useGetJobPipelineByIdQuery,
  useUpdateJobPipelineMutation,
  useCreateJobPipelineMutation,
  useDeleteJobPipelineMutation,
} = jobPipelinesApi;
