import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { formsApi } from '../services/formsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import type { FormSubmissionWithDetails } from '../types/forms';

export const FormSubmissions: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { currentOrganizationId: organizationId, currentOrganizationSlug: orgSlug } = useCurrentOrganization();
  const [submissions, setSubmissions] = useState<FormSubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionWithDetails | null>(
    null
  );

  useEffect(() => {
    if (formId) {
      loadSubmissions();
    }
  }, [formId, organizationId, statusFilter]);

  const loadSubmissions = async () => {
    if (!formId) return;

    try {
      setLoading(true);
      const { data, count } = await formsApi.getSubmissions(formId, organizationId, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      });
      setSubmissions(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!formId) return;

    try {
      const csv = await formsApi.exportSubmissions(formId, organizationId);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${formId}-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting submissions:', error);
      alert('Error exporting submissions');
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await formsApi.deleteSubmission(submissionId, organizationId);
      loadSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const searchLower = searchQuery.toLowerCase();
    const dataString = JSON.stringify(sub.submission_data).toLowerCase();
    return dataString.includes(searchLower);
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'error':
        return <XCircle className="text-red-500" size={18} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={18} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const basePath = orgSlug ? `/org/${orgSlug}` : '';
              navigate(`${basePath}/marketing`);
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Submissions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total submissions: {totalCount}
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download size={18} />
          <span>Export to CSV</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="processed">Processed</option>
          <option value="pending">Pending</option>
          <option value="error">Error</option>
        </select>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No submissions found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(submission.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white space-y-1">
                        {Object.entries(submission.submission_data)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        {Object.keys(submission.submission_data).length > 2 && (
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            View all fields
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded capitalize ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {submission.contact ? (
                        <a
                          href={`/contacts/${submission.contact_id}`}
                          className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <span>
                            {submission.contact.first_name} {submission.contact.last_name}
                          </span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-gray-400">Not created</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

const SubmissionDetailModal: React.FC<{
  submission: FormSubmissionWithDetails;
  onClose: () => void;
}> = ({ submission, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Submission Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Submitted on {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Form Data
            </h3>
            <div className="space-y-3">
              {Object.entries(submission.submission_data).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</p>
                  <p className="text-gray-900 dark:text-white mt-1">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {submission.metadata && Object.keys(submission.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Metadata
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                {Object.entries(submission.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                    <span className="text-gray-900 dark:text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submission.contact && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Created Contact
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white font-medium">
                  {submission.contact.first_name} {submission.contact.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {submission.contact.email}
                </p>
              </div>
            </div>
          )}

          {submission.error_message && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Error
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-900 dark:text-red-200">
                  {submission.error_message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
