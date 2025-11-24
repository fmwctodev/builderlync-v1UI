import React, { useState } from 'react';
import { X, ChevronRight, Info } from 'lucide-react';

interface MetricOption {
  id: string;
  label: string;
  count?: number;
  hasInfo?: boolean;
}

interface ReportMetricsModalProps {
  show: boolean;
  onClose: () => void;
  onCreateReport: (selectedMetrics: string[]) => void;
}

const ReportMetricsModal: React.FC<ReportMetricsModalProps> = ({
  show,
  onClose,
  onCreateReport,
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const metrics: MetricOption[] = [
    { id: 'jobs', label: 'Jobs', count: 15 },
    { id: 'appointments', label: 'Appointments', count: 15 },
    { id: 'opportunities', label: 'Opportunities', count: 17 },
    { id: 'visitor-data', label: 'Visitor Data', count: 13 },
    { id: 'emails', label: 'Emails', count: 11 },
    { id: 'calls', label: 'Calls', count: 13 },
    { id: 'conversations', label: 'Conversations', count: 12 },
    { id: 'payments', label: 'Payments', count: 17 },
    { id: 'meta-ads', label: 'Meta Ads', count: 16 },
    { id: 'general', label: 'General', count: 14, hasInfo: true },
    { id: 'analytics', label: 'Analytics', count: 18 },
  ];

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleCreateReport = () => {
    onCreateReport(selectedMetrics);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Report Metrics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Select one or more metrics to include in your custom report
          </p>

          <div className="space-y-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {metrics.map((metric, index) => (
              <div
                key={metric.id}
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  index !== metrics.length - 1
                    ? 'border-b border-gray-200 dark:border-gray-700'
                    : ''
                } ${
                  selectedMetrics.includes(metric.id)
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'bg-white dark:bg-gray-800'
                }`}
                onClick={() => toggleMetric(metric.id)}
              >
                <div className="flex items-center space-x-3">
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      selectedMetrics.includes(metric.id)
                        ? 'text-red-600 dark:text-red-400 rotate-90'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {metric.label}
                    </span>
                    {metric.hasInfo && (
                      <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
                {metric.count !== undefined && (
                  <span className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium">
                    {metric.count}
                  </span>
                )}
              </div>
            ))}
          </div>

          {selectedMetrics.length > 0 && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-blue-800">
              <p className="text-sm text-primary-800 dark:text-blue-200">
                {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateReport}
            disabled={selectedMetrics.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              selectedMetrics.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Create Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportMetricsModal;
