import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Loader2, Search, BarChart3,
  Download, MoreVertical, Eye, Copy,
  Trash2, ChevronDown, Calendar, Filter, X,
} from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';

// Mock types
interface AIReport {
  id: string;
  report_name: string;
  report_category: string;
  scope: string;
  timeframe_start: string | null;
  timeframe_end: string | null;
  created_at: string;
  status: 'complete' | 'running' | 'failed';
}

const CATEGORY_LABELS: Record<string, string> = {
  sales: 'Sales Performance',
  operations: 'Operational Efficiency',
  financial: 'Financial Health',
  crm: 'Customer Insights',
  custom: 'Custom Report'
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  running: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Analyzing...' },
  complete: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Complete' },
  failed: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', label: 'Failed' },
};

export function AIReportsTab() {
  const navigate = useNavigate();
  const { currentOrganization, currentOrganizationSlug } = useCurrentOrganization();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setReports([
      {
        id: '1',
        report_name: 'Q3 Sales Growth Analysis',
        report_category: 'sales',
        scope: 'organization',
        timeframe_start: '2024-07-01',
        timeframe_end: '2024-09-30',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'complete'
      },
      {
        id: '2',
        report_name: 'Lead Response Time Audit',
        report_category: 'operations',
        scope: 'team',
        timeframe_start: '2024-08-01',
        timeframe_end: '2024-08-31',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'complete'
      }
    ]);

    setLoading(false);
  }, [currentOrganization]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPrompt('');
      alert('Mock: Report Generation Started! In a real app, this would poll the backend.');
    }, 2000);
  };

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
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Generate Report</span>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the report you need... e.g., 'Sales performance breakdown by rep this quarter'"
            disabled={isGenerating}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm transition-all focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="w-12 h-12 text-gray-300" />
            <p className="text-gray-900 dark:text-white font-medium">No reports yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {reports.map((report) => {
                  const statusStyle = STATUS_STYLES[report.status];
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/org/${currentOrganizationSlug}/reporting/${report.id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-cyan-500" />
                          </div>
                          <span className="text-sm font-medium">{report.report_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full text-xs font-medium">
                          {CATEGORY_LABELS[report.report_category] || report.report_category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{formatDate(report.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
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
    </div>
  );
}
