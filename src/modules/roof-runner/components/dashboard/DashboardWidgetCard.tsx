import React from 'react';
import * as Icons from 'lucide-react';

interface DashboardWidgetCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function DashboardWidgetCard({
  title,
  value,
  subtitle,
  icon,
  trend
}: DashboardWidgetCardProps) {
  const IconComponent = icon && Icons[icon as keyof typeof Icons]
    ? (Icons[icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>)
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {IconComponent && (
          <IconComponent size={20} className="text-gray-400 dark:text-gray-500" />
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
