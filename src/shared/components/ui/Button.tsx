import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'quiet';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:   'studio-btn-primary',
  secondary: 'studio-btn-secondary',
  ghost:     'studio-btn-ghost',
  quiet:     'studio-btn-quiet',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'studio-btn-sm',
  md: 'studio-btn-md',
  lg: 'studio-btn-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      className={cn(
        'studio-btn',
        sizeClass[size],
        variantClass[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin" />
      ) : (
        leadingIcon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{leadingIcon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {trailingIcon && !loading && (
        <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{trailingIcon}</span>
      )}
    </button>
  );
});
