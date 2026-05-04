import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Home, Package, UserPlus } from 'lucide-react';
import { Button } from '../../../shared/components/ui';

interface MenuOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

interface NewButtonDropdownProps {
  onNewJob: () => void;
  onNewReport: () => void;
  onNewCustomer: () => void;
}

const NewButtonDropdown: React.FC<NewButtonDropdownProps> = ({
  onNewJob,
  onNewReport,
  onNewCustomer
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const menuOptions: MenuOption[] = [
    {
      id: 'job',
      icon: <Home className="w-4 h-4" />,
      title: 'Job',
      description: 'Create a new job',
      onClick: () => {
        onNewJob();
        setIsOpen(false);
      }
    },
    {
      id: 'report',
      icon: <Package className="w-4 h-4" />,
      title: 'Report',
      description: 'Create a report',
      onClick: () => {
        onNewReport();
        setIsOpen(false);
      }
    },
    {
      id: 'customer',
      icon: <UserPlus className="w-4 h-4" />,
      title: 'Customer',
      description: 'Add a new contact',
      onClick: () => {
        onNewCustomer();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="primary"
        leadingIcon={<Plus />}
        trailingIcon={<ChevronDown className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        New
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 z-50 rounded-studio-3 bg-surface-1 dark:bg-surface-d-1 border border-edge-soft dark:border-edge-d-soft shadow-s2 overflow-hidden">
          <div className="py-1">
            {menuOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.onClick}
                className="w-full px-3 py-2.5 hover:bg-surface-2 dark:hover:bg-surface-d-2 transition-colors duration-fast text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-studio-1 bg-signal-100 text-signal-ink dark:bg-signal-500/15 dark:text-signal-100 flex-shrink-0">
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="studio-text-body-strong">
                      {option.title}
                    </div>
                    <div className="studio-text-caption text-ink-3 dark:text-ink-d-3">
                      {option.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewButtonDropdown;
