import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply hover lift (translateY + s2 shadow). */
  interactive?: boolean;
  /** Render as a sunken surface (used inside drawers / nested contexts). */
  sunken?: boolean;
  /** Drop the default padding. */
  flush?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, sunken = false, flush = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-studio-3 border border-edge-soft dark:border-edge-d-soft transition-all duration-base ease-studio-out',
        sunken
          ? 'bg-surface-2 dark:bg-surface-d-2 shadow-none'
          : 'bg-surface-1 dark:bg-surface-d-1 shadow-s1',
        interactive && 'cursor-pointer hover:shadow-s2 hover:-translate-y-px',
        !flush && 'p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { title, description, actions, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4 mb-4', className)}
      {...rest}
    >
      <div className="min-w-0 flex-1">
        {title && <div className="studio-text-title-2 truncate">{title}</div>}
        {description && <div className="studio-text-muted mt-0.5">{description}</div>}
        {children}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
});

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn('studio-text-body', className)} {...rest}>
        {children}
      </div>
    );
  },
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'mt-4 pt-4 border-t border-edge-soft dark:border-edge-d-soft flex items-center justify-end gap-2',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
