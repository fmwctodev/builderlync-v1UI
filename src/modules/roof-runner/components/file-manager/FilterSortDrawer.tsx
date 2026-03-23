import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSortDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function FilterSortDrawer({ isOpen, onClose, onApply }: FilterSortDrawerProps) {
  const [appliedFilters] = useState(['Upload date (newest)']);
  const [sortBy, setSortBy] = useState('uploadDateNewest');
  const [fileTypes, setFileTypes] = useState({ pdf: false, image: false });
  const [sortOpen, setSortOpen] = useState(true);
  const [fileTypeOpen, setFileTypeOpen] = useState(true);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({ sortBy, fileTypes });
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Filter & sort</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Applied filters</h3>
            <div className="flex flex-wrap gap-2">
              {appliedFilters.map((filter, index) => (
                <span key={index} className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center justify-between w-full text-md font-semibold text-gray-800 py-2"
            >
              Sort by
              {sortOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {sortOpen && (
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                {[
                  { value: 'fileSizeLargest', label: 'File size (largest)' },
                  { value: 'fileSizeSmallest', label: 'File size (smallest)' },
                  { value: 'uploadDateNewest', label: 'Upload date (newest)' },
                  { value: 'uploadDateOldest', label: 'Upload date (oldest)' },
                  { value: 'fileNameAZ', label: 'File name (A-Z)' },
                  { value: 'fileNameZA', label: 'File name (Z-A)' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={() => setSortBy(option.value)}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setFileTypeOpen(!fileTypeOpen)}
              className="flex items-center justify-between w-full text-md font-semibold text-gray-800 py-2"
            >
              File type
              {fileTypeOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {fileTypeOpen && (
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fileTypes.pdf}
                    onChange={(e) => setFileTypes({ ...fileTypes, pdf: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2">PDF</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fileTypes.image}
                    onChange={(e) => setFileTypes({ ...fileTypes, image: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2">Image</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleApply}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}