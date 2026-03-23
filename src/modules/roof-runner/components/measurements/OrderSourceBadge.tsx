import React from 'react';
import { Coins, ExternalLink } from 'lucide-react';
import type { OrderedVia } from '../../types/measurementOrder';

interface OrderSourceBadgeProps {
  orderedVia: OrderedVia;
  size?: 'sm' | 'md';
}

const sourceConfig: Record<OrderedVia, { label: string; icon: React.ReactNode; className: string }> = {
  credits: {
    label: 'BuilderLynk Credits',
    icon: <Coins className="h-3.5 w-3.5" />,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  eagleview: {
    label: 'EagleView Account',
    icon: <ExternalLink className="h-3.5 w-3.5" />,
    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  },
};

export function OrderSourceBadge({ orderedVia, size = 'sm' }: OrderSourceBadgeProps) {
  const config = sourceConfig[orderedVia];
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
