import React from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

interface AccountFiltersProps {
  search: string;
  status: string;
  plan: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPlanChange: (value: string) => void;
}

export const AccountFilters: React.FC<AccountFiltersProps> = ({
  search,
  status,
  plan,
  onSearchChange,
  onStatusChange,
  onPlanChange,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'trial', label: 'Trial' },
    { value: 'past_due', label: 'Past Due' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const planOptions = [
    { value: 'all', label: 'All Plans' },
    { value: 'Starter', label: 'Starter' },
    { value: 'Pro', label: 'Pro' },
    { value: 'Enterprise', label: 'Enterprise' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              status === option.value
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <select
        value={plan}
        onChange={(e) => onPlanChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
      >
        {planOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
