import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Widgets', 'Preferences'],
  endpoints: (builder) => ({
    getWidgets: builder.query({
      query: () => '/dashboard/widgets',
      transformResponse: (response: any) => response.data || [],
      providesTags: ['Widgets'],
    }),

    getUserPreferences: builder.query({
      query: (userId: string) => `/dashboard/preferences/${userId}`,
      transformResponse: (response: any) => response.data || [],
      providesTags: (result, error, userId) => [{ type: 'Preferences', id: userId }],
    }),

    savePreferences: builder.mutation({
      query: ({ userId, preferences }) => ({
        url: `/dashboard/preferences/${userId}`,
        method: 'POST',
        body: { preferences },
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Preferences', id: userId }],
    }),
  }),
});

export const {
  useGetWidgetsQuery,
  useGetUserPreferencesQuery,
  useSavePreferencesMutation,
} = dashboardApi;
