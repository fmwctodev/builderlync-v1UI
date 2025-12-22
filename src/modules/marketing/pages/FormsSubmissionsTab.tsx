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
import Toast from '../../../shared/components/Toast';
import type { MarketingForm, FormSubmissionWithDetails } from '../types/forms';

export const FormsSubmissionsTab: React.FC = () => {
  const { currentOrganizationId: organizationId } = useCurrentOrganization();
  const [forms, setForms] = useState<MarketingForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmissionWithDetails | null>(
    null
  );
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadForms();
  }, [organizationId]);

  useEffect(() => {
    if (selectedForm) {
      loadSubmissions();
    } else {
      setSubmissions([]);
      setTotalCount(0);
      setLoading(false);
    }
  }, [selectedForm, startDate, endDate, currentPage, itemsPerPage]);

  const loadForms = async () => {
    try {
      const data = await formsApi.getForms(organizationId);
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const loadSubmissions = async () => {
    if (!selectedForm) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data, count } = await formsApi.getAllSubmissions(organizationId, {
        formId: selectedForm,
        startDate,
        endDate,
        page: currentPage,
        perPage: itemsPerPage,
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
    if (!selectedForm || totalCount === 0) return;

    try {
      const response = await formsApi.exportSubmissions(selectedForm, organizationId, startDate, endDate);
      setToast({ type: 'success', message: 'Export is being processed. You will receive an email with the download link within 5 minutes.' });
    } catch (error) {
      console.error('Error exporting submissions:', error);
      setToast({ type: 'error', message: 'Error exporting submissions' });
    }
  };

  const handleRefresh = () => {
    loadSubmissions();
  };

  const handleFormChange = (formId: string) => {
    setSelectedForm(formId);
    setCurrentPage(1);
  };

  const getFieldHeaders = () => {
    if (submissions.length === 0) return [];
    const firstSubmission = submissions[0];
    const data = firstSubmission.submissionData || firstSubmission.submission_data || firstSubmission.data || {};
    return Object.keys(data).filter(key => key !== 'metadata');
  };

  const fieldHeaders = getFieldHeaders();
  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
          disabled={!selectedForm || totalCount === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedForm}
              onChange={(e) => handleFormChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 min-w-[200px]"
            >
              <option value="">Select a form</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
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
              disabled={!selectedForm}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!selectedForm}
              className="bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={!selectedForm}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {!selectedForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select a Form
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please select a form from the dropdown above to view submissions
            </p>
          </div>
        </div>
      ) : (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                S.No
              </th>
              {fieldHeaders.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {header}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {submissions.map((submission, index) => {
              const data = submission.submissionData || submission.submission_data || submission.data || {};
              const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr
                  key={submission.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                    {serialNumber}
                  </td>
                  {fieldHeaders.map((header) => (
                    <td key={header} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {String(data[header] || '-')}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(submission.submittedAt || submission.created_at || '').toUTCString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

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
    </>
  );
};

const SubmissionDetailModal: React.FC<{
  submission: FormSubmissionWithDetails;
  onClose: () => void;
}> = ({ submission, onClose }) => {
  const data = submission.submissionData || submission.submission_data || submission.data || {};
  const entries = Object.entries(data).filter(([key]) => key !== 'metadata');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
            Submitted on {new Date(submission.submittedAt || submission.created_at).toUTCString()}
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
