/*
  # Create Query Metrics System

  ## Overview
  This migration creates infrastructure for tracking database query performance
  to detect slow queries, monitor trends, and identify performance issues.

  ## Changes

  1. **Query Metrics Table**
     - `id` (uuid, primary key)
     - `organization_id` (uuid, nullable) - organization context
     - `query_name` (text) - identifier for the query
     - `query_type` (text) - select, insert, update, delete, rpc
     - `duration_ms` (integer) - query execution time in milliseconds
     - `success` (boolean) - whether query succeeded
     - `error_type` (text) - error category if failed
     - `row_count` (integer) - number of rows returned/affected
     - `metadata` (jsonb) - additional context (parameters, filters, etc.)
     - `created_at` (timestamptz)

  2. **Security**
     - Enable RLS on query_metrics table
     - Policies for organization-scoped access

  3. **Indexes**
     - Performance indexes for time-series queries
     - Indexes for aggregation queries

  4. **Aggregation Functions**
     - Query performance statistics
     - Slow query detection
*/

-- Create query_metrics table
CREATE TABLE IF NOT EXISTS query_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid,
  query_name text NOT NULL,
  query_type text NOT NULL DEFAULT 'select',
  duration_ms integer NOT NULL,
  success boolean NOT NULL DEFAULT true,
  error_type text,
  row_count integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT query_metrics_query_type_check CHECK (query_type IN ('select', 'insert', 'update', 'delete', 'rpc'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_metrics_created_at ON query_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_query_metrics_organization_id ON query_metrics(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_query_metrics_query_name ON query_metrics(query_name);
CREATE INDEX IF NOT EXISTS idx_query_metrics_duration ON query_metrics(duration_ms DESC);
CREATE INDEX IF NOT EXISTS idx_query_metrics_success ON query_metrics(success) WHERE success = false;

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_query_metrics_org_name_time ON query_metrics(organization_id, query_name, created_at DESC) WHERE organization_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE query_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for query_metrics

-- Allow users to view metrics in their organization
CREATE POLICY "Users can view metrics in their organization"
  ON query_metrics
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow users to insert metrics
CREATE POLICY "Users can insert metrics"
  ON query_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to get query performance statistics
CREATE OR REPLACE FUNCTION get_query_performance_stats(
  p_organization_id uuid DEFAULT NULL,
  p_query_name text DEFAULT NULL,
  p_hours_back integer DEFAULT 24
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_queries', COUNT(*),
    'successful_queries', COUNT(*) FILTER (WHERE success = true),
    'failed_queries', COUNT(*) FILTER (WHERE success = false),
    'avg_duration_ms', ROUND(AVG(duration_ms)::numeric, 2),
    'median_duration_ms', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms),
    'p95_duration_ms', PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms),
    'p99_duration_ms', PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms),
    'max_duration_ms', MAX(duration_ms),
    'min_duration_ms', MIN(duration_ms),
    'slow_queries_count', COUNT(*) FILTER (WHERE duration_ms > 2000)
  ) INTO v_result
  FROM query_metrics
  WHERE created_at > now() - (p_hours_back || ' hours')::interval
  AND (p_organization_id IS NULL OR organization_id = p_organization_id)
  AND (p_query_name IS NULL OR query_name = p_query_name);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(
  p_organization_id uuid DEFAULT NULL,
  p_threshold_ms integer DEFAULT 2000,
  p_hours_back integer DEFAULT 24,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  query_name text,
  avg_duration_ms numeric,
  max_duration_ms integer,
  count bigint,
  failure_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qm.query_name,
    ROUND(AVG(qm.duration_ms)::numeric, 2) as avg_duration_ms,
    MAX(qm.duration_ms) as max_duration_ms,
    COUNT(*) as count,
    ROUND((COUNT(*) FILTER (WHERE success = false)::numeric / COUNT(*)::numeric * 100), 2) as failure_rate
  FROM query_metrics qm
  WHERE qm.created_at > now() - (p_hours_back || ' hours')::interval
  AND (p_organization_id IS NULL OR qm.organization_id = p_organization_id)
  AND qm.duration_ms > p_threshold_ms
  GROUP BY qm.query_name
  ORDER BY avg_duration_ms DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old metrics (keep 30 days detailed, aggregate older)
CREATE OR REPLACE FUNCTION cleanup_old_query_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM query_metrics
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;