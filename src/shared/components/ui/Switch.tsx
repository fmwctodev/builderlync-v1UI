import { Switch as HSwitch } from '@headlessui/react';
import { cn } from './cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
  return (
    <HSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'group inline-flex items-center h-5 w-9 rounded-full transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-signal-500 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-canvas',
        checked ? 'bg-signal-500' : 'bg-surface-3 dark:bg-surface-d-3',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block w-4 h-4 rounded-full bg-white shadow-s1 transition-transform duration-fast ease-studio-out',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </HSwitch>
  );
}
