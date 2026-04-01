import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Loader2, Search, BarChart3,
  Download, MoreVertical, Eye, Copy,
  Trash2, ChevronDown, Calendar, Filter, X, AlertCircle,
} from 'lucide-react';
import {
  STATUS_STYLES,
  CATEGORY_LABELS,
  SUGGESTED_PROMPTS,
  TIMEFRAME_OPTIONS,
  SCOPE_OPTIONS,
} from '@/modules/reporting/types/aiReports';
import type { AIReport, AIReportFilters, ReportScope } from '@/modules/reporting/types/aiReports';
import { 
  getAIReports, 
  generateReport, 
  deleteReport 
} from '@/modules/reporting/services/aiReports';
import { useCurrentOrganization } from '@/shared/context/OrgContext';

interface Props {
  onNavigateToChat?: () => void;
}

export function AIReportsTab({ onNavigateToChat }: Props) {
  const navigate = useNavigate();
  const { currentOrganizationSlug: orgSlug } = useCurrentOrganization();

  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState<ReportScope>('my');
  const [timeframe, setTimeframe] = useState('last_30_days');
  const [isGenerating, setIsGenerating] = useState(false);

  const [reports, setReports] = useState<AIReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AIReportFilters>({});
  const [reportResult, setReportResult] = useState<{ answer: string; downloadLink?: string } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Load reports on mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoadingReports(true);
      setLoadError(null);
      try {
        const result = await getAIReports({ ...filters, search: search || undefined });
        setReports(result || []);
      } catch (err) {
        console.error('Load error:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to load reports');
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    loadData();
  }, [filters, search]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateReport({
        prompt: prompt.trim(),
        scope,
        timeframe: { type: 'preset', preset: timeframe }
      });

      if (!result.success) {
        alert('Error: ' + result.error);
        setIsGenerating(true);
        return;
      }

      setPrompt('');
      navigate(`/org/${orgSlug}/reporting/ai?reportId=${result.report_id}`);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this report?')) return;
    try {
      await deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Failed to delete'));
    }
  };

  const hasActiveFilters = !!(filters.category || filters.scope || filters.status);
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Reports</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Generate intelligent reports from your data using AI</p>
      </div>

      {/* Generate Panel */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
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
            placeholder="Describe the report you need..."
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm disabled:opacity-50"
          />

          <div className="relative">
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ReportScope)}
              disabled={isGenerating}
              className="appearance-none px-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm disabled:opacity-50 cursor-pointer"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              disabled={isGenerating}
              className="appearance-none px-4 pr-10 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm disabled:opacity-50 cursor-pointer"
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm"
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
              className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 text-sm rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              hasActiveFilters
                ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50">
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as AIReport['status'] || undefined })}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="complete">Complete</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => setFilters({})}
                className="flex items-center gap-1 text-primary-600 text-sm"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        )}

        {loadingReports ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-red-900 dark:text-red-200 font-medium">{loadError}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="w-12 h-12 text-gray-300" />
            <p className="text-gray-900 dark:text-white font-medium">No reports yet</p>
            <p className="text-gray-500 text-sm">Generate your first report above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {reports.map((report) => {
                  const statusStyle = STATUS_STYLES[report.status];
                  return (
                    <tr
                      key={report.id}
                      onClick={() => navigate(`/org/${orgSlug}/reporting/${report.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-primary-500" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{report.report_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 capitalize">{report.scope}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(report.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {report.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDelete(report.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResultModal && reportResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Result</h2>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {reportResult.answer}
                </div>
              </div>

              {reportResult.downloadLink && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <a
                    href={reportResult.downloadLink}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
