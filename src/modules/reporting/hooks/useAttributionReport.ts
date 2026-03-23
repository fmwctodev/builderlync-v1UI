import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';

export interface AttributionMetrics {
  revenueClosed: number;
  won: number;
  totalLeads: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  leads: number;
}

export interface SessionEvent {
  id: string;
  eventType: string;
  source: string;
  content: string;
  campaign: string;
  utmMedium: string;
  utmContent: string;
  utmSource: string;
  utmTerm: string;
  referrer: string;
  url: string;
  createdAt: string;
}

export interface AttributionReportData {
  metrics: AttributionMetrics;
  revenueByDay: RevenueByDay[];
  sessionEvents: SessionEvent[];
}

export function useAttributionReport(startDate: Date, endDate: Date, attributionModel: string = 'last_touch') {
  const { currentOrganization } = useCurrentOrganization();
  const [data, setData] = useState<AttributionReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!currentOrganization) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch attribution data
        const { data: attributions, error: attrError } = await supabase
          .from('lead_source_attribution')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .gte('converted_at', startDate.toISOString())
          .lte('converted_at', endDate.toISOString())
          .not('converted_at', 'is', null);

        if (attrError) throw attrError;

        // Fetch session events
        const { data: sessions, error: sessError } = await supabase
          .from('session_events')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(100);

        if (sessError) throw sessError;

        // Calculate metrics
        const revenueClosed = attributions?.reduce((sum, a) => sum + (a.conversion_value || 0), 0) || 0;
        const won = attributions?.length || 0;
        const totalLeads = attributions?.length || 0;

        const metrics: AttributionMetrics = {
          revenueClosed,
          won,
          totalLeads,
        };

        // Group revenue by day
        const revenueByDayMap = new Map<string, { revenue: number; leads: number }>();
        attributions?.forEach(attr => {
          if (attr.converted_at) {
            const date = new Date(attr.converted_at).toISOString().split('T')[0];
            const existing = revenueByDayMap.get(date) || { revenue: 0, leads: 0 };
            revenueByDayMap.set(date, {
              revenue: existing.revenue + (attr.conversion_value || 0),
              leads: existing.leads + 1,
            });
          }
        });

        const revenueByDay: RevenueByDay[] = Array.from(revenueByDayMap.entries()).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          leads: data.leads,
        }));

        // Transform session events
        const sessionEvents: SessionEvent[] = (sessions || []).map(session => ({
          id: session.id,
          eventType: session.event_type || 'page_visit',
          source: session.utm_source || 'DIRECT TRAFFIC',
          content: session.utm_content || '-',
          campaign: session.utm_campaign || '-',
          utmMedium: session.utm_medium || '-',
          utmContent: session.utm_content || '-',
          utmSource: session.utm_source || '-',
          utmTerm: session.utm_term || '-',
          referrer: session.referrer || '-',
          url: session.url || '',
          createdAt: session.created_at || '',
        }));

        setData({
          metrics,
          revenueByDay,
          sessionEvents,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrganization, startDate, endDate, attributionModel]);

  return { data, loading, error };
}
