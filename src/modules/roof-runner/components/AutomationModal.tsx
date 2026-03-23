import { useState } from 'react';
import { X } from 'lucide-react';

export default function AutomationModal({ onClose }: { onClose: () => void }) {
  const [automationName, setAutomationName] = useState('');
  const [frequency, setFrequency] = useState('everyTime');
  const [enabled, setEnabled] = useState(true);

  const handleSave = () => {
    console.log({ automationName, frequency });
    onClose();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Create Custom Automation</h2>
        
        {/* Automation Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Automation Name
          </label>
          <input
            type="text"
            placeholder="Enter automation name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#dc2626] focus:border-[#dc2626]"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
          />
        </div>
        
        {/* Enable Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`${
              enabled ? "bg-[#dc2626]" : "bg-gray-200 dark:bg-gray-600"
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span
              className={`${
                enabled ? "translate-x-6" : "translate-x-1"
              } inline-block h-5 w-5 transform rounded-full bg-white shadow transition`}
            />
          </button>
        </div>
      </div>

      {/* If Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">If...</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condition</label>
            <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="" disabled>Select condition</option>
              <option>Job stage changes</option>
              <option>Time elapsed</option>
              <option>Customer action</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Value</label>
            <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="" disabled>Select value</option>
              <option>Payments/Invoicing</option>
              <option>Qualified</option>
              <option>Won</option>
            </select>
          </div>
        </div>
      </div>

      {/* Then Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Then...</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
            <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="" disabled>Select action</option>
              <option>Send email</option>
              <option>Create task</option>
              <option>Update job stage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target</label>
            <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="" disabled>Select target</option>
              <option>Customer</option>
              <option>Team member</option>
              <option>Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibbold text-gray-900 dark:text-white mb-3">Options</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This automation happens...</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFrequency('everyTime')}
              className={`py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                frequency === 'everyTime' ? 'bg-[#dc2626] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Every time
            </button>
            <button
              onClick={() => setFrequency('oncePerJob')}
              className={`py-3 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                frequency === 'oncePerJob' ? 'bg-[#dc2626] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Only once per job
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onClose}
          className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 text-sm font-medium text-white bg-[#dc2626] border border-transparent rounded-md shadow-sm hover:bg-red-700"
        >
          Create automation
        </button>
      </div>
    </div>
  );
}