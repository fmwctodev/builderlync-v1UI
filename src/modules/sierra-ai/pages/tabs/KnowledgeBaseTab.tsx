import React, { useState, useEffect } from 'react';
import { Globe, FileText, Type, Search, Library, HelpCircle, Table, Trash2 } from 'lucide-react';
import { ImportFromUrlModal } from '../../components/ImportFromUrlModal';
import { UploadFilesModal } from '../../components/UploadFilesModal';
import { AddFAQModal } from '../../components/AddFAQModal';
import { AddTableModal } from '../../components/AddTableModal';
import { mockKbCollections } from '../../lib/mockData';
import { knowledgeBaseApi } from '../../services/knowledgeBaseApi';

export function KnowledgeBaseTab() {
  const [organizationId, setOrganizationId] = useState(() => {
    return localStorage.getItem('organization_id') || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [qaPairs, setQaPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQAPairs = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const data = await knowledgeBaseApi.getQAPairs(organizationId);
      setQaPairs(data);
    } catch (error) {
      console.error('Error fetching Q&A pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQAPairs();
  }, [organizationId]);

  const handleDeleteQA = async (id: string) => {
    try {
      await knowledgeBaseApi.deleteQAPair(id);
      fetchQAPairs();
    } catch (error) {
      console.error('Error deleting Q&A pair:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Knowledge Base</h2>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <Globe className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add URL</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Files</span>
          </button>

          <button
            onClick={() => setShowFAQModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add FAQ</span>
          </button>

          <button
            onClick={() => setShowTableModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <Table className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Table</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Knowledge Base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <span>+ Type</span>
          </button>
        </div>
      </div>

      {/* Q&A Pairs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : qaPairs.length === 0 ? (
          <div className="p-12">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Library className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No FAQs found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You don't have any FAQs yet. Click "Add FAQ" to create one.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {qaPairs.map((qa) => (
              <div key={qa.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Q:</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{qa.question_pattern}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">A:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{qa.answer}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQA(qa.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ImportFromUrlModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        collections={mockKbCollections}
        onSuccess={(result) => {
          console.log('Import successful:', result);
          setShowImportModal(false);
        }}
      />

      <UploadFilesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        collections={mockKbCollections}
        onSuccess={(files) => {
          console.log('Files uploaded:', files);
          setShowUploadModal(false);
        }}
      />

      <AddFAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        collections={mockKbCollections}
        organizationId={organizationId || '00000000-0000-0000-0000-000000000000'}
        onSuccess={() => {
          fetchQAPairs();
          setShowFAQModal(false);
        }}
      />

      <AddTableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        collections={mockKbCollections}
        onSuccess={() => {
          console.log('Table added successfully');
          setShowTableModal(false);
        }}
      />
    </div>
  );
}
