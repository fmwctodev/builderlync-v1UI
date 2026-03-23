import React from 'react';
import { Calendar, Repeat } from 'lucide-react';
import { RecurringInvoiceSchedule } from '../../../../shared/store/services/paymentsApi';

interface RecurringInvoicePanelProps {
  schedule: Partial<RecurringInvoiceSchedule> | null;
  onScheduleChange: (schedule: Partial<RecurringInvoiceSchedule> | null) => void;
}

const RecurringInvoicePanel: React.FC<RecurringInvoicePanelProps> = ({
  schedule,
  onScheduleChange
}) => {
  const defaultSchedule: Partial<RecurringInvoiceSchedule> = {
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    next_invoice_date: new Date().toISOString().split('T')[0],
    occurrences_completed: 0,
    is_active: true,
    is_paused: false
  };

  const currentSchedule = schedule || defaultSchedule;

  const updateSchedule = (field: keyof RecurringInvoiceSchedule, value: any) => {
    onScheduleChange({ ...currentSchedule, [field]: value });
  };

  const calculateNextDate = (startDate: string, frequency: string): string => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'annually':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (newStartDate: string) => {
    updateSchedule('start_date', newStartDate);
    const nextDate = calculateNextDate(newStartDate, currentSchedule.frequency || 'monthly');
    updateSchedule('next_invoice_date', nextDate);
  };

  const handleFrequencyChange = (newFrequency: string) => {
    updateSchedule('frequency', newFrequency);
    if (currentSchedule.start_date) {
      const nextDate = calculateNextDate(currentSchedule.start_date, newFrequency);
      updateSchedule('next_invoice_date', nextDate);
    }
  };

  const getDayOptions = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return days;
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Repeat className="text-blue-600 dark:text-blue-400" size={20} />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recurring Invoice Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frequency *
          </label>
          <select
            value={currentSchedule.frequency}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={currentSchedule.start_date}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(currentSchedule.frequency === 'weekly' || currentSchedule.frequency === 'biweekly') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week
            </label>
            <select
              value={currentSchedule.day_of_week || 1}
              onChange={(e) => updateSchedule('day_of_week', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday</option>
            </select>
          </div>
        )}

        {(currentSchedule.frequency === 'monthly' || currentSchedule.frequency === 'quarterly') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Month
            </label>
            <select
              value={currentSchedule.day_of_month || 1}
              onChange={(e) => updateSchedule('day_of_month', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getDayOptions()}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={currentSchedule.end_date || ''}
            onChange={(e) => updateSchedule('end_date', e.target.value || undefined)}
            min={currentSchedule.start_date}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Occurrences (Optional)
          </label>
          <input
            type="number"
            value={currentSchedule.total_occurrences || ''}
            onChange={(e) => updateSchedule('total_occurrences', e.target.value ? parseInt(e.target.value) : undefined)}
            min="1"
            placeholder="Leave empty for unlimited"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {currentSchedule.start_date && currentSchedule.next_invoice_date && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Schedule Preview</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            First invoice will be generated on{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(currentSchedule.start_date).toLocaleDateString()}
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Next invoice will be generated on{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(currentSchedule.next_invoice_date).toLocaleDateString()}
            </span>
          </p>
          {currentSchedule.end_date && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recurring invoices will stop after{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(currentSchedule.end_date).toLocaleDateString()}
              </span>
            </p>
          )}
          {currentSchedule.total_occurrences && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Will generate{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {currentSchedule.total_occurrences}
              </span>
              {' '}invoices total
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        The first invoice will be created immediately. Subsequent invoices will be generated automatically based on the schedule.
      </p>
    </div>
  );
};

export default RecurringInvoicePanel;
