import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReportComposeKPI } from '../../../../types/aiReports';

function formatValue(value: number | string, format?: string): string {
  if (typeof value === 'string') return value;

  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  if (format === 'percentage') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US').format(value);
}

interface Props {
  kpi: ReportComposeKPI;
}

export function ReportKPICard({ kpi }: Props) {
  const trend = kpi.trend ?? (
    kpi.delta_pct == null ? 'flat' :
    kpi.delta_pct > 0 ? 'up' :
    kpi.delta_pct < 0 ? 'down' : 'flat'
  );

  const deltaColors = {
    up: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    down: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    flat: { text: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-100 dark:bg-slate-500/10', border: 'border-gray-200 dark:border-slate-500/20' },
  };

  const colors = deltaColors[trend];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/60 p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{kpi.label}</span>
        {kpi.delta_pct != null && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colors.text} ${colors.bg} ${colors.border}`}>
            <TrendIcon className="w-3 h-3" />
            {kpi.delta_pct >= 0 ? '+' : ''}{(kpi.delta_pct * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {formatValue(kpi.value, kpi.format)}
      </div>
    </div>
  );
}
