import React, { useState, useEffect } from 'react';
import { FolderPlus, Upload, Search, ChevronDown, MoreHorizontal, Folder, ArrowUp, File } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttachmentsByJobId, Attachment } from '../../../shared/store/services/attachmentsApi';

interface AttachmentsTabProps {
  jobId?: number;
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ jobId }) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAttachmentsByJobId(jobId);
        if (response.success) {
          setAttachments(response.data);
        }
      } catch (error) {
        console.error('Error fetching attachments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, [jobId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Attachments</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
              <FolderPlus className="w-4 h-4" />
              <span>Folder</span>
            </button>
            <button 
              onClick={() => navigate(`/org/${orgSlug}/file-manager`)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm">
              <span>File type</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm">
              <span>Sort by</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <ArrowUp className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload attachments</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Drag and drop or <button className="text-primary-600 hover:text-primary-700 underline">click here</button> to upload files
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Maximum file size is 20 MB</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-primary-500" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{attachment.file_name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(attachment.file_size)} • {new Date(attachment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsTab;