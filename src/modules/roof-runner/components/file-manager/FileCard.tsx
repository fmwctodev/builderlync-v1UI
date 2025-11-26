import { useState, useRef, useEffect } from 'react';
import { FileText, Image, MoreHorizontal, Trash2, Eye, Download } from 'lucide-react';
import { FileItem } from '../../../../shared/services/fileManagerApi';

interface FileCardProps {
  file: FileItem;
  onDelete: (fileId: number) => void;
}

export default function FileCard({ file, onDelete }: FileCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const getFileIcon = () => {
    if (file.mime_type.startsWith('image/')) {
      return <Image className="h-12 w-12 text-blue-400" />;
    } else if (file.mime_type === 'application/pdf') {
      return <FileText className="h-12 w-12 text-red-400" />;
    } else {
      return <FileText className="h-12 w-12 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = () => {
    setShowDropdown(false);
    // Preview is now shown directly on the card
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      onDelete(file.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-b border-gray-200 dark:border-gray-600 overflow-hidden">
        {file.mime_type.startsWith('image/') && file.file_path ? (
          <img 
            src={file.file_path.replace('/view?usp=drivesdk', '/preview').replace('/file/d/', '/uc?id=').replace('/view', '')}
            alt={file.filename} 
            className="object-cover w-full h-full" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : file.mime_type === 'application/pdf' && file.file_path ? (
          <iframe 
            src={file.file_path} 
            className="w-full h-full border-0"
            title={file.filename}
          />
        ) : null}
        <div className={`${file.mime_type.startsWith('image/') || file.mime_type === 'application/pdf' ? 'hidden' : ''}`}>
          {getFileIcon()}
        </div>
        
        {/* File size overlay */}
        <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-black bg-opacity-70 px-2 py-1 text-xs font-medium text-white">
          {formatFileSize(file.file_size)}
        </span>
      </div>

      {/* File Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-2">
            {file.filename}
          </span>
          <div className="relative">
            <button 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
              >
                <div className="py-1">
                  <button
                    onClick={handlePreview}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(file.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}