import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Home, Package, UserPlus } from 'lucide-react';

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
      icon: <Home className="w-5 h-5 text-blue-600" />,
      title: 'Job',
      description: 'This will create a card on the CRM board',
      onClick: () => {
        onNewJob();
        setIsOpen(false);
      }
    },
    {
      id: 'report',
      icon: <Package className="w-5 h-5 text-blue-600" />,
      title: 'Report',
      description: 'Get a measurement report in hours',
      onClick: () => {
        onNewReport();
        setIsOpen(false);
      }
    },
    {
      id: 'customer',
      icon: <UserPlus className="w-5 h-5 text-blue-600" />,
      title: 'Customer',
      description: 'Add new contacts to Roofr',
      onClick: () => {
        onNewCustomer();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
          <Plus className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium">New</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            {menuOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={option.onClick}
                className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 text-left"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                      {option.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {option.description}
                    </p>
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
