import React from 'react';
import { Lead } from '../../types';

interface LeadsListProps {
  leads: Lead[];
}

export const LeadsList: React.FC<LeadsListProps> = ({ leads }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'proposal': return 'bg-primary-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Leads</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ${lead.value.toLocaleString()}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};