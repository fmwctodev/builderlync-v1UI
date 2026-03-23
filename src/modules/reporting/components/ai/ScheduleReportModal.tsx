import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { CADENCE_OPTIONS } from '../../../../types/aiReports';
import type { AIReport, ReportScope } from '../../../../types/aiReports';
import { createSchedule } from '../../../../services/aiReportSchedules';

interface Props {
  report: AIReport;
  organizationId: string;
  userId: string;
  onClose: () => void;
  onScheduled: () => void;
}

export function ScheduleReportModal({ report, organizationId, userId, onClose, onScheduled }: Props) {
  const [selectedDays, setSelectedDays] = useState(30);
  const [useCustom, setUseCustom] = useState(false);
  const [customDays, setCustomDays] = useState(30);
  const [saving, setSaving] = useState(false);

  const effectiveDays = useCustom ? customDays : selectedDays;
  const nextRunDate = new Date(Date.now() + effectiveDays * 86400000);
  const isCustomValid = !useCustom || (customDays >= 1 && customDays <= 365);

  const handleSave = async () => {
    if (!isCustomValid) return;
    setSaving(true);
    try {
      await createSchedule(organizationId, userId, {
        originalReportId: report.id,
        cadenceDays: effectiveDays,
        reportNameTemplate: report.report_name,
        scope: report.scope as ReportScope,
        promptTemplate: report.prompt,
      });
      onScheduled();
      onClose();
    } catch (err) {
      console.error('Failed to create schedule:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Schedule Report</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Auto-generate on a recurring basis</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Report</p>
            <p className="text-sm text-gray-900 dark:text-white truncate">{report.report_name}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Frequency</p>
            <div className="space-y-2">
              {CADENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setSelectedDays(option.value); setUseCustom(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    !useCustom && selectedDays === option.value
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-300 ring-1 ring-cyan-500/10'
                      : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === 30 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      Recommended
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setUseCustom(true)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${
                  useCustom
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-300'
                    : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                Custom interval
              </button>

              {useCustom && (
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-500 dark:text-slate-400">days</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>
              Next report:{' '}
              <span className="text-gray-900 dark:text-white">
                {nextRunDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500">
            Reports are stored automatically. You will receive an in-app notification when each report is ready.
          </p>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isCustomValid}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
