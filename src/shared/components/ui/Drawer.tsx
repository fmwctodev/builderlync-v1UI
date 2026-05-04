import { Fragment, type ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Maximize2 } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from './cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Optional header content (rendered above body). */
  header?: ReactNode;
  /** Optional expand handler — when provided, an "expand" button appears next to close. */
  onExpand?: () => void;
  /** Drawer content. */
  children: ReactNode;
  /** Override the default 50% width. */
  widthClassName?: string;
  /** ARIA label fallback when no header is provided. */
  ariaLabel?: string;
}

export function Drawer({
  open,
  onClose,
  header,
  onExpand,
  children,
  widthClassName,
  ariaLabel,
}: DrawerProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose} aria-label={ariaLabel}>
        {/* Scrim */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-base ease-studio-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-fast ease-studio-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="studio-drawer-scrim" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-slow ease-studio-out"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-base ease-studio-out"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel
              className={cn(
                'studio-drawer-panel flex flex-col',
                widthClassName,
              )}
            >
              {/* Header bar — always rendered for close/expand affordances */}
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-edge-soft dark:border-edge-d-soft">
                <div className="min-w-0 flex-1">{header}</div>
                <div className="shrink-0 flex items-center gap-1">
                  {onExpand && (
                    <IconButton
                      label="Expand to full page"
                      variant="quiet"
                      size="sm"
                      onClick={onExpand}
                    >
                      <Maximize2 />
                    </IconButton>
                  )}
                  <IconButton
                    label="Close"
                    variant="quiet"
                    size="sm"
                    onClick={onClose}
                  >
                    <X />
                  </IconButton>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-studio">
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
