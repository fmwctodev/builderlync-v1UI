import React from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Job } from '../../../shared/store/services/jobsApi';
import { hasPermission } from '../../../shared/utils/permissions';

interface JobsTableProps {
  jobs: Job[];
  loading: boolean;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
  currentPage: number;
  totalPages: number;
  totalJobs: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  loading,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalJobs,
  pageSize,
  onPageChange,
}) => {
  const headers = [
    'Job ID', 'Last updated', 'Time in stage', 'Address', 'Contact', 'Value',
    'Workflow', 'Stage', 'Close date', 'Lead source', 'Assignees',
    'Job owner', 'Tasks', 'Reports', 'Proposals', 'Actions'
  ];

  const startItem = totalJobs === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalJobs);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
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
                    <td colSpan={16} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => onEdit(job)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        #{job.id ?? 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">-</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {job.customer ? job.customer.full_name : job.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                        ${job.jobValue?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-primary-300 px-2 py-1 rounded">
                          🏠 {job.jobType || 'residential'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded whitespace-nowrap">
                          {job.workflowStages || job.workflow_stages || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {job.closeDate ? new Date(job.closeDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{job.source || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-1">
                          {job.assigneeUsers && job.assigneeUsers.length > 0 ? (
                            job.assigneeUsers.slice(0, 3).map((user) => (
                              <div
                                key={user.id}
                                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800"
                                title={`${user.first_name} ${user.last_name}`}
                              >
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </div>
                            ))
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                              -
                            </div>
                          )}
                          {job.assigneeUsers && job.assigneeUsers.length > 3 && (
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-800">
                              +{job.assigneeUsers.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {job.jobOwnerUser ? `${job.jobOwnerUser.first_name} ${job.jobOwnerUser.last_name}` : 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{(job as any).tasksCount || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{(job as any).reportsCount || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{(job as any).proposalsCount || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onView(job)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="View job details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission('jobs', 'update') && (
                            <button
                              onClick={() => onEdit(job)}
                              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-blue-400"
                              title="Edit job"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('jobs', 'delete') && (
                            <button
                              onClick={() => onDelete(job.id!)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Pagination footer */}
      {totalJobs > 0 && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{startItem}–{endItem}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalJobs.toLocaleString()}</span> jobs
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return page;
              }).map(page => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className={`w-8 h-8 text-sm font-medium rounded-md transition ${
                    page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsTable;
