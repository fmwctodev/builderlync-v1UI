import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Loader2, Search, BarChart3,
  Download, MoreVertical, Eye, Copy,
  Trash2, ChevronDown, Calendar, Filter, X,
} from 'lucide-react';
import {
  SUGGESTED_PROMPTS, TIMEFRAME_OPTIONS, SCOPE_OPTIONS, STATUS_STYLES,
  CATEGORY_LABELS,
} from '../../../../types/aiReports';
import type { AIReport, AIReportFilters, ReportScope } from '../../../../types/aiReports';
import {
  generateReport, getAIReports, getAIReportStats,
  pollReportStatus, duplicateReport, deleteReport, getReportCategoryLabel,
} from '../../../../services/aiReports';
import { supabase } from '../../../../shared/lib/supabase';

interface Props {
  onNavigateToChat?: () => void;
}

export function AIReportsTab({ onNavigateToChat }: Props) {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState<ReportScope>('my');
  const [timeframe, setTimeframe] = useState('last_30_days');
  const [isGenerating, setIsGenerating] = useState(false);

  const [reports, setReports] = useState<AIReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AIReportFilters>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [orgId, setOrgId] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (member?.organization_id) {
        setOrgId(member.organization_id);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    setLoadingReports(true);
    try {
      const reportsData = await getAIReports(orgId, { ...filters, search: search || undefined });
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [orgId, filters, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !orgId) return;
    setIsGenerating(true);
    try {
      const result = await generateReport(orgId, userId, {
        prompt: prompt.trim(),
        scope,
        timeframe: { type: 'preset', preset: timeframe },
      });

      if (!result.success) {
        console.error('Failed to generate report:', result.error);
        setIsGenerating(false);
        return;
      }

      setPrompt('');
      await loadData();

      pollReportStatus(result.report_id, () => {}, 60, 3000)
        .then(() => {
          loadData();
          navigate(`/reporting/${result.report_id}`);
        })
        .catch(console.error)
        .finally(() => setIsGenerating(false));
    } catch (err) {
      console.error('Generation error:', err);
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleExportCSV = (report: AIReport, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!report.csv_data) return;
    const blob = new Blob([report.csv_data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (report: AIReport) => {
    if (!report.rendered_html) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(report.rendered_html);
    win.document.close();
    win.onload = () => win.print();
  };

  const handleDuplicate = async (report: AIReport) => {
    if (!userId) return;
    try {
      const copy = await duplicateReport(report.id, userId);
      await loadData();
      navigate(`/reporting/${copy.id}`);
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  };

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteReport(reportId);
      await loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const hasActiveFilters = !!(filters.category || filters.scope || filters.status);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Reports</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Generate intelligent reports from your data using AI</p>
        </div>
      </div>

      {/* Generate Panel */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary-500 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Generate Report</span>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the report you need... e.g., 'Sales performance breakdown by rep this quarter'"
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:opacity-50"
          />

          <div className="relative">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ReportScope)}
              disabled={isGenerating}
              className="appearance-none px-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              disabled={isGenerating}
              className="appearance-none px-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer"
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {SUGGESTED_PROMPTS.slice(0, 5).map((p) => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {isGenerating && (
          <div className="mt-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-primary-200 dark:border-primary-800/30 p-6 flex flex-col items-center">
            <div className="relative w-12 h-12 mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
              <div className="absolute inset-2 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-400" />
              </div>
            </div>
            <p className="text-gray-900 dark:text-white font-medium text-sm">Generating your report...</p>
            <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">AI is analyzing your data and building the report</p>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              hasActiveFilters
                ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50">
            <select
              value={filters.category ?? ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value as AIReport['report_category'] || undefined })}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>

            <select
              value={filters.scope ?? ''}
              onChange={(e) => setFilters({ ...filters, scope: e.target.value as ReportScope || undefined })}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Scopes</option>
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as AIReport['status'] || undefined })}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="complete">Complete</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => setFilters({})}
                className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        )}

        {loadingReports ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 dark:text-primary-400 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-slate-600" />
            <p className="text-gray-900 dark:text-white font-medium">No reports yet</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Use the prompt above to generate your first AI report</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Report</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Timeframe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {reports.map((report) => {
                  const statusStyle = STATUS_STYLES[report.status];
                  return (
                    <tr
                      key={report.id}
                      onClick={() => navigate(`/reporting/${report.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{report.report_name}</p>
                            {report.created_by_user && (
                              <p className="text-xs text-gray-400 dark:text-slate-500">{report.created_by_user.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full text-xs font-medium">
                          {getReportCategoryLabel(report.report_category)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 capitalize">{report.scope}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {report.timeframe_start && report.timeframe_end
                            ? `${formatDate(report.timeframe_start)} – ${formatDate(report.timeframe_end)}`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{formatDate(report.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {report.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {report.status === 'complete' && report.csv_data && (
                            <button
                              onClick={(e) => handleExportCSV(report, e)}
                              className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Download CSV"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === report.id ? null : report.id)}
                              className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {activeDropdown === report.id && (
                              <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                                <button
                                  onClick={() => { navigate(`/reporting/${report.id}`); setActiveDropdown(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Report
                                </button>
                                <button
                                  onClick={() => { handleDuplicate(report); setActiveDropdown(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                  Duplicate
                                </button>
                                {report.rendered_html && (
                                  <button
                                    onClick={() => { handleExportPDF(report); setActiveDropdown(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    Export PDF
                                  </button>
                                )}
                                <div className="border-t border-gray-100 dark:border-slate-700 my-0.5" />
                                {report.created_by_user_id === userId && (
                                  <button
                                    onClick={(e) => { handleDelete(report.id, e); setActiveDropdown(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
