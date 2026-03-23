import React from 'react';
import type { StaffMember } from '../../types/instantEstimatorSettings';

interface GlobalDefaultJobOwnerSectionProps {
  staffMembers: StaffMember[];
  selectedOwnerId: string | null;
  onOwnerChange: (ownerId: string | null) => void;
}

export const GlobalDefaultJobOwnerSection: React.FC<GlobalDefaultJobOwnerSectionProps> = ({
  staffMembers,
  selectedOwnerId,
  onOwnerChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Default job owner
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The default assignee will be assigned to every new lead that is created from instant estimators.
          </p>
        </div>

        <div className="flex-1">
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
            Default job owner
          </label>
          <select
            value={selectedOwnerId || ''}
            onChange={(e) => onOwnerChange(e.target.value || null)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a team member</option>
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.first_name} {staff.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
