import React from 'react';
import type { ReportComposeTable } from '../../../../types/aiReports';

function formatCellValue(value: unknown, format?: string): string {
  if (value == null) return '-';
  if (typeof value === 'number') {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    if (format === 'percentage') return `${(value * 100).toFixed(1)}%`;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }
  return String(value);
}

const MAX_ROWS = 25;

interface Props {
  table: ReportComposeTable;
}

export function AIReportTable({ table }: Props) {
  const displayRows = table.rows.slice(0, MAX_ROWS);
  const hasMore = table.rows.length > MAX_ROWS;

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{table.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700/40">
              {table.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/30">
            {displayRows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                {table.columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                    {formatCellValue(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={table.columns.length} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700/40 text-xs text-gray-400 dark:text-slate-500">
          Showing {MAX_ROWS} of {table.rows.length} rows
        </div>
      )}
    </div>
  );
}
