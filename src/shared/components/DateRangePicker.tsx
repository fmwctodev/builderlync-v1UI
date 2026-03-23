import { useState } from 'react';
import { Calendar } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
];

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  const getDateRange = (preset: typeof presets[number]): DateRange => {
    const endDate = new Date();
    let startDate = new Date();

    if ('days' in preset) {
      startDate.setDate(endDate.getDate() - preset.days);
    } else if (preset.value === 'this-month') {
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    } else if (preset.value === 'last-month') {
      startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
      endDate.setDate(0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handlePresetClick = (preset: typeof presets[number]) => {
    onChange(getDateRange(preset));
    setShowPresets(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="date"
            value={value.startDate}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          />
          <span className="text-gray-500 dark:text-gray-400">to</span>
          <input
            type="date"
            value={value.endDate}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Presets
          </button>

          {showPresets && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPresets(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="py-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
