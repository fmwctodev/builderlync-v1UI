import React from 'react';
import { clsx } from 'clsx';
import { RoleScope } from '../../types';
import { Globe, Building2 } from 'lucide-react';

interface ScopeBadgeProps {
  scope: RoleScope;
  size?: 'sm' | 'md';
}

export const ScopeBadge: React.FC<ScopeBadgeProps> = ({ scope, size = 'sm' }) => {
  const isGlobal = scope === 'global';

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium border rounded-full capitalize',
        isGlobal
          ? 'bg-red-100 text-red-800 border-red-200'
          : 'bg-orange-100 text-orange-800 border-orange-200',
        sizeClasses
      )}
    >
      {isGlobal ? (
        <Globe className={iconSize} />
      ) : (
        <Building2 className={iconSize} />
      )}
      {scope}
    </span>
  );
};
