import { Lock } from 'lucide-react';

export type TierType = 'basic' | 'pro' | 'pro-addon' | 'upgrade-only';

interface TierBadgeProps {
  tier: TierType;
  size?: 'sm' | 'md';
  className?: string;
}

const tierConfig: Record<TierType, { label: string; ariaLabel: string; styles: string; showLock?: boolean }> = {
  basic: {
    label: 'Basic',
    ariaLabel: 'Basic tier',
    styles: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
  pro: {
    label: 'Pro',
    ariaLabel: 'Pro tier',
    styles: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  'pro-addon': {
    label: 'Pro Add-on',
    ariaLabel: 'Pro add-on tier',
    styles: 'border border-blue-300 text-blue-600 bg-transparent dark:border-blue-600 dark:text-blue-400',
  },
  'upgrade-only': {
    label: 'Upgrade',
    ariaLabel: 'Upgrade only tier',
    styles: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    showLock: true,
  },
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export function TierBadge({ tier, size = 'md', className = '' }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={`
        inline-flex items-center gap-0.5 font-medium rounded-full whitespace-nowrap
        ${sizeStyles[size]}
        ${config.styles}
        ${className}
      `}
      aria-label={config.ariaLabel}
    >
      {config.showLock && <Lock className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
      {config.label}
    </span>
  );
}
