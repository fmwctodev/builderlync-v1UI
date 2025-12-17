import { supabase } from '../lib/supabase';

export type QueryType = 'select' | 'insert' | 'update' | 'delete' | 'rpc';

export interface QueryMetric {
  id: string;
  organization_id?: string;
  query_name: string;
  query_type: QueryType;
  duration_ms: number;
  success: boolean;
  error_type?: string;
  row_count?: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface QueryPerformanceStats {
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  avg_duration_ms: number;
  median_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  max_duration_ms: number;
  min_duration_ms: number;
  slow_queries_count: number;
}

class QueryMonitoringService {
  private readonly SLOW_QUERY_THRESHOLD = 2000;

  async trackQuery<T>(
    queryName: string,
    queryType: QueryType,
    queryFn: () => Promise<T>,
    options: {
      organizationId?: string | null;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    let success = true;
    let errorType: string | undefined;
    let result: T;
    let rowCount: number | undefined;

    try {
      result = await queryFn();

      if (Array.isArray(result)) {
        rowCount = result.length;
      } else if (result && typeof result === 'object' && 'data' in result) {
        const data = (result as { data: unknown }).data;
        if (Array.isArray(data)) {
          rowCount = data.length;
        }
      }

      return result;
    } catch (error) {
      success = false;
      errorType = error instanceof Error ? error.name : 'UnknownError';
      throw error;
    } finally {
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      this.logMetric({
        queryName,
        queryType,
        durationMs,
        success,
        errorType,
        rowCount,
        organizationId: options.organizationId,
        metadata: options.metadata,
      }).catch((err) => {
        console.error('Failed to log query metric:', err);
      });

      if (durationMs > this.SLOW_QUERY_THRESHOLD) {
        console.warn(`Slow query detected: ${queryName} took ${durationMs}ms`);
      }
    }
  }

  private async logMetric(params: {
    queryName: string;
    queryType: QueryType;
    durationMs: number;
    success: boolean;
    errorType?: string;
    rowCount?: number;
    organizationId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      const metric = {
        organization_id: params.organizationId || null,
        query_name: params.queryName,
        query_type: params.queryType,
        duration_ms: params.durationMs,
        success: params.success,
        error_type: params.errorType,
        row_count: params.rowCount,
        metadata: params.metadata || {},
      };

      await supabase.from('query_metrics').insert([metric]);
    } catch (error) {
      console.error('Failed to insert query metric:', error);
    }
  }

  async getPerformanceStats(
    organizationId?: string | null,
    queryName?: string,
    hoursBack: number = 24
  ): Promise<QueryPerformanceStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_query_performance_stats', {
        p_organization_id: organizationId || null,
        p_query_name: queryName || null,
        p_hours_back: hoursBack,
      });

      if (error) throw error;
      return data as QueryPerformanceStats;
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      return null;
    }
  }

  async getSlowQueries(
    organizationId?: string | null,
    thresholdMs: number = 2000,
    hoursBack: number = 24,
    limit: number = 20
  ): Promise<
    Array<{
      query_name: string;
      avg_duration_ms: number;
      max_duration_ms: number;
      count: number;
      failure_rate: number;
    }>
  > {
    try {
      const { data, error } = await supabase.rpc('get_slow_queries', {
        p_organization_id: organizationId || null,
        p_threshold_ms: thresholdMs,
        p_hours_back: hoursBack,
        p_limit: limit,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }
  }

  async getRecentMetrics(
    organizationId?: string | null,
    queryName?: string,
    limit: number = 100
  ): Promise<QueryMetric[]> {
    try {
      let query = supabase
        .from('query_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      if (queryName) {
        query = query.eq('query_name', queryName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as QueryMetric[];
    } catch (error) {
      console.error('Failed to get recent metrics:', error);
      return [];
    }
  }
}

export const queryMonitoring = new QueryMonitoringService();
