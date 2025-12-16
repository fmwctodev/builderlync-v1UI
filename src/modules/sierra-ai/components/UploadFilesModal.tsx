import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, AlertCircle, CheckCircle, File, Loader } from 'lucide-react';

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Array<{ id: string; name: string }>;
  onSuccess: (files: File[]) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function UploadFilesModal({
  isOpen,
  onClose,
  collections,
  onSuccess,
}: UploadFilesModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension && ['pdf', 'doc', 'docx'].includes(extension);
    });

    if (validFiles.length === 0) {
      setError('Please upload only PDF, DOC, or DOCX files');
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: isUploading,
  });

  if (!isOpen) return null;

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    if (!selectedCollection) {
      setError('Please select a collection');
      return;
    }

    setIsUploading(true);
    setError('');

    const initialFiles: UploadingFile[] = selectedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(initialFiles);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadingFiles(prev =>
          prev.map((uf, idx) =>
            idx === i ? { ...uf, progress: 50, status: 'uploading' } : uf
          )
        );

        await new Promise(resolve => setTimeout(resolve, 1000));

        setUploadingFiles(prev =>
          prev.map((uf, idx) =>
            idx === i ? { ...uf, progress: 100, status: 'completed' } : uf
          )
        );
      }

      setTimeout(() => {
        onSuccess(selectedFiles);
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFiles([]);
    setUploadingFiles([]);
    setSelectedCollection('');
    setError('');
    setIsUploading(false);
    onClose();
  };

  const allCompleted = uploadingFiles.length > 0 && uploadingFiles.every(f => f.status === 'completed');
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Files
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload files to your knowledge base to train your AI assistant.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isUploading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">
                Select Files
              </label>
              {selectedFiles.length === 0 && uploadingFiles.length === 0 ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                      {isDragActive ? 'Drop files here' : 'Drop files here or '}
                      {!isDragActive && (
                        <span className="text-red-600 dark:text-red-400">browse</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Supports PDF, DOC, DOCX
                    </p>
                  </div>
                </div>
              ) : uploadingFiles.length > 0 ? (
                <div className="space-y-3">
                  {uploadingFiles.map((uploadFile, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {uploadFile.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : uploadFile.status === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(uploadFile.file.size)}
                        </p>

                        {uploadFile.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div
                                className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadFile.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {uploadFile.status === 'completed' && 'Done'}
                        {uploadFile.status === 'uploading' && `${Math.round(uploadFile.progress)}%`}
                        {uploadFile.status === 'error' && 'Failed'}
                      </div>
                    </div>
                  ))}

                  {allCompleted && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-900 dark:text-green-200">
                          All files uploaded successfully!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    {...getRootProps()}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-red-400 dark:hover:border-red-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <input {...getInputProps()} />
                    + Add more files
                  </button>
                </div>
              )}
            </div>

            {selectedFiles.length > 0 && !isUploading && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collection
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                >
                  <option value="">Select a collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedFiles.length === 0 || isUploading || allCompleted}
              >
                Upload Files
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
