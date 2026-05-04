import { Fragment, type ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { cn } from './cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Hide the default close button (e.g. when footer has destructive confirm). */
  hideClose?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideClose = false,
}: ModalProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-base ease-studio-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-fast ease-studio-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-canvas/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition-all duration-base ease-studio-out"
              enterFrom="opacity-0 translate-y-2 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="transition-all duration-fast ease-studio-out"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full bg-surface-1 dark:bg-surface-d-1 rounded-studio-4 shadow-s3 border border-edge-soft dark:border-edge-d-soft overflow-hidden',
                  sizeClass[size],
                )}
              >
                {(title || !hideClose) && (
                  <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-edge-soft dark:border-edge-d-soft">
                    <div className="min-w-0 flex-1">
                      {title && <Dialog.Title className="studio-text-title-2">{title}</Dialog.Title>}
                      {description && (
                        <Dialog.Description className="studio-text-muted mt-1">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {!hideClose && (
                      <IconButton label="Close" variant="quiet" size="sm" onClick={onClose}>
                        <X />
                      </IconButton>
                    )}
                  </div>
                )}
                <div className="px-6 py-5">{children}</div>
                {footer && (
                  <div className="px-6 py-4 border-t border-edge-soft dark:border-edge-d-soft bg-surface-2 dark:bg-surface-d-2 flex items-center justify-end gap-2">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
