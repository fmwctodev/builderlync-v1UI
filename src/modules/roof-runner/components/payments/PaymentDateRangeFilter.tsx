import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

interface PaymentDateRangeFilterProps {
  onDateChange?: (startDate: string, endDate: string) => void;
}

const PaymentDateRangeFilter: React.FC<PaymentDateRangeFilterProps> = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (onDateChange && date && endDate) {
      onDateChange(date, endDate);
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (onDateChange && startDate && date) {
      onDateChange(startDate, date);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          placeholder="Start Date"
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400" />

      <div className="relative">
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          placeholder="End Date"
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default PaymentDateRangeFilter;
