import { Fragment, type ReactNode } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number = string> {
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

export function Select<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  invalid = false,
  className,
}: SelectProps<T>) {
  const selected = options.find((o) => o.value === value);

  return (
    <Listbox value={value as T} onChange={onChange} disabled={disabled}>
      <div className={cn('relative', className)}>
        <Listbox.Button
          className={cn(
            'studio-input flex items-center justify-between text-left',
            invalid && 'border-signal-500',
            'data-[headlessui-state~="open"]:border-signal-500 data-[headlessui-state~="open"]:shadow-signal-ring',
          )}
        >
          <span className={cn('truncate', !selected && 'text-ink-4 dark:text-ink-d-4')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-ink-3 dark:text-ink-d-3 shrink-0 ml-2" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-fast"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-50 mt-1.5 w-full max-h-72 overflow-auto rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 py-1 focus:outline-none">
            {options.map((opt) => (
              <Listbox.Option
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                className={({ active, selected: sel, disabled: dis }) =>
                  cn(
                    'flex items-center gap-2 px-3 h-9 cursor-pointer select-none',
                    active && 'bg-surface-2 dark:bg-surface-d-2',
                    sel && 'text-ink-1 dark:text-ink-d-1',
                    !sel && 'text-ink-2 dark:text-ink-d-2',
                    dis && 'opacity-40 cursor-not-allowed',
                  )
                }
              >
                {({ selected: sel }) => (
                  <>
                    <span className="w-4 shrink-0">
                      {sel && <Check className="w-4 h-4 text-signal-500" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="studio-text-body truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="studio-text-caption text-ink-3 dark:text-ink-d-3 truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
