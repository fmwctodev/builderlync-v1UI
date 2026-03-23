import React from 'react';
import { AIReportChart } from './AIReportChart';
import type { ReportComposeChart } from '../../../../types/aiReports';

interface Props {
  charts: ReportComposeChart[];
}

export function AIReportChartGrid({ charts }: Props) {
  if (!charts || charts.length === 0) return null;

  const gridClass = charts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {charts.map((chart) => (
        <AIReportChart key={chart.chart_id} chart={chart} />
      ))}
    </div>
  );
}
