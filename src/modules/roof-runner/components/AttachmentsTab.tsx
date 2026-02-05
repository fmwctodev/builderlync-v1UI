import React, { useState, useEffect } from 'react';
import { FolderPlus, Upload, Search, MoreHorizontal, ArrowUp, File, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cloudDriveApi } from '../../../shared/services/cloudDriveApi';
import { backendFilesApi, FileRecord } from '../../../shared/services/backendFilesApi';
import { getJobById, updateJobAttachmentsIds } from '../../../shared/store/services/jobsApi';

interface AttachmentsTabProps {
  jobId?: number;
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ jobId }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [attachments, setAttachments] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const [documents, setDocuments] = useState<FileRecord[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentSearch, setDocumentSearch] = useState('');
  const [attachmentsIds, setAttachmentsIds] = useState<number[]>([]);
  const [previewItem, setPreviewItem] = useState<FileRecord | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connection = await cloudDriveApi.getCurrentUserConnection();
        setIsConnected(!!connection);
      } catch (error) {
        console.error('Error checking cloud connection:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    const fetchJobAttachmentsIds = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const response = await getJobById(jobId);
        const job = response.data || response;
        const ids = job?.attachmentsId || job?.attachments_id || [];
        setAttachmentsIds(Array.isArray(ids) ? ids : []);
        const docs = job?.attachmentsDocuments || [];
        setAttachments(Array.isArray(docs) ? docs : []);
      } catch (error) {
        console.error('Error loading job attachments ids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAttachmentsIds();
  }, [jobId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImageFile = (mimeType?: string) => {
    return !!mimeType && mimeType.startsWith('image/');
  };

  const isPdfFile = (mimeType?: string) => {
    return !!mimeType && mimeType.includes('pdf');
  };

  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError(null);
      const result = await backendFilesApi.getFiles(null);
      setDocuments(result.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocumentsError('Failed to load documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleAttachDocument = async (doc: FileRecord) => {
    if (!jobId) return;
    try {
      const nextIds = Array.from(new Set([...attachmentsIds, doc.id]));
      setAttachmentsIds(nextIds);
      await updateJobAttachmentsIds(jobId, nextIds);
      setAttachments([doc, ...attachments]);
      setShowDocumentPicker(false);
    } catch (error) {
      console.error('Error attaching document:', error);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(documentSearch.toLowerCase()) ||
    doc.original_filename?.toLowerCase().includes(documentSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => {
                setShowDocumentPicker(true);
                loadDocuments();
              }}
              className="flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Attach from existing</span>
            </button> */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDocumentPicker(true);
                  loadDocuments();
                }}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Attach</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search/Filter bar removed for now */}

      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <ArrowUp className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No attachments yet</h3>
            {isConnected ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Attach files from your connected cloud drive.
                </p>
                <button
                  onClick={() => {
                    setShowDocumentPicker(true);
                    loadDocuments();
                  }}
                  className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Attach from existing</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your cloud drive to attach files.
                </p>
                <button
                  onClick={() => {
                    if (!orgSlug) return;
                    navigate(`/org/${orgSlug}/file-manager`);
                  }}
                  className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Connect Cloud Drive</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {isImageFile(attachment.mime_type) ? (
                    <img
                      src={attachment.file_path}
                      alt={attachment.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <File className="w-10 h-10 text-primary-500" />
                  )}
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {attachment.filename}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewItem(attachment)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Preview
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDocumentPicker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDocumentPicker(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select from existing</h3>
              <button
                onClick={() => setShowDocumentPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {documentsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : documentsError ? (
                <div className="text-sm text-red-600 dark:text-red-400">{documentsError}</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  No documents found.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="w-4 h-4 text-primary-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.filename}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.mime_type}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAttachDocument(doc)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Attach
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewItem.filename}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {previewItem.mime_type}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {isImageFile(previewItem.mime_type) ? (
                <div className="w-full max-h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={previewItem.file_path}
                    alt={previewItem.filename}
                    className="max-h-[70vh] w-auto object-contain"
                  />
                </div>
              ) : isPdfFile(previewItem.mime_type) ? (
                <div className="w-full h-[70vh] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={previewItem.file_path}
                    className="w-full h-full"
                    title={previewItem.filename}
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Preview not available for this file type.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentsTab;
