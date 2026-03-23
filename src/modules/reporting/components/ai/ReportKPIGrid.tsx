import React from 'react';
import { ReportKPICard } from './ReportKPICard';
import type { ReportComposeKPI } from '../../../../types/aiReports';

interface Props {
  kpis: ReportComposeKPI[];
}

export function ReportKPIGrid({ kpis }: Props) {
  if (!kpis || kpis.length === 0) return null;

  const gridClass =
    kpis.length === 2 ? 'grid-cols-2' :
    kpis.length === 3 ? 'grid-cols-3' :
    'grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {kpis.map((kpi, i) => (
        <ReportKPICard key={i} kpi={kpi} />
      ))}
    </div>
  );
}
