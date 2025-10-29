import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoofRunnerState {
  loading: boolean;
  error: string | null;
  jobs: any[];
  opportunities: any[];
  measurements: any[];
  proposals: any[];
}

const initialState: RoofRunnerState = {
  loading: false,
  error: null,
  jobs: [],
  opportunities: [],
  measurements: [],
  proposals: [],
};

const roofRunnerSlice = createSlice({
  name: 'roofRunner',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    fetchJobsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchJobsSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.jobs = action.payload;
    },
    fetchJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchOpportunitiesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOpportunitiesSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.opportunities = action.payload;
    },
    fetchOpportunitiesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  fetchJobsRequest,
  fetchJobsSuccess,
  fetchJobsFailure,
  fetchOpportunitiesRequest,
  fetchOpportunitiesSuccess,
  fetchOpportunitiesFailure,
} = roofRunnerSlice.actions;

export const roofRunnerReducer = roofRunnerSlice.reducer;