import React from 'react';
import { Clock, Loader2, CheckCircle, Package, XCircle, AlertCircle } from 'lucide-react';
import type { OrderStatus } from '../../types/measurementOrder';

interface OrderStatusPillProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  className: string;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-3.5 w-3.5" />,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  },
  processing: {
    label: 'Processing',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  delivered: {
    label: 'Delivered',
    icon: <Package className="h-3.5 w-3.5" />,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
  failed: {
    label: 'Failed',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
};

export function OrderStatusPill({ status, size = 'sm' }: OrderStatusPillProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${sizeClasses}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
