import { type ReactNode, useId } from 'react';
import { cn } from './cn';

export interface FieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Accepts a single form input (Input/Textarea/Select). The id is auto-wired. */
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
  className?: string;
}

/**
 * Studio form field — label-above pattern.
 * Wraps an input element and manages id/aria wiring.
 *
 * Usage:
 *   <Field label="Address" required error={errors.address?.message}>
 *     {(props) => <Input {...props} {...register('address')} />}
 *   </Field>
 */
export function Field({ label, description, error, required, children, className }: FieldProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="studio-text-label">
          {label}
          {required && <span className="ml-0.5 text-signal-500">*</span>}
        </label>
      )}
      {description && (
        <div id={descId} className="studio-text-caption text-ink-3 dark:text-ink-d-3">
          {description}
        </div>
      )}
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {error && (
        <div id={errId} className="studio-text-caption text-signal-500" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
