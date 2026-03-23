import React from 'react';

interface GlobalSchedulingSectionProps {
  schedulingLink: string;
  onSchedulingLinkChange: (link: string) => void;
}

export const GlobalSchedulingSection: React.FC<GlobalSchedulingSectionProps> = ({
  schedulingLink,
  onSchedulingLinkChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Scheduling
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add a link to your calendar. Customers will be directed from the link in your contact card.
          </p>
        </div>

        <div className="flex-1">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Add a scheduling link
          </label>
          <input
            type="text"
            value={schedulingLink}
            onChange={(e) => onSchedulingLinkChange(e.target.value)}
            placeholder="Add a link from Calendly, Google Calendar, Doodle, etc"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};
