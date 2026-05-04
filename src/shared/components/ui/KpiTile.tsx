import { type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from './cn';

export interface KpiTileProps {
  label: ReactNode;
  /** The hero value — rendered in mono numerals. Pre-format strings (currency, units). */
  value: ReactNode;
  /** Optional sub-label or unit. */
  unit?: ReactNode;
  /** Optional trend delta percentage (e.g. 12.4 for +12.4%, -3 for -3%). */
  delta?: number;
  /** Description shown beneath the trend. */
  description?: ReactNode;
  /** Optional sparkline / chart slot. */
  chart?: ReactNode;
  className?: string;
}

/**
 * Studio KPI — mono numeric hero figure plus optional trend.
 * Lives on the Pipeline header, Dashboard, Reports.
 */
export function KpiTile({ label, value, unit, delta, description, chart, className }: KpiTileProps) {
  const trendUp = delta !== undefined && delta >= 0;

  return (
    <div
      className={cn(
        'rounded-studio-3 border border-edge-soft dark:border-edge-d-soft bg-surface-1 dark:bg-surface-d-1 shadow-s1 p-5',
        className,
      )}
    >
      <div className="studio-text-label">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="studio-num-display">{value}</span>
        {unit && <span className="studio-text-caption text-ink-3 dark:text-ink-d-3">{unit}</span>}
      </div>
      {(delta !== undefined || description) && (
        <div className="mt-2 flex items-center gap-2">
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-caption font-medium font-mono tabular-nums',
                trendUp ? 'text-ok' : 'text-signal-500',
              )}
            >
              {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {description && (
            <span className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate">
              {description}
            </span>
          )}
        </div>
      )}
      {chart && <div className="mt-4 -mx-1 -mb-1 h-12">{chart}</div>}
    </div>
  );
}
