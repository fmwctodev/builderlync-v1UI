import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  FolderOpen, Upload, Trash2, Download, FileText,
  File, RefreshCw
} from 'lucide-react';
import { fetchJobFiles, uploadJobFile, deleteJobFile, getJobFileDownloadUrl } from '../../../services/jobCamApi';
import type { JobFile, JobFileCategory } from '../../../types/jobCam';
import EmptyStateActionCard from '../../../components/job-cam/EmptyStateActionCard';
import { formatDistanceToNow } from 'date-fns';

const FILE_CATEGORIES: { value: JobFileCategory; label: string }[] = [
  { value: 'contract', label: 'Contract' },
  { value: 'permit', label: 'Permit' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'other', label: 'Other' },
];

const categoryColor: Record<JobFileCategory, string> = {
  contract: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  permit: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  invoice: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  inspection: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  insurance: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  warranty: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const fileIcon = (mimeType: string | null) => {
  if (mimeType?.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

interface Props {
  jobId: number;
}

const FilesTab: React.FC<Props> = ({ jobId }) => {
  const [files, setFiles] = useState<JobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<JobFileCategory>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobFiles(jobId);
      setFiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(selected)) {
        await uploadJobFile(file, { job_id: jobId, category: uploadCategory });
      }
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await deleteJobFile(id, jobId);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (file: JobFile) => {
    const url = getJobFileDownloadUrl(file.id, jobId);
    if (!url) return;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={20} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6 md:pb-24">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            {files.length} document{files.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value as JobFileCategory)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
            >
              {FILE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-md disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        {files.length === 0 ? (
          <EmptyStateActionCard
            icon={FolderOpen}
            title="No files yet"
            description="Upload contracts, permits, inspection documents, and other job files."
            actionLabel="Upload File"
            onAction={() => fileInputRef.current?.click()}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50 shadow-sm overflow-hidden">
              {files.map(file => {
                const Icon = fileIcon(file.mime_type);
                return (
                  <div 
                    key={file.id} 
                    onClick={() => handleDownload(file)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
                      <Icon size={22} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight">{file.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${categoryColor[file.category]}`}>
                          {file.category}
                        </span>
                        {file.file_size && (
                          <span className="text-xs font-medium text-gray-400">{formatFileSize(file.file_size)}</span>
                        )}
                        <span className="mx-2 text-gray-300 dark:text-gray-600 font-bold">&bull;</span>
                        <span className="text-xs font-medium text-gray-400">
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        className="p-2.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:scale-105"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                        className="p-2.5 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-lg text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all hover:scale-105"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

export default FilesTab;
