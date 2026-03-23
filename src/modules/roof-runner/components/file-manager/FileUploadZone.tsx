import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, File } from 'lucide-react';
import { filesApi } from '../../../../shared/services/filesApi';

interface FileUploadZoneProps {
  folderId: string | null;
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FileUploadZone({ folderId, onUploadComplete, onClose }: FileUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);

    const initialFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(initialFiles);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];

      try {
        await filesApi.uploadFile(file, folderId, (progress, fileName) => {
          setUploadingFiles(prev =>
            prev.map(uf =>
              uf.file.name === fileName
                ? { ...uf, progress, status: progress === 100 ? 'completed' : 'uploading' }
                : uf
            )
          );
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadingFiles(prev =>
          prev.map(uf =>
            uf.file.name === file.name
              ? { ...uf, status: 'error', error: 'Upload failed' }
              : uf
          )
        );
      }
    }

    setIsUploading(false);

    setTimeout(() => {
      onUploadComplete();
    }, 1000);
  }, [folderId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading
  });

  const allCompleted = uploadingFiles.length > 0 && uploadingFiles.every(f => f.status === 'completed');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Files</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {uploadingFiles.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                or click to browse your computer
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                All file types supported • No file size limit
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadingFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {uploadFile.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : uploadFile.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <File className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(uploadFile.file.size)}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <span className="text-red-600 ml-2">{uploadFile.error}</span>
                      )}
                    </p>

                    {uploadFile.status === 'uploading' && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
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
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900 dark:text-green-200">
                      All files uploaded successfully!
                    </p>
                  </div>
                </div>
              )}

              {!isUploading && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
