import React from 'react';
import type { FunnelStep } from '../../types/marketing';

interface RevenueFunnelChartProps {
  steps: FunnelStep[];
}

export const RevenueFunnelChart: React.FC<RevenueFunnelChartProps> = ({ steps }) => {
  const max = steps[0]?.value ?? 1;

  const formatValue = (label: string, value: number) => {
    if (label === 'Revenue') {
      return value >= 1000
        ? `$${(value / 1000).toFixed(0)}K`
        : `$${value}`;
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const widthPct = Math.max(15, (step.value / max) * 100);
        const isRevenue = step.label === 'Revenue';
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right shrink-0">{step.label}</span>
            <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden relative">
              <div
                className={`h-full rounded transition-all duration-500 ${isRevenue ? 'bg-green-500' : i === 0 ? 'bg-gray-400' : 'bg-red-500'}`}
                style={{ width: `${widthPct}%` }}
              />
              <span className="absolute inset-0 flex items-center px-2 text-xs font-semibold text-gray-900 dark:text-white">
                {formatValue(step.label, step.value)}
              </span>
            </div>
            {step.rate !== undefined && i > 0 && (
              <span className="text-xs text-gray-500 w-12 shrink-0">{step.rate}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
