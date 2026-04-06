// src/modules/reporting/pages/ReportView.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Calendar, User, BarChart3, 
  Sparkles, Table as TableIcon, FileText, AlertCircle, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import type { AIReport, ReportChartConfig, ReportTableConfig, ReportKPI } from '@/modules/reporting/types/aiReports';
import { getAIReportById, downloadReport } from '@/modules/reporting/services/aiReports';
import { useCurrentOrganization } from '@/shared/context/OrgContext';

const COLORS = ['#0891b2', '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];

export function ReportView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganizationSlug: contextSlug, isLoading: loadingOrg } = useCurrentOrganization();
  const orgSlug = contextSlug || localStorage.getItem('currentOrganizationSlug');
  const [report, setReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadReport(id);
  }, [id]);

  const loadReport = async (reportId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAIReportById(reportId);
      if (data) setReport(data);
      else setError('Report not found');
    } catch (err) {
      console.error('Failed to load report:', err);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium font-outfit uppercase tracking-widest text-xs">Generating Visual Insights...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md">{error || 'We could not find the report you are looking for.'}</p>
        <button onClick={() => navigate(`/org/${orgSlug}/reporting`)} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold transition-all hover:bg-gray-800">
          Back to Reports
        </button>
      </div>
    );
  }

  const { result_json } = report;
  
  const rawData = (() => {
    try {
      const data = result_json?.raw_data;
      if (!data) return null;
      let parsed = data;
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return parsed;
    } catch (e) {
      return null;
    }
  })();
  const derivedTables = [...(result_json?.tables || [])];
  
  if (derivedTables.length === 0 && Array.isArray(rawData) && rawData.length > 0) {
    const firstRow = rawData[0];
    const columns = Object.keys(firstRow)
      .filter(key => key !== 'id' && key !== 'organization_id' && key !== 'is_deleted' && key !== 'created_at' && key !== 'updated_at')
      .map(key => ({
        key,
        header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: (key.includes('price') || key.includes('value') || key.includes('amount')) ? 'currency' : 'text'
      }));
      
    derivedTables.push({
      id: 'auto-generated-table',
      title: 'Detailed Data Report',
      columns,
      data: rawData
    });
  }
 
  const effectiveOrgSlug = orgSlug || report.organization_id || 'demo-bfeohc';

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const finalSlug = orgSlug || localStorage.getItem('currentOrganizationSlug') || 'default';
                navigate(`/org/${finalSlug}/reporting`);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {report.report_name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-medium"><Calendar className="w-3.5 h-3.5" /> {new Date(report.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 font-medium"><User className="w-3.5 h-3.5" /> {report.scope === 'org' ? 'Organization' : 'My Data'}</span>
              </div>
            </div>
          </div>
          
          {Array.isArray(rawData) && rawData.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (report.download_url) {
                    window.open(report.download_url, '_blank');
                  } else {
                    downloadReport(report.id, 'excel');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Download className="w-5 h-5" />
                Download Excel Report
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        {result_json?.executive_summary && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-cyan-600" />
            </div>
            <div className="relative">
              <h2 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Executive Summary
              </h2>
              <div className="text-gray-700 dark:text-slate-300 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                {result_json.executive_summary}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {result_json?.kpis && result_json.kpis.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {result_json.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} />
            ))}
          </div>
        )}

        {/* Charts Grid */}
        {result_json?.charts && result_json.charts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {result_json.charts.map((chart) => (
              <ChartSection key={chart.id} chart={chart} />
            ))}
          </div>
        )}

        {/* Tables (including derived) */}
        {derivedTables.length > 0 && (
          <div className="space-y-8">
            {derivedTables.map((table, idx) => (
              <TableSection key={table.id || idx} table={table} />
            ))}
          </div>
        )}

        {/* Fallback info when no visuals exist */}
        {(!result_json?.kpis?.length && !result_json?.charts?.length && derivedTables.length === 0 && !result_json?.executive_summary) && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TableIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Detailed Report Summary</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
              Our AI has analyzed the data but did not generate any visual charts for this specific query. 
              The raw insights are available in the executive summary above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function KPICard({ kpi }: { kpi: ReportKPI }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">{kpi.label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</h3>
        {kpi.change !== undefined && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
            kpi.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-600'
          }`}>
            {kpi.trend === 'up' ? '+' : ''}{kpi.change}%
          </span>
        )}
      </div>
      {kpi.description && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 leading-relaxed">{kpi.description}</p>
      )}
    </div>
  );
}

function ChartSection({ chart }: { chart: ReportChartConfig }) {
  const renderChart = () => {
    const commonProps = {
      data: chart.data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chart.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={chart.xAxis || 'name'} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            {chart.series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={chart.xAxis || 'name'} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            {chart.series.map((s, i) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {chart.series.map((s, i) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={chart.xAxis || 'name'} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            {chart.series.map((s, i) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || COLORS[i % COLORS.length]} strokeWidth={3} fillOpacity={1} fill={`url(#grad-${s.key})`} />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={chart.series[0].key}
            >
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-600" />
          {chart.title}
        </h3>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TableSection({ table }: { table: ReportTableConfig }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = table.data.filter((row) =>
    Object.values(row).some(
      (val) => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-cyan-600" />
          {table.title}
        </h3>
        
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-slate-800/50 sticky top-0 z-[1]">
            <tr>
              {table.columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                {table.columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td key={col.key} className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300">
                      {col.type === 'currency' 
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) 
                        : val && typeof val === 'object' ? JSON.stringify(val) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={table.columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 italic">
                  No records found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Showing {filteredData.length} records</p>
      </div>
    </div>
  );
}
