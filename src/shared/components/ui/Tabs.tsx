import { type ReactNode } from 'react';
import { cn } from './cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  count?: number;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div role="tablist" className={cn('studio-tabs overflow-x-auto scrollbar-studio', className)}>
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          type="button"
          disabled={item.disabled}
          aria-selected={value === item.id}
          data-active={value === item.id || undefined}
          data-disabled={item.disabled || undefined}
          onClick={() => !item.disabled && onChange(item.id)}
          className="studio-tab whitespace-nowrap"
        >
          {item.icon && (
            <span className="text-ink-3 dark:text-ink-d-3 [&>svg]:w-4 [&>svg]:h-4">
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
          {item.count !== undefined && item.count > 0 && (
            <span className="ml-0.5 text-caption text-ink-3 dark:text-ink-d-3 font-mono tabular-nums">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
