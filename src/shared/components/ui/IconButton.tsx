import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'quiet';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  /** REQUIRED for accessibility — passed to aria-label. */
  label: string;
  children: ReactNode;
}

const sizeClass: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
  md: 'w-9 h-9 [&>svg]:w-[18px] [&>svg]:h-[18px]',
  lg: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
};

const variantClass: Record<IconButtonVariant, string> = {
  ghost:     'text-ink-2 dark:text-ink-d-2 hover:bg-surface-2 dark:hover:bg-surface-d-2 hover:text-ink-1 dark:hover:text-ink-d-1',
  secondary: 'bg-surface-1 dark:bg-surface-d-1 border border-edge-base dark:border-edge-d-base shadow-s1 text-ink-1 dark:text-ink-d-1 hover:bg-surface-2 dark:hover:bg-surface-d-2',
  primary:   'bg-signal-500 text-white hover:bg-signal-600 active:bg-signal-700 shadow-s1',
  quiet:     'text-ink-3 dark:text-ink-d-3 hover:text-ink-1 dark:hover:text-ink-d-1',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'md', variant = 'ghost', label, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-studio-2 transition-colors duration-fast ease-studio-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-signal-500 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-canvas',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
