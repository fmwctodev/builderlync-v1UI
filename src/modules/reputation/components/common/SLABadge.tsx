import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SLAStatus } from '../../types';

interface Props {
  sla_breached: boolean;
  hours_remaining?: number;
}

function getSLAStatus(sla_breached: boolean, hours_remaining?: number): SLAStatus {
  if (sla_breached) return 'overdue';
  if (hours_remaining !== undefined && hours_remaining < 4) return 'due_soon';
  return 'on_track';
}

const CONFIG: Record<SLAStatus, { label: string; className: string; icon: React.ReactNode }> = {
  on_track: {
    label: 'On Track',
    className: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  due_soon: {
    label: 'Due Soon',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: <Clock className="w-3 h-3" />,
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

export const SLABadge: React.FC<Props> = ({ sla_breached, hours_remaining }) => {
  const status = getSLAStatus(sla_breached, hours_remaining);
  const { label, className, icon } = CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
};
