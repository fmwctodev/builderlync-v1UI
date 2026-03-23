import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Loader2, Send, Clock, ChevronRight,
  ChevronDown, X,
} from 'lucide-react';
import {
  SUGGESTED_PROMPTS, TIMEFRAME_OPTIONS, SCOPE_OPTIONS,
} from '../../../types/aiReports';
import type { AIReport, ChatMessage, ReportScope } from '../../../types/aiReports';
import { generateReport, getAIReports, pollReportStatus } from '../../../services/aiReports';
import { supabase } from '../../../shared/lib/supabase';

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

  const [orgId, setOrgId] = useState('');
  const [userId, setUserId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const loadRecentReports = useCallback(async () => {
    if (!orgId) return;
    setLoadingRecent(true);
    try {
      const data = await getAIReports(orgId, { status: 'complete' });
      setRecentReports(data.slice(0, 20));
    } catch (err) {
      console.error('Failed to load recent reports:', err);
    } finally {
      setLoadingRecent(false);
    }
  }, [orgId]);

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
    if (!prompt.trim() || isGenerating || !orgId) return;

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
      const result = await generateReport(orgId, userId, {
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Left Sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 space-y-3">
          <button
            onClick={() => navigate('/reporting')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          <button
            onClick={handleNewReport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            New Report
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Recent Reports</p>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
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
                onClick={() => navigate(`/reporting/${r.id}`)}
                className="group w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors mb-1"
              >
                <p className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white line-clamp-2 leading-snug">
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
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="max-w-2xl mx-auto pt-12">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">AI Report Generator</h1>
                <p className="text-gray-500 dark:text-slate-400 text-lg text-center">
                  Describe what you want to analyze and AI will build a full report
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="group p-4 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-cyan-500/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all"
                  >
                    <p className="text-gray-600 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white text-sm leading-snug mb-2">{p}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${
                    msg.type === 'user'
                      ? 'bg-gray-200 dark:bg-slate-700 rounded-2xl rounded-br-md p-4'
                      : msg.type === 'system'
                      ? 'bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-md p-4'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-bl-md p-4'
                  }`}>
                    {msg.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">AI Report</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">
                          {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {msg.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <Loader2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-spin" />
                        Building your report...
                      </div>
                    ) : (
                      <>
                        <p className={`text-sm leading-relaxed ${
                          msg.type === 'user'
                            ? 'text-gray-900 dark:text-white'
                            : msg.type === 'system'
                            ? 'text-red-700 dark:text-white'
                            : 'text-gray-700 dark:text-slate-300'
                        }`}>
                          {msg.content}
                        </p>

                        {msg.type === 'ai' && msg.reportId && (
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                            <button
                              onClick={() => navigate(`/reporting/${msg.reportId}`)}
                              className="px-3 py-1.5 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                              View Full Report
                            </button>
                            {msg.report?.result_json && (
                              <span className="text-xs text-gray-400 dark:text-slate-500">
                                {msg.report.result_json.kpis?.length ?? 0} KPIs · {msg.report.result_json.charts?.length ?? 0} charts
                              </span>
                            )}
                          </div>
                        )}

                        {msg.type === 'user' && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">
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
        <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur p-4">
          <div className="max-w-3xl mx-auto">
            {parentReportId && (
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-slate-400">
                <span>Following up on previous report</span>
                <button
                  onClick={() => setParentReportId(null)}
                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
                >
                  Start fresh
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isGenerating}
                placeholder={
                  parentReportId
                    ? 'Ask a follow-up question or request changes...'
                    : 'Describe the report you want to generate...'
                }
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />

              <div className="relative">
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as ReportScope)}
                  disabled={isGenerating}
                  className="appearance-none px-3 pr-8 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 cursor-pointer"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  disabled={isGenerating}
                  className="appearance-none px-3 pr-8 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 cursor-pointer"
                >
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-400 pointer-events-none" />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className="p-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
