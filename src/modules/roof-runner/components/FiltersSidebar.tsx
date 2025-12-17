import React from 'react';
import { X } from 'lucide-react';

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const assignees = [
    'Anchor Dwyer', 'Austin Queen', 'Avery Zhao', 'Brendan Mullins', 'Chris Debayle',
    'Dorian Mendivil', 'Erin Haws', 'Ethan Lintz', 'Garrett Jones', 'Giulia Johnson',
    'Hayley Parks', 'JEFFREY JONES', 'Jacob Cox', 'Jake Webb', 'James Wolfgang Kuntz',
    'Joey G', 'Kirk White', 'Lexus Oliver', 'Luis Torres', 'Nicholas Wnukowski',
    'Nick X', 'Ralph Nevarez', 'Ray Aguilus', 'Richard Endruschat', 'Sean Richard',
    'Willy Hill'
  ];

  const stages = [
    'New lead', 'Appointment scheduled', 'Appointment run', 'Adjuster Meeting Scheduled',
    'Adjuster Meeting Complete', 'Under Service Agreement/Contin', 'Estimate Received',
    'Proposal sent/presented', 'Proposal follow-up', 'Reinspection', 'Public Adjuster',
    'Proposal signed/Pre-Production', 'Supplementing', 'Pre-production', 'Materials Ordered',
    'Production', 'Post-production', 'Payments/Invoicing', 'Post-job completion follow-up',
    'Job completed', 'Lost', 'Unqualified'
  ];

  const leadSources = [
    'Unassigned', 'Antonio', 'Billboard/Print Ad', 'CAI', 'Call Center', 'Call In',
    'Chive', 'Clive', 'Customer referral', 'DEMO - IE', 'Door', 'Door hanger',
    'Door knocking', 'Existing Relationship', 'Facebook', 'Goodwin', 'Google',
    'GutterMaxx', 'Home Advisor', 'Instagram', 'Insurance Agent Referral', 'Light',
    'Mailer', 'Nadine', 'Omar', 'Realestate referral', 'Referral - Kammie', 'REI',
    'Repeat Customer', 'Roof Engine', 'The Roofing Broker', 'Thumbtack', 'Torus',
    'Website', 'Website - IE', 'Yard Sign', 'Yelp'
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sort</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Filters */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected filters</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">None</p>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort by</h4>
          <div className="space-y-2">
            {[
              'Last updated (newest)', 'Last updated (oldest)', 'Created date (newest)',
              'Created date (oldest)', 'Close date (newest)', 'Close date (oldest)',
              'Address (alphabetical)', 'Value (higher)', 'Value (lower)',
              'Time in stage (newest)', 'Time in stage (oldest)'
            ].map(option => (
              <label key={option} className="flex items-center">
                <input type="radio" name="sort" className="mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assignees & Job Owner */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Assignees & Job owner</h4>
          <div className="flex space-x-2 mb-3">
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {assignees.map(assignee => (
              <label key={assignee} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{assignee}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stages */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Stages</h4>
          <div className="flex space-x-2 mb-3">
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">2 workflows hidden</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm">🏠 Default</span>
              <span className="text-sm">🧰 Awaiting Adjuster Inspection</span>
            </div>
            {stages.map(stage => (
              <label key={stage} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{stage}</span>
                <span className="ml-auto text-xs">🏠 🧰</span>
              </label>
            ))}
          </div>
        </div>

        {/* Updated Date */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Updated date</h4>
          <div className="space-y-2">
            {[
              'Today', 'Last 7 days', 'Last 4 weeks', 'Last 3 months',
              'Last 6 months', 'Last 12 months', 'Month to date',
              'Quarter to date', 'Year to date'
            ].map(option => (
              <label key={option} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Close Date */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Close date</h4>
          <div className="space-y-2">
            {[
              'Last 7 days', 'Last 4 weeks', 'Last 3 months', 'Last 6 months',
              'Last 12 months', 'Month to date', 'Quarter to date', 'Year to date'
            ].map(option => (
              <label key={option} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Lead sources</h4>
          <div className="flex space-x-2 mb-3">
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select all</button>
            <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Select none</button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Unassigned</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Jobs that have no lead source</p>
              </div>
            </label>
            {leadSources.slice(1).map(source => (
              <label key={source} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;