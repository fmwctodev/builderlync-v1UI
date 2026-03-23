import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';

export interface CallMetrics {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  averageDuration: number;
  totalDuration: number;
}

export interface CallByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface CallSource {
  source: string;
  totalCalls: number;
  wonDeals: number;
  avgDuration: number;
}

export interface CallLog {
  id: string;
  dateTime: string;
  contactName: string;
  numberName: string;
  sourceType: string;
  status: string;
  duration: number;
  recordingUrl?: string;
  direction: string;
}

export interface CallReportData {
  metrics: CallMetrics;
  byStatus: CallByStatus[];
  firstTimeByStatus: CallByStatus[];
  topSources: CallSource[];
  callLogs: CallLog[];
}

export function useCallReport(startDate: Date, endDate: Date, phoneNumber?: string) {
  const { currentOrganization } = useCurrentOrganization();
  const [data, setData] = useState<CallReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentOrganization) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query
        let query = supabase
          .from('call_logs')
          .select(`
            id,
            started_at,
            ended_at,
            status,
            direction,
            duration,
            from_number,
            to_number,
            recording_url,
            contact_id,
            contacts(full_name)
          `)
          .gte('started_at', startDate.toISOString())
          .lte('started_at', endDate.toISOString());

        if (phoneNumber) {
          query = query.or(`from_number.eq.${phoneNumber},to_number.eq.${phoneNumber}`);
        }

        const { data: callLogs, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Calculate metrics
        const totalCalls = callLogs?.length || 0;
        const completedCalls = callLogs?.filter(c => c.status === 'completed').length || 0;
        const missedCalls = callLogs?.filter(c => c.status === 'missed').length || 0;
        const inboundCalls = callLogs?.filter(c => c.direction === 'inbound').length || 0;
        const outboundCalls = callLogs?.filter(c => c.direction === 'outbound').length || 0;
        const totalDuration = callLogs?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0;
        const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

        const metrics: CallMetrics = {
          totalCalls,
          completedCalls,
          missedCalls,
          inboundCalls,
          outboundCalls,
          averageDuration,
          totalDuration,
        };

        // Calculate by status
        const statusGroups = callLogs?.reduce((acc, call) => {
          const status = call.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const byStatus: CallByStatus[] = Object.entries(statusGroups).map(([status, count]) => ({
          status,
          count,
          percentage: totalCalls > 0 ? (count / totalCalls) * 100 : 0,
        }));

        // Transform call logs data
        const callLogsList: CallLog[] = (callLogs || []).map(call => ({
          id: call.id,
          dateTime: call.started_at || '',
          contactName: (call.contacts as any)?.full_name || 'Unknown',
          numberName: call.from_number || '',
          sourceType: call.direction === 'inbound' ? 'Inbound' : 'Outbound',
          status: call.status || 'unknown',
          duration: call.duration || 0,
          recordingUrl: call.recording_url,
          direction: call.direction || 'unknown',
        }));

        setData({
          metrics,
          byStatus,
          firstTimeByStatus: byStatus,
          topSources: [],
          callLogs: callLogsList,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization, startDate, endDate, phoneNumber]);

  return { data, loading, error };
}
