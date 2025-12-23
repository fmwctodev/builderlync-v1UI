import React from 'react';
import { X, Download } from 'lucide-react';

interface CsvUploadModalProps {
  show: boolean;
  selectedFile: File | null;
  uploadLoading: boolean;
  onClose: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  show,
  selectedFile,
  uploadLoading,
  onClose,
  onFileSelect,
  onUpload,
}) => {
  if (!show) return null;

  const handleDownloadSample = () => {
    const csvContent = `fullName,type,labelOrRole,email,phone,company,address,latitude,longitude
John Doe,customer,Homeowner,john.doe@example.com,(555) 123-4567,ABC Company,"123 Main St, City, State 12345",40.7128,-74.0060
Jane Smith,lead,Property Manager,jane.smith@example.com,(555) 987-6543,XYZ Corp,"456 Oak Ave, Town, State 67890",34.0522,-118.2437`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Import Contacts from CSV
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select CSV File
              </label>
              <button
                onClick={handleDownloadSample}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Download className="w-3 h-3" />
                Download Sample
              </button>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {selectedFile && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                Selected: {selectedFile.name}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            <p className="font-medium mb-1">Required columns:</p>
            <p>fullName, type, labelOrRole, email, phone, company, address, latitude, longitude</p>
            <p className="mt-2 text-gray-400">Type options: lead, customer, partner, vendor, sub-contractor, adjuster, staff</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!selectedFile || uploadLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadLoading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadModal;