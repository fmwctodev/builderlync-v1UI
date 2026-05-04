import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Render numerics in mono. */
  numeric?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, numeric = false, leadingIcon, trailingIcon, className, ...rest },
  ref,
) {
  if (leadingIcon || trailingIcon) {
    return (
      <div className="relative">
        {leadingIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-ink-3 dark:text-ink-d-3 [&>svg]:w-4 [&>svg]:h-4 pointer-events-none">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            'studio-input',
            leadingIcon && 'pl-9',
            trailingIcon && 'pr-9',
            numeric && 'font-mono tabular-nums',
            invalid && 'border-signal-500 focus:border-signal-500 focus:shadow-signal-ring',
            className,
          )}
          {...rest}
        />
        {trailingIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-ink-3 dark:text-ink-d-3 [&>svg]:w-4 [&>svg]:h-4 pointer-events-none">
            {trailingIcon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'studio-input',
        numeric && 'font-mono tabular-nums',
        invalid && 'border-signal-500 focus:border-signal-500 focus:shadow-signal-ring',
        className,
      )}
      {...rest}
    />
  );
});
