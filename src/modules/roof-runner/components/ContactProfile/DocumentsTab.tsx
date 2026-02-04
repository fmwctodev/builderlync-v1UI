import React, { useState, useEffect } from 'react';
import { File, Search, Trash2, Download } from 'lucide-react';
import { contactModulesApi, ContactDocument } from '../../../../shared/store/services/contactModulesApi';
import { DocumentModal } from './DocumentModal';

interface DocumentsTabProps {
  contactId: number;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ contactId }) => {
  const [documents, setDocuments] = useState<ContactDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Internal', value: 'internal' },
    { label: 'Sent', value: 'sent' },
    { label: 'Received', value: 'received' }
  ];

  const fetchDocuments = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const filterValue = activeFilter === 'all' ? undefined : activeFilter;
      const response = await contactModulesApi.getDocuments(contactId, filterValue);
      // Handle paginated response structure: response.data.data
      const docs = response.data?.data || response.data || [];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [contactId, activeFilter]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await contactModulesApi.deleteDocument(id);
        fetchDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeFilter === filter.value ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            + Add
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <File className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[200px]">
                      {doc.originalFilename}
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => doc.id && handleDelete(doc.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
              <File size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              No documents found
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Upload files to keep them organized
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-sm transition-colors"
            >
              Upload Document
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <DocumentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchDocuments();
            setShowModal(false);
          }}
          contactId={contactId}
        />
      )}
    </>
  );
};

export default DocumentsTab;