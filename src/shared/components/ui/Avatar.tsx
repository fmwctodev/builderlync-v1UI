import { useMemo, type HTMLAttributes } from 'react';
import { cn } from './cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  src?: string | null;
  size?: AvatarSize;
  /** Override the auto-derived initials. */
  initials?: string;
}

const sizeClass: Record<AvatarSize, string> = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-[11px]',
  md: 'w-8 h-8 text-caption',
  lg: 'w-10 h-10 text-body',
};

/** Stable color hash so the same name renders the same neutral hue. */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

function deriveInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function Avatar({ name, src, size = 'md', initials, className, ...rest }: AvatarProps) {
  const text = initials ?? deriveInitials(name);

  const bg = useMemo(() => {
    if (!name) return 'hsl(220 6% 90%)';
    const h = nameToHue(name);
    return `hsl(${h} 18% 88%)`;
  }, [name]);

  const fg = useMemo(() => {
    if (!name) return 'hsl(220 6% 30%)';
    const h = nameToHue(name);
    return `hsl(${h} 22% 28%)`;
  }, [name]);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium select-none shrink-0',
        sizeClass[size],
        className,
      )}
      style={src ? undefined : { backgroundColor: bg, color: fg }}
      title={name ?? undefined}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name ?? ''} className="w-full h-full rounded-full object-cover" />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}

export interface AvatarStackProps {
  names: string[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarStack({ names, max = 3, size = 'sm', className }: AvatarStackProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;

  return (
    <div className={cn('inline-flex items-center -space-x-1.5', className)}>
      {visible.map((n, i) => (
        <Avatar
          key={`${n}-${i}`}
          name={n}
          size={size}
          className="ring-2 ring-surface-1 dark:ring-surface-d-1"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full ring-2 ring-surface-1 dark:ring-surface-d-1 bg-surface-2 dark:bg-surface-d-2 text-ink-3 dark:text-ink-d-3 font-medium font-mono',
            sizeClass[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
