import React from 'react';
import { Zap, Home, Sun } from 'lucide-react';

interface ReportTypeInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  note: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const REPORT_TYPES: ReportTypeInfo[] = [
  {
    id: 'bidperfect',
    name: 'BidPerfect',
    icon: Zap,
    description: 'Best for fast, accurate roof measurements',
    note: 'Upgrade to Premium available after delivery',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-100 dark:border-amber-800/30',
  },
  {
    id: 'full-house',
    name: 'Full House',
    icon: Home,
    description: 'Best when you need roof + gutters + walls/siding + windows + penetrations',
    note: 'Includes multiple components',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-100 dark:border-blue-800/30',
  },
  {
    id: 'solar',
    name: 'Solar',
    icon: Sun,
    description: 'Solar measurement report',
    note: 'Ordered separately (not included in Full House)',
    iconColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-100 dark:border-orange-800/30',
  },
];

interface ReportRecommendationsPanelProps {
  className?: string;
}

export function ReportRecommendationsPanel({ className = '' }: ReportRecommendationsPanelProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          Need Detailed Measurements?
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Order a professional measurement report for precise project planning
        </p>
      </div>
      <div className="p-4 space-y-3">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className={`p-3 rounded-lg border ${report.bgColor} ${report.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${report.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {report.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                    {report.note}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReportRecommendationsPanel;
