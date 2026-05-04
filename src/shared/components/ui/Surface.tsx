import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

/**
 * Standard page hero — replaces today's per-module h1 + button row patterns.
 * Sits at the top of every Studio-reskinned page below the AppShell topbar.
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { title, subtitle, actions, eyebrow, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('flex items-end justify-between gap-6 pb-6 border-b border-edge-soft dark:border-edge-d-soft', className)}
      {...rest}
    >
      <div className="min-w-0">
        {eyebrow && <div className="studio-text-label mb-2">{eyebrow}</div>}
        <h1 className="studio-text-display truncate">{title}</h1>
        {subtitle && <div className="studio-text-muted mt-2">{subtitle}</div>}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
});

/** Standard page wrapper — applies Studio padding + max width. */
export function PageContainer({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-studio-page py-8 max-w-[1600px] mx-auto w-full', className)} {...rest}>
      {children}
    </div>
  );
}

/** Vertical section spacing — children separated by --section-gap. */
export function Section({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn('mt-studio-section first:mt-0', className)} {...rest}>
      {children}
    </section>
  );
}

/** Section header inside a page — quieter than PageHeader. */
export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}
export function SectionHeader({ title, description, actions, className, ...rest }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-4', className)} {...rest}>
      <div className="min-w-0">
        <h2 className="studio-text-title-1 truncate">{title}</h2>
        {description && <div className="studio-text-muted mt-1">{description}</div>}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}
