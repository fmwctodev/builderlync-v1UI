import { Fragment, useState, type ReactNode } from 'react';
import { Combobox as HCombobox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface ComboboxOption<T = string> {
  value: T;
  label: string;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps<T = string> {
  value: T | null;
  onChange: (value: T) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  /** Custom filter — defaults to includes match on `label`. */
  filter?: (query: string, option: ComboboxOption<T>) => boolean;
}

export function Combobox<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Search…',
  disabled = false,
  invalid = false,
  className,
  filter,
}: ComboboxProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = query === ''
    ? options
    : options.filter((o) =>
        filter
          ? filter(query, o)
          : o.label.toLowerCase().includes(query.toLowerCase()),
      );

  return (
    <HCombobox value={value as T} onChange={onChange} disabled={disabled}>
      <div className={cn('relative', className)}>
        <div className="relative">
          <HCombobox.Input
            displayValue={(v: T | null) => {
              if (v == null) return '';
              return options.find((o) => o.value === v)?.label ?? '';
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'studio-input pr-9',
              invalid && 'border-signal-500',
            )}
          />
          <HCombobox.Button className="absolute inset-y-0 right-2 flex items-center px-1 text-ink-3 dark:text-ink-d-3">
            <ChevronDown className="w-4 h-4" />
          </HCombobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-fast"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <HCombobox.Options className="absolute z-50 mt-1.5 w-full max-h-72 overflow-auto rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 py-1 focus:outline-none">
            {filtered.length === 0 && (
              <div className="px-3 py-3 studio-text-caption text-ink-3 dark:text-ink-d-3">
                No results.
              </div>
            )}
            {filtered.map((opt) => (
              <HCombobox.Option
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                className={({ active, disabled: dis }) =>
                  cn(
                    'flex items-center gap-2 px-3 h-10 cursor-pointer select-none',
                    active && 'bg-surface-2 dark:bg-surface-d-2',
                    dis && 'opacity-40 cursor-not-allowed',
                  )
                }
              >
                {({ selected: sel }) => (
                  <>
                    {opt.icon && (
                      <span className="text-ink-3 dark:text-ink-d-3 [&>svg]:w-4 [&>svg]:h-4">
                        {opt.icon}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="studio-text-body text-ink-1 dark:text-ink-d-1 truncate">
                        {opt.label}
                      </div>
                      {opt.description && (
                        <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                    {sel && <Check className="w-4 h-4 text-signal-500 shrink-0" />}
                  </>
                )}
              </HCombobox.Option>
            ))}
          </HCombobox.Options>
        </Transition>
      </div>
    </HCombobox>
  );
}
