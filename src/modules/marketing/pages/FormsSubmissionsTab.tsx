import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Settings2,
  RefreshCw,
  Eye,
  Copy,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { formsApi } from '../services/formsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { errorLogging } from '../../../shared/services/errorLogging';
import type { MarketingForm, FormSubmissionWithDetails } from '../types/forms';

export const FormsSubmissionsTab: React.FC = () => {
  const { currentOrganizationId: organizationId } = useCurrentOrganization();
  const [forms, setForms] = useState<MarketingForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('2025-11-09');
  const [endDate, setEndDate] = useState('2025-12-09');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionWithDetails | null>(
    null
  );

  useEffect(() => {
    loadForms();
    loadSubmissions();
  }, [organizationId]);

  const loadForms = async () => {
    try {
      const data = await formsApi.getForms(organizationId);
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, count } = await formsApi.getAllSubmissions(organizationId, {
        limit: 100,
      });
      setSubmissions(data);
      setTotalCount(count);
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load submissions';
      setError(errorMessage);
      console.error('Error loading submissions:', err);

      await errorLogging.logError('form_submissions_load_error', errorMessage, {
        error: err instanceof Error ? err : undefined,
        organizationId,
        context: {
          tab: 'submissions',
          retryCount,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    loadSubmissions();
  };

  const handleExport = async () => {
    console.log('Export submissions');
  };

  const handleRefresh = () => {
    loadSubmissions();
  };

  const toggleFormSelection = (formId: string) => {
    if (formId === 'all') {
      setSelectedForms([]);
    } else {
      setSelectedForms((prev) =>
        prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
      );
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = searchQuery
      ? JSON.stringify(sub.submission_data).toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesForm =
      selectedForms.length === 0 ? true : selectedForms.includes(sub.form_id);
    return matchesSearch && matchesForm;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-red-500',
      'bg-pink-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Failed to Load Submissions
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {error}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw size={18} />
                  <span>Retry</span>
                </button>
                {retryCount > 0 && (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Retry attempt: {retryCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submissions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Effortlessly Review, Manage, and Export Form Submissions
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowFormDropdown(!showFormDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-sm">
                {selectedForms.length === 0 ? 'All Forms' : `${selectedForms.length} selected`}
              </span>
              <ChevronDown size={16} />
            </button>

            {showFormDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => toggleFormSelection('all')}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-sm"
                  >
                    <span className="text-gray-900 dark:text-white">All Forms</span>
                    {selectedForms.length === 0 && (
                      <span className="text-red-600">✓</span>
                    )}
                  </button>
                  {forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => toggleFormSelection(form.id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-sm"
                    >
                      <span className="text-gray-900 dark:text-white">{form.name}</span>
                      {selectedForms.includes(form.id) && (
                        <span className="text-red-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {totalCount} Submissions
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Settings2 size={18} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Manage Columns</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedSubmissions.map((submission) => {
              const contactName = submission.contact
                ? `${submission.contact.first_name} ${submission.contact.last_name}`
                : 'Unknown Contact';

              return (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                        contactName
                      )}`}
                    >
                      {getInitials(contactName)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {contactName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>✉</span>
                      <span>{submission.contact?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>items per page</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="px-4 py-1 bg-red-600 text-white rounded text-sm font-medium">
            {currentPage}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300"
          >
            Last
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
      </div>

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
            Submitted on {new Date(submission.created_at).toLocaleString()}
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
        </div>
      </div>
    </div>
  );
};
