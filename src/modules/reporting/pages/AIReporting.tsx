// src/modules/reporting/pages/AIReporting.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Loader2, Send, Clock, ChevronRight,
  ChevronDown, X,
} from 'lucide-react';
import {
  SUGGESTED_PROMPTS, TIMEFRAME_OPTIONS, SCOPE_OPTIONS,
} from '@/modules/reporting/types/aiReports';
import type { AIReport, ChatMessage, ReportScope } from '@/modules/reporting/types/aiReports';
import { generateReport, getAIReports, pollReportStatus } from '@/modules/reporting/services/aiReports';
import { useCurrentOrganization } from '@/shared/context/OrgContext';

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function AIReporting() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState<ReportScope>('my');
  const [timeframe, setTimeframe] = useState('last_30_days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [parentReportId, setParentReportId] = useState<string | null>(null);

  const [recentReports, setRecentReports] = useState<AIReport[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { currentOrganizationSlug: orgSlug } = useCurrentOrganization();

  const loadRecentReports = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const data = await getAIReports({ status: 'complete' });
      setRecentReports(data.slice(0, 20));
    } catch (err) {
      console.error('Failed to load recent reports:', err);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    loadRecentReports();
  }, [loadRecentReports]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMsgId = crypto.randomUUID();
    const aiMsgId = crypto.randomUUID();
    const userText = prompt.trim();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, type: 'user', content: userText, timestamp: new Date() },
      { id: aiMsgId, type: 'ai', content: '', timestamp: new Date(), isLoading: true },
    ]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const result = await generateReport({
        prompt: userText,
        scope,
        timeframe: { type: 'preset', preset: timeframe },
        parent_report_id: parentReportId ?? undefined,
      });

      if (!result.success) {
        updateMessage(aiMsgId, {
          type: 'system',
          content: result.error ?? 'Failed to start report generation',
          isLoading: false,
        });
        return;
      }

      const final = await pollReportStatus(result.report_id, (updated) => {
        if (updated.status === 'running') {
          updateMessage(aiMsgId, { isLoading: true });
        }
      }, 60, 3000);

      if (final.status === 'complete') {
        const summary = final.result_json?.executive_summary ?? 'Report generated successfully.';

        updateMessage(aiMsgId, {
          type: 'ai',
          content: summary,
          isLoading: false,
          reportId: final.id,
          report: final,
        });

        setParentReportId(final.id);
        await loadRecentReports();
      } else {
        updateMessage(aiMsgId, {
          type: 'system',
          content: final.error_message ?? 'Report generation failed.',
          isLoading: false,
        });
      }
    } catch (err) {
      updateMessage(aiMsgId, {
        type: 'system',
        content: err instanceof Error ? err.message : 'An unexpected error occurred.',
        isLoading: false,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewReport = () => {
    setMessages([]);
    setParentReportId(null);
    setPrompt('');
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-3">
          <button
            onClick={() => navigate(`/org/${orgSlug}/reporting`)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          <button
            onClick={handleNewReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            New Report
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Recent Reports</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
          {loadingRecent ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-400 dark:text-slate-500 animate-spin" />
            </div>
          ) : recentReports.length === 0 ? (
            <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-8 px-2">No reports yet</p>
          ) : (
            recentReports.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/org/${orgSlug}/reporting/${r.id}`)}
                className="group w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors mb-1"
              >
                <p className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white line-clamp-2 leading-snug font-medium">
                  {r.report_name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                  <span className="text-xs text-gray-400 dark:text-slate-500">{formatRelativeDate(r.created_at)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="max-w-3xl mx-auto pt-12">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">AI Report Builder</h1>
                <p className="text-gray-500 dark:text-slate-400 text-lg max-w-lg leading-relaxed">
                  Describe what you want to analyze and our AI will build a visual, data-driven report for you in seconds.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="group p-5 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-50/10 dark:hover:bg-slate-700/50 transition-all shadow-sm hover:shadow-md"
                  >
                    <p className="text-gray-600 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white text-sm leading-snug mb-3">{p}</p>
                    <div className="flex items-center text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
                      <span>Try this</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                  <div className={`max-w-[85%] ${
                    msg.type === 'user'
                      ? 'bg-cyan-600 text-white rounded-2xl rounded-br-none p-4 shadow-md'
                      : msg.type === 'system'
                      ? 'bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-none p-4'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-5 shadow-sm'
                  }`}>
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wide uppercase">AI Insights</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto font-medium">
                          {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {msg.isLoading ? (
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400 py-2">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </div>
                        Building your report and analyzing data...
                      </div>
                    ) : (
                      <>
                        <p className={`text-[15px] leading-relaxed ${
                          msg.type === 'user'
                            ? 'text-white'
                            : msg.type === 'system'
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-700 dark:text-slate-300'
                        }`}>
                          {msg.content}
                        </p>

                        {msg.type === 'ai' && msg.reportId && (
                          <div className="flex items-center gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
                            <button
                              onClick={() => navigate(`/org/${orgSlug}/reporting/${msg.reportId}`)}
                              className="px-4 py-2 bg-cyan-600 text-white hover:bg-cyan-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                              View Full Report
                            </button>
                            {msg.report?.result_json && (
                              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                                  {msg.report.result_json.kpis?.length ?? 0} Metrics
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span>
                                  {msg.report.result_json.charts?.length ?? 0} Charts
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {msg.type === 'user' && (
                          <p className="text-[10px] text-cyan-100/70 mt-2 text-right font-medium">
                            {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer Bar */}
        <div className="border-t border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6">
          <div className="max-w-4xl mx-auto">
            {parentReportId && (
              <div className="flex items-center justify-between mb-3 px-1 text-xs">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span>Following up on previous insights</span>
                </div>
                <button
                  onClick={() => setParentReportId(null)}
                  className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold transition-colors"
                >
                  <X className="w-3 h-3" />
                  Start fresh
                </button>
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl blur opacity-15 group-focus-within:opacity-30 transition-opacity"></div>
              <div className="relative flex gap-3 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isGenerating}
                  placeholder={
                    parentReportId
                      ? 'Ask a follow-up or refine the data...'
                      : 'Ask anything about your business data...'
                  }
                  className="flex-1 px-4 py-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-[15px] resize-none focus:ring-0 disabled:opacity-50 min-h-[48px] max-h-32"
                />

                <div className="flex items-center gap-2 px-2">
                  <div className="relative">
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as ReportScope)}
                      disabled={isGenerating}
                      className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 cursor-pointer"
                    >
                      {SCOPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      disabled={isGenerating}
                      className="appearance-none pl-3 pr-8 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 cursor-pointer"
                    >
                      {TIMEFRAME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-slate-500 pointer-events-none" />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex-shrink-0 w-11 h-11 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center transition-all active:scale-95"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 font-sans">Enter</kbd> to Send
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700 font-sans">Shift + Enter</kbd> for New Line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
