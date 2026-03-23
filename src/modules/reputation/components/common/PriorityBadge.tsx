import React from 'react';
import type { Priority } from '../../types';

interface Props {
  priority: Priority;
}

const CONFIG: Record<Priority, { label: string; className: string }> = {
  low: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  },
  normal: {
    label: 'Normal',
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  high: {
    label: 'High',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  urgent: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  const { label, className } = CONFIG[priority] ?? CONFIG.normal;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
};
