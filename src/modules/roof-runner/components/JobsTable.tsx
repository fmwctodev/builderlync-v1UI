import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Job } from '../../../shared/store/services/jobsApi';

interface JobsTableProps {
  jobs: Job[];
  loading: boolean;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({ jobs, loading, onView, onEdit, onDelete }) => {
  const headers = [
    'Last updated', 'Time in stage', 'Address', 'Contact', 'Value',
    'Workflow', 'Stage', 'Close date', 'Lead source', 'Assignees',
    'Job owner', 'Tasks', 'Reports', 'Proposals', 'Actions'
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {headers.map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                      ${job.jobValue?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-red-700 dark:text-primary-300 px-2 py-1 rounded">
                        🏠 {job.workflowStages}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.workflowStages}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {job.closeDate ? new Date(job.closeDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.source || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {job.jobOwner ? job.jobOwner.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.jobOwner || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">0</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView(job)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="View job details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(job)}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-red-400"
                          title="Edit job"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(job.id!)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobsTable;