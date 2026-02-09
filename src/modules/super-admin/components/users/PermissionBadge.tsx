import React from 'react';
import { clsx } from 'clsx';
import { PermissionLevel } from '../../types';

interface PermissionBadgeProps {
  level: PermissionLevel;
  size?: 'sm' | 'md';
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({ level, size = 'sm' }) => {
  const getStyles = () => {
    switch (level) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'write':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'read':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'none':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    return size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium border rounded-full capitalize',
        getStyles(),
        getSizeClasses()
      )}
    >
      {level}
    </span>
  );
};
