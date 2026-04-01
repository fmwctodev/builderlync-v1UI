// src/modules/roof-runner/components/dashboard/AIInsightWidget.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, FileText, AlertCircle } from 'lucide-react';
import { getAIReports } from '@/modules/reporting/services/aiReports';
import type { AIReport } from '@/modules/reporting/types/aiReports';

export const AIInsightWidget: React.FC = () => {
  const navigate = useNavigate();
  const [latestReport, setLatestReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const reports = await getAIReports({ status: 'complete', limit: 1 } as any);
        if (reports && reports.length > 0) {
          setLatestReport(reports[0]);
        }
      } catch (error) {
        console.error('Failed to fetch latest AI insight:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
        <Loader2 className="w-6 h-6 text-cyan-600 animate-spin mb-2" />
        <p className="text-gray-400 text-xs">Fetching latest insights...</p>
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-600/20 group cursor-pointer" onClick={() => navigate('/reporting/ai')}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100">AI Reporting</span>
        </div>
        <h3 className="text-lg font-bold mb-2">No reports generated yet</h3>
        <p className="text-cyan-100/80 text-sm leading-relaxed mb-6">
          Ask our AI to analyze your business data and get professional insights in seconds.
        </p>
        <div className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-all">
          Get Started <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col shadow-sm hover:shadow-md transition-shadow h-full overflow-hidden">
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Latest AI Insight</span>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
            {new Date(latestReport.created_at).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">
          {latestReport.report_name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {latestReport.result_json?.executive_summary || "Report generated successfully. Results are ready for review."}
        </p>
      </div>

      <button 
        onClick={() => navigate(`/reporting/${latestReport.id}`)}
        className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between group hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5 transition-colors"
      >
        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wide">View Full Report</span>
        <ArrowRight className="w-4 h-4 text-cyan-600 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
