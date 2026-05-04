import { type HTMLAttributes } from 'react';
import { cn } from './cn';

export interface KBDProps extends HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'md';
}

/**
 * Keyboard chip — used for Cmd-K hints, shortcuts, etc.
 * Always pass a single key per <KBD>; render a row of them for chords.
 */
export function KBD({ size = 'md', className, children, ...rest }: KBDProps) {
  return (
    <kbd
      className={cn(
        'studio-kbd font-mono',
        size === 'sm' && 'h-4 min-w-[1rem] px-0.5 text-[10px]',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}

/** Renders a sequence of keys with subtle separators ("⌘ K", "Ctrl Shift P"). */
export function KBDSequence({ keys, size = 'md', className }: { keys: string[]; size?: 'sm' | 'md'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((k, i) => (
        <KBD key={i} size={size}>{k}</KBD>
      ))}
    </span>
  );
}
