import React, { useState, useEffect } from 'react';
import { FileText, Settings, Plus, Search as SearchIcon } from 'lucide-react';
import PaymentDateRangeFilter from './PaymentDateRangeFilter';
import PaymentSearchBar from './PaymentSearchBar';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { fetchDocuments, getDocumentStats, Document } from '../../../../shared/store/services/paymentsApi';

const DocumentsContractsTab: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<string>('draft');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeStatus, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments({
        status: activeStatus,
        search: searchQuery,
      });
      setDocuments(data);

      const statsData = await getDocumentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusTabs = [
    { value: 'draft', label: 'Draft', count: stats?.draft || 0 },
    { value: 'waiting', label: 'Waiting for others', count: stats?.waiting || 0 },
    { value: 'completed', label: 'Completed', count: stats?.completed || 0 },
    { value: 'payments', label: 'Payments', count: stats?.payments || 0 },
    { value: 'archived', label: 'Archived', count: stats?.archived || 0 },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Documents & Contracts
              <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">
                (Proposals, Estimates & Contracts)
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and oversee all documents & contracts created for your business.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <PaymentDateRangeFilter />
          <PaymentSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeStatus === tab.value
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
              {activeStatus === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="Time to close a deal!"
            description="No drafts in sight! Ready to create a fresh proposal?"
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={doc.status} type="document" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {doc.customer_id || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(doc.date_modified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                        ${Number(doc.value).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsContractsTab;
