import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Camera, Download, 
  ExternalLink, Maximize2, X, Clock, Shield
} from 'lucide-react';
import { fetchPublicShareDetails } from '../services/jobCamApi';
import type { JobPhoto } from '../types/jobCam';
import { format } from 'date-fns';

const PublicGallery: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<JobPhoto | null>(null);

  useEffect(() => {
    if (token) {
      loadDetails();
    }
  }, [token]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const result = await fetchPublicShareDetails(token!);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load shared gallery:', err);
      setError(err.message || 'The gallery link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Initializing Secure Gallery...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <Shield size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
          {error || 'We could not find the gallery you are looking for. It may have been revoked or moved.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { link, media = [] } = data;
  const photos = media as JobPhoto[];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider">
                  Shared Gallery
                </span>
                <span className="text-gray-300 dark:text-gray-700 mx-1">/</span>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  {link.share_mode} Access
                </span>
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                {link.recipient_label || 'Shared Project Media'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block mr-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered By</p>
                <p className="text-xs font-black italic text-primary-600">BuilderLync</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 hover:text-primary-600 transition-all shadow-sm"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Info */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
              This gallery contains the visual documentation for your project. You can view, download, and share these assets as needed.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <Camera size={18} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Photos</p>
                  <p className="text-sm font-bold">{photos.length} Captured Assets</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <Clock size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shared On</p>
                  <p className="text-sm font-bold">{format(new Date(link.created_at), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-2xl transition-all duration-500"
            >
              <img 
                src={photo.thumbnail_url || photo.file_url} 
                alt={photo.file_name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">
                  {photo.category || 'Asset'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-bold text-sm truncate pr-2">
                    {photo.file_name}
                  </p>
                  <Maximize2 size={16} className="text-white flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/10 rounded-xl">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{selectedPhoto.file_name}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  {selectedPhoto.category} • {format(new Date(selectedPhoto.capture_date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={selectedPhoto.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <ExternalLink size={20} />
              </a>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 flex items-center justify-center p-6 sm:p-12">
            <img 
              src={selectedPhoto.file_url} 
              alt={selectedPhoto.file_name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500"
            />
          </div>

          <div className="p-12 text-center text-white/20 font-black uppercase tracking-[0.3em] select-none pointer-events-none">
            Securely Shared via BuilderLync
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-24 text-center border-t border-gray-100 dark:border-gray-800">
        <p className="text-gray-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          Secured By BuilderLync Technology Group
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </div>
      </footer>
    </div>
  );
};

export default PublicGallery;
