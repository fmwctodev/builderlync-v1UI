import { FileText, Image, MoreHorizontal } from 'lucide-react';

interface File {
  id: string;
  name: string;
  type: string;
  pages: number;
  thumbnail: string;
}

interface FileCardProps {
  file: File;
}

export default function FileCard({ file }: FileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative group">
      {/* Checkbox */}
      <input
        type="checkbox"
        className="absolute top-2 left-2 h-4 w-4 rounded border-gray-300 text-[#dc2626] focus:ring-[#dc2626]"
      />

      {/* Thumbnail */}
      <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-b border-gray-200 dark:border-gray-600 overflow-hidden">
        {file.thumbnail ? (
          <img src={file.thumbnail} alt={file.name} className="object-cover w-full h-full" />
        ) : (
          file.type === 'pdf' ? (
            <FileText className="h-12 w-12 text-gray-400" />
          ) : (
            <Image className="h-12 w-12 text-gray-400" />
          )
        )}
        {file.pages && file.pages > 1 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center rounded-full bg-black bg-opacity-70 px-2.5 py-0.5 text-xs font-medium text-white">
            1 of {file.pages}
          </span>
        )}
      </div>

      {/* File Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center overflow-hidden">
          {file.type === 'pdf' ? (
            <FileText className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
          ) : (
            <Image className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 flex-shrink-0">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}