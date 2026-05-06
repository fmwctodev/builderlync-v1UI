import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getAuthToken, logoutAndRedirect } from '../../utils/auth';
import { isStagingMode } from '../../utils/stagingAuth';
import { getStagingDashboardWidgets, getStagingDashboardPreferences } from '../../utils/stagingMocks';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Staging short-circuit: serve mock data without hitting the API.
  // Keeps the Dashboard, Sierra, Storm Canvassing, and Reporting modules
  // demonstrable on bl-v2.netlify.app without a populated backend.
  if (isStagingMode()) {
    const url = typeof args === 'string' ? args : args.url;
    if (url === '/dashboard/widgets') {
      return { data: { data: getStagingDashboardWidgets() } } as any;
    }
    if (url.startsWith('/dashboard/preferences/')) {
      const isPost = typeof args !== 'string' && (args.method === 'POST' || args.method === 'PUT');
      if (isPost) {
        // No-op save: pretend it worked so the UI flips correctly.
        return { data: { data: [] } } as any;
      }
      return { data: { data: getStagingDashboardPreferences() } } as any;
    }
  }

  let result = await baseQuery(args, api, extraOptions);
  if (result.error && (result.error.status === 403)) {
    logoutAndRedirect();
  }
  return result;
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
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
      providesTags: (_result, _error, userId) => [{ type: 'Preferences', id: userId }],
    }),

    savePreferences: builder.mutation({
      query: ({ userId, preferences }) => ({
        url: `/dashboard/preferences/${userId}`,
        method: 'POST',
        body: { preferences },
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Preferences', id: userId }],
    }),
  }),
});

export const {
  useGetWidgetsQuery,
  useGetUserPreferencesQuery,
  useSavePreferencesMutation,
} = dashboardApi;
