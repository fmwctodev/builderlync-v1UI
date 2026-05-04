import { cloneElement, isValidElement, useState, useRef, type ReactElement, type ReactNode } from 'react';
import { cn } from './cn';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  delay?: number;
  /** Use a single React element child — the tooltip wraps it. */
  children: ReactElement;
}

const sideClass: Record<TooltipSide, string> = {
  top:    'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left:   'right-full mr-2 top-1/2 -translate-y-1/2',
  right:  'left-full ml-2 top-1/2 -translate-y-1/2',
};

/**
 * Lightweight CSS-positioned tooltip. Not a full popper — adequate for
 * icon-button labels and rail link names. Use Headless UI Popover for
 * heavy interactive content.
 */
export function Tooltip({ content, side = 'bottom', delay = 240, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  if (!isValidElement(children)) return children;

  // Wrap the trigger with hover/focus listeners while preserving its own.
  const trigger = cloneElement(children as ReactElement<{
    onMouseEnter?: (e: unknown) => void;
    onMouseLeave?: (e: unknown) => void;
    onFocus?: (e: unknown) => void;
    onBlur?: (e: unknown) => void;
  }>, {
    onMouseEnter: (e: unknown) => {
      const orig = (children.props as { onMouseEnter?: (e: unknown) => void }).onMouseEnter;
      orig?.(e);
      show();
    },
    onMouseLeave: (e: unknown) => {
      const orig = (children.props as { onMouseLeave?: (e: unknown) => void }).onMouseLeave;
      orig?.(e);
      hide();
    },
    onFocus: (e: unknown) => {
      const orig = (children.props as { onFocus?: (e: unknown) => void }).onFocus;
      orig?.(e);
      show();
    },
    onBlur: (e: unknown) => {
      const orig = (children.props as { onBlur?: (e: unknown) => void }).onBlur;
      orig?.(e);
      hide();
    },
  });

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap pointer-events-none',
            'px-2 py-1 rounded-studio-1 bg-canvas dark:bg-surface-d-3 text-white text-caption shadow-s2',
            sideClass[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
