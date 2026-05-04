import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export type ChipTone = 'neutral' | 'signal' | 'ok' | 'warn' | 'info';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const toneClass: Record<ChipTone, string> = {
  neutral: 'bg-surface-2 dark:bg-surface-d-2 text-ink-2 dark:text-ink-d-2 border-edge-soft dark:border-edge-d-soft',
  signal:  'studio-chip-signal',
  ok:      'bg-ok/10 text-ok border-ok/20',
  warn:    'bg-warn/10 text-warn border-warn/20',
  info:    'bg-info/10 text-info border-info/20',
};

export function Chip({
  tone = 'neutral',
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 h-6 rounded-studio-1 border text-caption font-medium whitespace-nowrap',
        toneClass[tone],
        className,
      )}
      {...rest}
    >
      {leadingIcon && <span className="[&>svg]:w-3 [&>svg]:h-3">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className="[&>svg]:w-3 [&>svg]:h-3">{trailingIcon}</span>}
    </span>
  );
}
