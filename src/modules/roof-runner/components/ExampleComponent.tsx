import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchJobsRequest, fetchOpportunitiesRequest } from '../store/slices';

export const ExampleComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, opportunities, loading, error } = useAppSelector(state => state.roofRunner);

  useEffect(() => {
    dispatch(fetchJobsRequest());
    dispatch(fetchOpportunitiesRequest());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Jobs ({jobs.length})</h2>
      <h2>Opportunities ({opportunities.length})</h2>
    </div>
  );
};