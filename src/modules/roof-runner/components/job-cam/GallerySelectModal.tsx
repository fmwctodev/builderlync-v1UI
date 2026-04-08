import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Search, RefreshCw, FolderOpen, Plus } from 'lucide-react';
import { fetchJobGalleries, createJobGallery } from '../../services/jobCamApi';

interface Gallery {
  id: string;
  name: string;
  photo_count: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (galleryId: string) => void;
  jobId: number;
}

const GallerySelectModal: React.FC<Props> = ({ open, onClose, onSelect, jobId }) => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchJobGalleries(jobId);
      setGalleries(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, jobId]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createJobGallery(jobId, { name: newName.trim() });
      setNewName('');
      setShowCreate(false);
      onSelect(res.id || res.data?.id);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  const filtered = galleries.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600">
              <FolderPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Add to Gallery</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Select target collection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search galleries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 mb-6 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <RefreshCw size={24} className="animate-spin text-primary-500" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Galleries...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <FolderOpen size={32} className="mx-auto text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">No galleries found</p>
              </div>
            ) : (
              filtered.map(g => (
                <button
                  key={g.id}
                  onClick={() => onSelect(g.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group text-left shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-primary-500 transition-colors">
                      <FolderOpen size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">{g.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{g.photo_count || 0} items</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {showCreate ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
              <input
                type="text"
                placeholder="New gallery name..."
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border b-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3 font-bold"
              />
              <div className="flex gap-2">
                <button
                  disabled={creating || !newName.trim()}
                  onClick={handleCreate}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl py-2 text-xs font-bold uppercase tracking-widest shadow-md transition-all"
                >
                  {creating ? 'Creating...' : 'Create & Select'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50/20 transition-all font-bold text-xs uppercase tracking-[0.1em]"
            >
              <Plus size={16} />
              Create New Gallery
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GallerySelectModal;
