import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderOpen, Plus, Search, 
  Trash2, Calendar, Image as ImageIcon,
  ChevronRight, RefreshCw, ChevronLeft
} from 'lucide-react';
import { 
  fetchJobGalleries, 
  createJobGallery, 
  deleteJobGallery,
  fetchGalleryItems
} from '../../../services/jobCamApi';
import { format } from 'date-fns';

interface Gallery {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  photo_count?: number;
  cover_photo_url?: string;
  share_token?: string;
}

interface GalleriesTabProps {
  jobId: number;
}

const GalleriesTab: React.FC<GalleriesTabProps> = ({ jobId }) => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGalleryName, setNewGalleryName] = useState('');
  const [creating, setCreating] = useState(false);

  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobGalleries(jobId);
      setGalleries(data || []);
    } catch (e) {
      console.error('Failed to load galleries:', e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const handleGalleryClick = async (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setLoadingItems(true);
    try {
      const data = await fetchGalleryItems(gallery.id);
      setGalleryItems(data || []);
    } catch (e) {
      console.error('Failed to load gallery items:', e);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCreate = async () => {
    if (!newGalleryName.trim()) return;
    setCreating(true);
    try {
      await createJobGallery(jobId, {
        name: newGalleryName.trim()
      });
      setNewGalleryName('');
      setShowCreateModal(false);
      load();
    } catch (e) {
      console.error('Failed to create gallery:', e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this gallery?')) return;
    try {
      await deleteJobGallery(id);
      if (selectedGallery?.id === id) {
        setSelectedGallery(null);
      }
      load();
    } catch (e) {
      console.error('Failed to delete gallery:', e);
    }
  };

  const filtered = galleries.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedGallery) {
    return (
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedGallery(null)}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-primary-600 transition-all hover:shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{selectedGallery.name}</h2>
            <p className="text-sm text-gray-500 font-medium">
              {galleryItems.length} Photo{galleryItems.length !== 1 ? 's' : ''} in collection
            </p>
          </div>
          <button
            onClick={() => {
              // Usually handled via PhotosTab multi-select, 
              // but we can offer a direct upload or photo picker here.
              alert('Use the Photos tab to select and add existing photos to this gallery.');
            }}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md"
          >
            <Plus size={18} />
            Add Photos
          </button>
        </div>

        {loadingItems ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw size={32} className="animate-spin text-primary-500" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Loading Content...</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <ImageIcon size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">Gallery is empty</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
              Add photos to this gallery from the Photos tab to share them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {galleryItems.map(item => {
              const media = item.media || {};
              // Build the full URL based on the logic in jobCamApi
              let url = media.thumbnail_url || media.file_url;
              if (url && !url.startsWith('http')) {
                // Support legacy GCS relative paths if still present
                url = `https://storage.googleapis.com/builderlync-test/${url.startsWith('/') ? url.slice(1) : url}`;
              }

              return (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group relative">
                  <img 
                    src={url} 
                    alt={media.file_name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-bold truncate">{media.file_name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search galleries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md whitespace-nowrap"
        >
          <Plus size={18} />
          New Gallery
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw size={32} className="animate-spin text-primary-500" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Collections...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
            <FolderOpen size={32} className="text-gray-300 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No galleries found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
            Create organized collections of photos to share with clients or insurance adjusters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(gallery => (
            <div
              key={gallery.id}
              onClick={() => handleGalleryClick(gallery)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all border-b-4 border-b-transparent hover:border-b-primary-600 cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative">
                {gallery.cover_photo_url ? (
                  <img src={gallery.cover_photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={(e) => handleDelete(gallery.id, e)}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-400 hover:text-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider">
                    {gallery.photo_count || 0} Photos
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                  {gallery.name}
                </h4>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={12} />
                    {format(new Date(gallery.created_at), 'MMM d, yyyy')}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderOpen className="text-primary-500" />
              New Gallery
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gallery Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newGalleryName}
                  onChange={e => setNewGalleryName(e.target.value)}
                  placeholder="e.g. Damage Assessment, Completion..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newGalleryName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-md disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Gallery'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleriesTab;
