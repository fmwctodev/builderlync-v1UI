import React, { useState, useEffect } from 'react';
import { Upload, MoreHorizontal, ArrowUp, File as FileIcon, Download, Trash2, FileText, Check } from 'lucide-react';
import { fetchJobFiles, uploadJobFile, deleteJobFile } from '../services/jobCamApi';
import type { JobFile, JobFileCategory } from '../types/jobCam';

interface AttachmentsTabProps {
  jobId?: number;
}

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

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ jobId }) => {
  const [files, setFiles] = useState<JobFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<JobFileCategory>('other');
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const data = await fetchJobFiles(jobId);
      setFiles(data);
    } catch (error) {
      console.error('Error loading job files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [jobId]);

  const handleLocalFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected || selected.length === 0 || !jobId) return;

    try {
      setIsUploading(true);
      for (const file of Array.from(selected)) {
        await uploadJobFile(file, { job_id: jobId, category: uploadCategory });
      }
      await loadFiles();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading local file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = async (docId: string) => {
    if (!confirm('Delete this file?') || !jobId) return;
    try {
      setRemovingDocId(docId);
      await deleteJobFile(docId, jobId);
      setFiles(prev => prev.filter(f => f.id !== docId));
    } catch (error) {
      console.error('Error removing document:', error);
    } finally {
      setRemovingDocId(null);
    }
  };

  const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.includes('pdf')) return FileText;
    return FileIcon;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Job Documents</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              Synced with JobCam Files
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value as JobFileCategory)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold shadow-sm"
            >
              {FILE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <label
              className={`flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed text-transparent' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleLocalFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse font-mono">Loading Files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center bg-gray-50/30 dark:bg-gray-800/10">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <FileIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">No files synchronized</h3>
            <p className="text-sm text-gray-500 font-medium max-w-xs">
              All documents uploaded here or in the JobCam mobile app will appear in this list.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                {files.length} Document{files.length !== 1 ? 's' : ''} Found
              </span>
              <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {files.map((file) => {
                const Icon = getFileIcon(file.mime_type);
                const isRemoving = removingDocId === file.id;
                
                return (
                  <div
                    key={file.id}
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="group bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200/20 dark:hover:shadow-none hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                      <Icon className="w-7 h-7 text-primary-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate uppercase tracking-tight">
                          {file.file_name}
                        </p>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest ${categoryColor[file.category] || categoryColor.other}`}>
                          {file.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                          {file.id.startsWith('att_') ? 'Attachment' : 'Cloud File'}
                        </p>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <p className="text-xs font-medium text-gray-400">
                          {formatFileSize(file.file_size)}
                        </p>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <p className="text-xs font-medium text-gray-400">
                          {new Date(file.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); window.open(file.file_url, '_blank'); }}
                        className="p-3 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Download / Open"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveDocument(file.id); }}
                        disabled={isRemoving}
                        className="p-3 bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Remove"
                      >
                        {isRemoving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="p-2 ml-2 group-hover:hidden">
                       <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsTab;
