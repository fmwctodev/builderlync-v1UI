import { type ReactNode } from 'react';
import { cn } from './cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  /** Render inline (smaller padding) for use inside cards/drawers. */
  inline?: boolean;
}

/**
 * Empty state — used everywhere a list/table has no content.
 * Pair with a clear primary CTA so the user knows what to do next.
 */
export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  inline = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        inline ? 'py-10' : 'py-16',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-4 inline-flex items-center justify-center rounded-studio-3 bg-surface-2 dark:bg-surface-d-2 text-ink-3 dark:text-ink-d-3',
            inline ? 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5' : 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6',
          )}
        >
          {icon}
        </div>
      )}
      <div className="studio-text-title-3">{title}</div>
      {description && (
        <div className="studio-text-muted mt-1 max-w-md">{description}</div>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex items-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
