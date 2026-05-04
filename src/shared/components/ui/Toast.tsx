import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';
import { cn } from './cn';

export type ToastTone = 'neutral' | 'ok' | 'warn' | 'error' | 'info';

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastInternal extends Required<Pick<ToastOptions, 'tone' | 'duration'>> {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastOptions['action'];
}

interface ToastApi {
  push: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const toneIcon = {
  neutral: Info,
  ok: CheckCircle2,
  warn: AlertTriangle,
  error: AlertCircle,
  info: Info,
} as const;

const toneClass: Record<ToastTone, string> = {
  neutral: 'text-ink-2 dark:text-ink-d-2',
  ok:      'text-ok',
  warn:    'text-warn',
  error:   'text-signal-500',
  info:    'text-info',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (opts: ToastOptions): string => {
      const id = opts.id ?? `t-${++counter.current}`;
      const toast: ToastInternal = {
        id,
        title: opts.title,
        description: opts.description,
        tone: opts.tone ?? 'neutral',
        duration: opts.duration ?? 4500,
        action: opts.action,
      };
      setToasts((prev) => [...prev.filter((t) => t.id !== id), toast]);
      return id;
    },
    [],
  );

  const api = useMemo<ToastApi>(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastInternal; onDismiss: () => void }) {
  const Icon = toneIcon[toast.tone];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const t = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto min-w-[280px] max-w-[420px] rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 px-4 py-3 flex items-start gap-3 animate-studio-fade-up"
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', toneClass[toast.tone])} />
      <div className="min-w-0 flex-1">
        {toast.title && <div className="studio-text-body-strong">{toast.title}</div>}
        {toast.description && (
          <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 mt-0.5">
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
            className="mt-2 text-caption font-medium text-signal-500 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-ink-3 dark:text-ink-d-3 hover:text-ink-1 dark:hover:text-ink-d-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Soft-fall-through: if no provider mounted, log a warning and return no-ops
    // so legacy pages don't crash if they try to use toasts before ToastProvider
    // is mounted.
    return {
      push: (opts) => {
        if (typeof console !== 'undefined') console.warn('[Toast] No ToastProvider mounted', opts);
        return '';
      },
      dismiss: () => {},
    };
  }
  return ctx;
}
