import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CHART_COLORS } from '../../../../types/aiReports';
import type { ReportComposeChart } from '../../../../types/aiReports';

function formatTickValue(value: unknown): string {
  if (typeof value === 'number') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  if (typeof value === 'string' && value.length > 16) return `${value.substring(0, 16)}...`;
  return String(value ?? '');
}

const tooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
};

const tooltipLabelStyle = { color: '#94a3b8' };

interface Props {
  chart: ReportComposeChart;
}

export function AIReportChart({ chart }: Props) {
  const { data, type, title } = chart;

  const hasData = Array.isArray(data) && data.length > 0;

  let xKey = 'name';
  let seriesKeys: string[] = [];

  if (hasData) {
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    xKey = keys.find((k) => typeof firstRow[k] === 'string' || typeof firstRow[k] === 'undefined') ?? keys[0] ?? 'name';
    seriesKeys = keys.filter((k) => k !== xKey && data.some((row) => typeof row[k] === 'number'));
  }

  const noNumericData = hasData && seriesKeys.length === 0;

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>

      {!hasData && (
        <div className="flex items-center justify-center h-12 text-gray-400 dark:text-slate-500 text-sm">
          No data available for this chart
        </div>
      )}

      {hasData && noNumericData && (
        <div className="flex items-center justify-center h-12 text-gray-400 dark:text-slate-500 text-sm">
          No numeric data for chart rendering
        </div>
      )}

      {hasData && !noNumericData && (
        <ResponsiveContainer width="100%" height={320}>
          {type === 'pie' ? (
            <PieChart margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
              <Pie
                data={data.slice(0, 10)}
                dataKey={seriesKeys[0]}
                nameKey={xKey}
                outerRadius={110}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#475569' }}
              >
                {data.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />}
            </PieChart>
          ) : type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} angle={-35} textAnchor="end" tickFormatter={formatTickValue} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tickFormatter={formatTickValue} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />}
              {seriesKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          ) : type === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} angle={-35} textAnchor="end" tickFormatter={formatTickValue} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tickFormatter={formatTickValue} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />}
              {seriesKeys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey={xKey} angle={-35} textAnchor="end" tickFormatter={formatTickValue} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tickFormatter={formatTickValue} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
              {seriesKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />}
              {seriesKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
