import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Sparkles, Clock, Calendar, User, Users,
  Building2, History, MoreHorizontal, Download, Copy, Trash2,
  Send, ChevronDown, CalendarClock, Printer, AlertTriangle,
} from 'lucide-react';
import { ReportKPIGrid } from '../components/ai/ReportKPIGrid';
import { ReportNarrative } from '../components/ai/ReportNarrative';
import { AIReportChartGrid } from '../components/ai/AIReportChartGrid';
import { AIReportTableList } from '../components/ai/AIReportTableList';
import { ScheduleReportModal } from '../components/ai/ScheduleReportModal';
import {
  getAIReportById, getReportVersions, pollReportStatus,
  generateReport, duplicateReport, deleteReport,
  getReportCategoryLabel, getScopeLabel,
} from '../../../services/aiReports';
import { getSchedulesByReportId } from '../../../services/aiReportSchedules';
import {
  STATUS_STYLES, SCOPE_OPTIONS, TIMEFRAME_OPTIONS,
} from '../../../types/aiReports';
import type { AIReport, AIReportSchedule, ReportScope } from '../../../types/aiReports';
import { supabase } from '../../../shared/lib/supabase';

export function ReportView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<AIReport | null>(null);
  const [versions, setVersions] = useState<AIReport[]>([]);
  const [schedules, setSchedules] = useState<AIReportSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [followUpPrompt, setFollowUpPrompt] = useState('');
  const [followUpScope, setFollowUpScope] = useState<ReportScope>('my');
  const [followUpTimeframe, setFollowUpTimeframe] = useState('last_30_days');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

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
      if (member?.organization_id) setOrgId(member.organization_id);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      getAIReportById(id),
      getReportVersions(id),
      getSchedulesByReportId(id),
    ]).then(([reportData, versionsData, schedulesData]) => {
      setReport(reportData);
      setVersions(versionsData);
      setSchedules(schedulesData.filter((s) => s.is_active));

      if (reportData?.status === 'running') {
        pollReportStatus(id, (updated) => setReport(updated), 60, 3000)
          .then((final) => setReport(final))
          .catch(console.error);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleFollowUp = async () => {
    if (!followUpPrompt.trim() || isGeneratingFollowUp || !orgId || !report) return;
    setIsGeneratingFollowUp(true);
    try {
      const result = await generateReport(orgId, userId, {
        prompt: followUpPrompt.trim(),
        scope: followUpScope,
        timeframe: { type: 'preset', preset: followUpTimeframe },
        parent_report_id: report.id,
      });

      if (!result.success) {
        console.error('Follow-up failed:', result.error);
        return;
      }

      setFollowUpPrompt('');
      const final = await pollReportStatus(result.report_id, undefined, 60, 3000);
      navigate(`/reporting/${final.id}`);
    } catch (err) {
      console.error('Follow-up error:', err);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleFollowUpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFollowUp();
    }
  };

  const handleExportCSV = () => {
    if (!report?.csv_data) return;
    const blob = new Blob([report.csv_data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!report?.rendered_html) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(report.rendered_html);
    win.document.close();
    win.onload = () => win.print();
  };

  const handleDuplicate = async () => {
    if (!report || !userId) return;
    const copy = await duplicateReport(report.id, userId);
    navigate(`/reporting/${copy.id}`);
  };

  const handleDelete = async () => {
    if (!report || !confirm('Delete this report? This cannot be undone.')) return;
    await deleteReport(report.id);
    navigate('/reporting');
  };

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  const currentVersionIndex = versions.findIndex((v) => v.id === id);
  const result = report?.result_json;

  const ScopeIcon = report?.scope === 'my' ? User : report?.scope === 'team' ? Users : Building2;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-gray-900 dark:text-white font-medium">Report not found</p>
          <button onClick={() => navigate('/reporting')} className="mt-3 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 text-sm">
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[report.status];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Sticky Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/reporting')}
              className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {result?.title ?? report.report_name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {report.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                  {statusStyle.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <ScopeIcon className="w-3.5 h-3.5" />
                  {getScopeLabel(report.scope)}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {getReportCategoryLabel(report.report_category)}
                </span>
                {report.timeframe_start && report.timeframe_end && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(report.timeframe_start)} – {formatDate(report.timeframe_end)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateTime(report.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {schedules.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300">
                <CalendarClock className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
              </div>
            )}

            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Clock className="w-4 h-4" />
              Schedule
            </button>

            {versions.length > 1 && (
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <History className="w-4 h-4" />
                v{currentVersionIndex + 1} of {versions.length}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showActionsMenu && (
                <div className="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                  {report.csv_data && (
                    <button onClick={() => { handleExportCSV(); setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  )}
                  {report.rendered_html && (
                    <button onClick={() => { handleExportPDF(); setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Printer className="w-4 h-4" />
                      Export PDF
                    </button>
                  )}
                  <button onClick={() => { handleDuplicate(); setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <div className="border-t border-gray-100 dark:border-slate-700" />
                  {report.created_by_user_id === userId && (
                    <button onClick={() => { handleDelete(); setShowActionsMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Version Panel */}
        {showVersions && versions.length > 1 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {versions.map((v, i) => (
              <button
                key={v.id}
                onClick={() => navigate(`/reporting/${v.id}`)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  v.id === id
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-300'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                v{i + 1}
                <span className="text-gray-400 dark:text-slate-500">{new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {report.status === 'running' && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 dark:text-cyan-400 animate-spin" />
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Generating Report</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">AI is analyzing your data and composing the report...</p>
          </div>
        )}

        {report.status === 'failed' && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Report Generation Failed</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md text-center">{report.error_message ?? 'An unexpected error occurred.'}</p>
            <button
              onClick={() => navigate('/reporting')}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {report.status === 'complete' && result && (
          <div className="max-w-6xl mx-auto p-6 space-y-8">
            {report.prompt && (
              <div className="bg-white dark:bg-slate-800/40 rounded-xl border border-gray-200 dark:border-slate-700/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Prompt</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300">{report.prompt}</p>
              </div>
            )}

            {result.kpis?.length > 0 && <ReportKPIGrid kpis={result.kpis} />}

            <ReportNarrative
              executiveSummary={result.executive_summary}
              insights={result.insights}
              recommendations={result.recommendations}
            />

            {result.charts?.length > 0 && <AIReportChartGrid charts={result.charts} />}

            {result.tables?.length > 0 && <AIReportTableList tables={result.tables} />}

            {report.data_sources_used?.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500">
                <span>Data sources:</span>
                {report.data_sources_used.map((src) => (
                  <span key={src} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-gray-500 dark:text-slate-400">{src}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Follow-up Panel */}
      {report.status === 'complete' && (
        <div className="border-t border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/30 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ask a follow-up</span>
            </div>
            <div className="flex gap-3">
              <textarea
                value={followUpPrompt}
                onChange={(e) => setFollowUpPrompt(e.target.value)}
                onKeyDown={handleFollowUpKeyDown}
                rows={1}
                placeholder="Drill deeper, change scope, or request changes to this report..."
                disabled={isGeneratingFollowUp}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <div className="relative">
                <select
                  value={followUpScope}
                  onChange={(e) => setFollowUpScope(e.target.value as ReportScope)}
                  disabled={isGeneratingFollowUp}
                  className="appearance-none px-3 pr-8 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={followUpTimeframe}
                  onChange={(e) => setFollowUpTimeframe(e.target.value)}
                  disabled={isGeneratingFollowUp}
                  className="appearance-none px-3 pr-8 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                >
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={handleFollowUp}
                disabled={!followUpPrompt.trim() || isGeneratingFollowUp}
                className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
              >
                {isGeneratingFollowUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && orgId && userId && (
        <ScheduleReportModal
          report={report}
          organizationId={orgId}
          userId={userId}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={async () => {
            const updated = await getSchedulesByReportId(report.id);
            setSchedules(updated.filter((s) => s.is_active));
          }}
        />
      )}
    </div>
  );
}
