import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Send,
  Loader2,
  Search,
  BarChart3,
  Download,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  ChevronDown,
  Calendar,
  Filter,
  X,
  AlertCircle,
} from "lucide-react";
import {
  STATUS_STYLES,
  CATEGORY_LABELS,
  SUGGESTED_PROMPTS,
  TIMEFRAME_OPTIONS,
  SCOPE_OPTIONS,
} from "@/modules/reporting/types/aiReports";
import type {
  AIReport,
  AIReportFilters,
  ReportScope,
} from "@/modules/reporting/types/aiReports";
import {
  getAIReports,
  generateReport,
  deleteReport,
  pollReportStatus,
  downloadReport,
} from "@/modules/reporting/services/aiReports";
import { useCurrentOrganization } from "@/shared/context/OrgContext";

interface Props {
  onNavigateToChat?: () => void;
}

export function AIReportsTab({ onNavigateToChat }: Props) {
  const navigate = useNavigate();
  const { currentOrganizationSlug: contextSlug, isLoading: loadingOrg } =
    useCurrentOrganization();
  const orgSlug =
    contextSlug || localStorage.getItem("currentOrganizationSlug");

  const [prompt, setPrompt] = useState("");
  const [scope, setScope] = useState<ReportScope>("org");
  const [timeframe, setTimeframe] = useState("last_30_days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [reports, setReports] = useState<AIReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AIReportFilters>({});
  const [reportResult, setReportResult] = useState<{
    answer: string;
    downloadLink?: string;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // New states for Generation Modal
  const [isPolling, setIsPolling] = useState(false);
  const [pollingReport, setPollingReport] = useState<AIReport | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);

  // Load reports on mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoadingReports(true);
      setLoadError(null);
      try {
        const result = await getAIReports({
          ...filters,
          search: search || undefined,
        });
        setReports(result || []);
      } catch (err) {
        console.error("Load error:", err);
        setLoadError(
          err instanceof Error ? err.message : "Failed to load reports",
        );
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
        timeframe:
          timeframe === "custom"
            ? { type: "custom", start: startDate, end: endDate }
            : { type: "preset", preset: timeframe },
      });

      if (!result.success) {
        alert("Error: " + result.error);
        setIsGenerating(false);
        return;
      }

      setPrompt("");

      // Instead of navigating, start polling and show modal
      setIsGenerating(false);
      setIsPolling(true);
      setPollingError(null);
      setPollingReport(null);

      try {
        const final = await pollReportStatus(result.report_id, (updated) => {
          setPollingReport(updated);
        });
        setPollingReport(final);
        // Refresh the reports list in background
        const updatedReports = await getAIReports({
          ...filters,
          search: search || undefined,
        });
        setReports(updatedReports || []);
      } catch (err) {
        setPollingError(
          err instanceof Error ? err.message : "Report generation failed",
        );
      }
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"));
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this report?")) return;
    try {
      await deleteReport(reportId);
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err) {
      alert(
        "Error: " + (err instanceof Error ? err.message : "Failed to delete"),
      );
    }
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.scope ||
    filters.status
  );
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          AI Reports
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Generate intelligent reports from your data using AI
        </p>
      </div>

      {loadingOrg && !orgSlug && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Premium Generate Panel */}
      <div className="relative group overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:border-primary-500/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-indigo-500 opacity-70" />

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-pulse" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Generate Report
            </span>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex-1 relative group/input">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the report you need..."
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-gray-100/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* <div className="relative">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as ReportScope)}
                disabled={isGenerating}
                className="appearance-none pl-4 pr-10 py-3 bg-gray-100/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 text-sm font-semibold focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {SCOPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div> */}

            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                disabled={isGenerating}
                className="appearance-none pl-4 pr-10 py-3 bg-gray-100/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 text-sm font-semibold focus:outline-none cursor-pointer disabled:opacity-50 min-w-[140px]"
              >
                {TIMEFRAME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={handleGenerate}
              disabled={
                !prompt.trim() ||
                isGenerating ||
                (timeframe === "custom" && (!startDate || !endDate))
              }
              className={`
                flex items-center gap-2 px-6 py-3 
                ${!prompt.trim() || isGenerating || (timeframe === "custom" && (!startDate || !endDate)) ? "bg-gray-200 dark:bg-slate-700" : "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25"} 
                text-white rounded-xl font-bold text-sm transition-all active:scale-95
              `}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isGenerating ? "Analyzing..." : "Generate"}</span>
            </button>
          </div>

          {/* Custom Date Row (Restored but refined) */}
          {timeframe === "custom" && (
            <div className="flex items-center gap-4 py-3 px-4 bg-primary-500/5 dark:bg-primary-500/10 rounded-xl border border-primary-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                Select Range:
              </span>
              <div className="flex items-center gap-2">
                <div className="relative group/date">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/date:text-primary-500 transition-colors pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all"
                  />
                </div>
                <span className="text-gray-400 text-sm font-medium">to</span>
                <div className="relative group/date">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/date:text-primary-500 transition-colors pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Prompts (Restored below) */}
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-gray-100/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-400 text-xs font-medium rounded-full border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 hover:text-primary-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mt-8">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              hasActiveFilters
                ? "border-primary-500 bg-primary-500/10 text-primary-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50">
            <select
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: (e.target.value as AIReport["status"]) || undefined,
                })
              }
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
            <p className="text-red-900 dark:text-red-200 font-medium">
              {loadError}
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="w-12 h-12 text-gray-300" />
            <p className="text-gray-900 dark:text-white font-medium">
              No reports yet
            </p>
            <p className="text-gray-500 text-sm">
              Generate your first report above
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Report
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {reports.map((report) => {
                  const statusStyle = STATUS_STYLES[report.status];
                  return (
                    <tr
                      key={report.id}
                      onClick={() => {
                        const finalSlug =
                          orgSlug ||
                          localStorage.getItem("currentOrganizationSlug") ||
                          "default";
                        navigate(`/org/${finalSlug}/reporting/${report.id}`);
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-primary-500" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {report.report_name === "Analyzing data..." ||
                            !report.report_name
                              ? report.prompt || "Untitled Report"
                              : report.report_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300 capitalize">
                        {report.scope}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {report.status === "running" && (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          )}
                          {statusStyle.label}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          {report.status === "complete" &&
                            (() => {
                              try {
                                const data = report.result_json?.raw_data;
                                if (!data) return false;
                                let parsed = data;
                                if (typeof parsed === "string")
                                  parsed = JSON.parse(parsed);
                                if (typeof parsed === "string")
                                  parsed = JSON.parse(parsed);
                                return (
                                  Array.isArray(parsed) && parsed.length > 0
                                );
                              } catch (e) {
                                return false;
                              }
                            })() && (
                              <button
                                onClick={() => {
                                  if (report.download_url) {
                                    window.open(report.download_url, "_blank");
                                  } else {
                                    downloadReport(report.id, "excel");
                                  }
                                }}
                                title="Download Report"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </button>
                            )}

                          <button
                            onClick={(e) => handleDelete(report.id, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Result Modal */}
      {showResultModal && reportResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Report Result
              </h2>
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

      {/* Generation Progress Modal */}
      {isPolling && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-gray-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    AI Report Builder
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Processing your data request
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPolling(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Container with Responsive Height */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {pollingError || pollingReport?.status === "failed" ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generation Failed
                  </h4>
                  <p className="text-red-600 dark:text-red-400 text-sm max-w-xs mx-auto">
                    {pollingError ||
                      pollingReport?.error_message ||
                      "Report generation failed"}
                  </p>
                  <button
                    onClick={() => setIsPolling(false)}
                    className="px-6 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : pollingReport?.status === "complete" ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Success!
                    </h4>
                    <p className="text-gray-600 dark:text-slate-300">
                      Your report <strong>{pollingReport.report_name}</strong>{" "}
                      is ready.
                    </p>
                  </div>

                  {pollingReport.result_json?.executive_summary && (
                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 text-left border border-gray-100 dark:border-slate-800">
                      <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-3 italic">
                        "{pollingReport.result_json.executive_summary}"
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                    {(() => {
                      try {
                        const data = pollingReport.result_json?.raw_data;
                        if (!data) return false;
                        let parsed = data;
                        if (typeof parsed === "string")
                          parsed = JSON.parse(parsed);
                        if (typeof parsed === "string")
                          parsed = JSON.parse(parsed);
                        return Array.isArray(parsed) && parsed.length > 0;
                      } catch (e) {
                        return false;
                      }
                    })() ? (
                      <>
                        <button
                          onClick={() => {
                            setIsPolling(false);
                            const finalSlug = orgSlug || "default";
                            navigate(
                              `/org/${finalSlug}/reporting/${pollingReport.id}`,
                            );
                          }}
                          className="w-full sm:flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Report
                        </button>

                        <button
                          onClick={() => {
                            if (pollingReport.download_url) {
                              window.open(pollingReport.download_url, "_blank");
                            } else {
                              downloadReport(pollingReport.id, "excel");
                            }
                          }}
                          className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Excel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsPolling(false)}
                        className="w-full py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white rounded-xl font-bold text-sm transition-colors hover:bg-gray-200"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-100 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Analyzing Data
                    </h4>
                    <p className="text-gray-500 dark:text-slate-400 text-sm max-w-[280px] mx-auto">
                      Our AI is processing your business intelligence and
                      building custom visualizations...
                    </p>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 max-w-[240px] mx-auto overflow-hidden">
                    <div className="bg-cyan-500 h-full w-2/3 animate-pulse rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 flex justify-center border-t border-gray-100 dark:border-slate-800">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                Generating in background. You can safely close this window.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
