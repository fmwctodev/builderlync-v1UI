import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadProgressModal({
  isOpen,
  onClose,
  fileName,
  progress,
  status,
  error
}: UploadProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'uploading' && <Upload className="h-5 w-5 text-primary-600" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {status === 'uploading' && 'Uploading File'}
              {status === 'success' && 'Upload Complete'}
              {status === 'error' && 'Upload Failed'}
            </h2>
          </div>
          {status !== 'uploading' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {fileName}
            </p>
            
            {status === 'uploading' && (
              <>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {progress}% complete
                </p>
              </>
            )}
            
            {status === 'success' && (
              <p className="text-sm text-green-600 dark:text-green-400">
                File uploaded successfully!
              </p>
            )}
            
            {status === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error || 'Upload failed. Please try again.'}
              </p>
            )}
          </div>

          {status !== 'uploading' && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}