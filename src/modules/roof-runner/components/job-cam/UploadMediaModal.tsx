import React, { useState, useRef } from 'react';
import { X, Upload, Image, CheckCircle } from 'lucide-react';
import type { PhotoCategory, PhotoPhase } from '../../types/jobCam';

interface UploadFile {
  file: File;
  preview: string;
  category: PhotoCategory | null;
  phase: PhotoPhase | null;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onUpload: (files: UploadFile[]) => Promise<void>;
}

const CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'during', label: 'During' },
  { value: 'after', label: 'After' },
  { value: 'damage', label: 'Damage' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'completion', label: 'Completion' },
  { value: 'claim', label: 'Claim' },
];

const UploadMediaModal: React.FC<Props> = ({ open, onClose, onUpload }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [batchCategory, setBatchCategory] = useState<PhotoCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: UploadFile[] = Array.from(selected).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      category: batchCategory,
      phase: null,
      description: '',
    }));
    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const updateFile = (index: number, patch: Partial<UploadFile>) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, ...patch } : f));
  };

  const applyBatchCategory = (cat: PhotoCategory) => {
    setBatchCategory(cat);
    setFiles(prev => prev.map(f => ({ ...f, category: cat })));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await onUpload(files);
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Photos</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Click or drag photos here</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, HEIC up to 50MB each</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {files.length > 0 && (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Batch Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => applyBatchCategory(c.value)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        batchCategory === c.value
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square">
                    <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-white" />
                    </button>
                    {f.category && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded capitalize">
                        {f.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={files.length === 0 || uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload size={14} />
                  Upload {files.length > 0 ? `(${files.length})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { type UploadFile };
export default UploadMediaModal;
