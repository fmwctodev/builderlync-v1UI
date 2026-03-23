import React from 'react';
import { FileText, Lightbulb, Target } from 'lucide-react';

interface Props {
  executiveSummary?: string;
  insights?: string[];
  recommendations?: string[];
}

export function ReportNarrative({ executiveSummary, insights, recommendations }: Props) {
  const hasContent = executiveSummary || (insights && insights.length > 0) || (recommendations && recommendations.length > 0);
  if (!hasContent) return null;

  return (
    <div className="space-y-4">
      {executiveSummary && (
        <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Executive Summary</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{executiveSummary}</p>
        </div>
      )}

      {insights && insights.length > 0 && (
        <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Key Insights</h3>
          </div>
          <ol className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 flex-shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{insight}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
