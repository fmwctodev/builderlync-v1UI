import React from 'react';
import { CheckSquare, Square, Briefcase, Star, Shield } from 'lucide-react';
import type { JobPhoto, ReviewStatus } from '../../types/jobCam';

interface Props {
  photo: JobPhoto;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

const reviewBadge: Record<ReviewStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const MediaCard: React.FC<Props> = ({ photo, selected, onSelect, onClick }) => (
  <div
    className={`relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square cursor-pointer border-2 transition-all ${
      selected
        ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900'
        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
    }`}
    onClick={onClick}
  >
    <img
      src={photo.thumbnail_url ?? photo.file_url}
      alt={photo.description ?? photo.file_name}
      className="w-full h-full object-cover"
      onError={e => {
        const el = e.target as HTMLImageElement;
        el.style.display = 'none';
        el.parentElement!.classList.add('flex', 'items-center', 'justify-center');
      }}
    />

    <button
      className="absolute top-2 left-2 z-10"
      onClick={e => { e.stopPropagation(); onSelect(); }}
    >
      {selected ? (
        <CheckSquare size={18} className="text-primary-500 drop-shadow-md" />
      ) : (
        <Square size={18} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
      )}
    </button>

    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <p className="text-white text-xs font-medium truncate">{photo.description ?? photo.file_name}</p>
      <div className="flex gap-1 mt-1 flex-wrap">
        {photo.category && (
          <span className="text-xs px-1.5 py-0.5 rounded text-white/90 bg-white/20 font-medium capitalize">
            {photo.category}
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${reviewBadge[photo.review_status]}`}>
          {photo.review_status}
        </span>
      </div>
    </div>

    <div className="absolute top-2 right-2 flex flex-col gap-1">
      {photo.is_claim_relevant && (
        <div title="Claim relevant" className="w-5 h-5 rounded bg-orange-500/90 flex items-center justify-center">
          <Briefcase size={11} className="text-white" />
        </div>
      )}
      {photo.is_marketing_approved && (
        <div title="Marketing approved" className="w-5 h-5 rounded bg-green-500/90 flex items-center justify-center">
          <Star size={11} className="text-white" />
        </div>
      )}
      {photo.is_customer_shareable && (
        <div title="Customer shareable" className="w-5 h-5 rounded bg-primary-500/90 flex items-center justify-center">
          <Shield size={11} className="text-white" />
        </div>
      )}
    </div>
  </div>
);

export default MediaCard;
