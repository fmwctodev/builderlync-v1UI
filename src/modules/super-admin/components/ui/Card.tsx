import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  footer,
  children,
  className,
  hoverable = false,
  bordered = true,
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg',
        bordered && 'border border-gray-200',
        'shadow-sm',
        hoverable && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};
