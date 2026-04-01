import React from 'react';
import { Camera, Clock, MapPin, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { JobWithMediaSummary } from '../../types/jobCam';

interface Props {
  job: JobWithMediaSummary;
  onClick: () => void;
}

const JobCard: React.FC<Props> = ({ job, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
  >
    <div className="relative h-36 bg-gray-100 dark:bg-gray-700">
      {job.latest_photo_url ? (
        <img
          src={job.latest_photo_url}
          alt={job.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Camera size={32} className="text-gray-300 dark:text-gray-600" />
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-1.5">
        <span className="flex items-center gap-1 text-xs bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
          <Camera size={10} />
          {job.photo_count}
        </span>
        {job.pending_review_count > 0 && (
          <span className="flex items-center gap-1 text-xs bg-amber-500/90 text-white px-2 py-0.5 rounded-full font-medium">
            <Clock size={10} />
            {job.pending_review_count}
          </span>
        )}
      </div>
    </div>

    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {job.name}
          </h3>
          {job.location && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 truncate">
              <MapPin size={10} className="flex-shrink-0" />
              {job.location}
            </p>
          )}
        </div>
        <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>

      <div className="flex items-center gap-3 mt-3">
        {job.contact_name && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {job.contact_name}
          </span>
        )}
        {job.latest_photo_date && (
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">
            {formatDistanceToNow(new Date(job.latest_photo_date), { addSuffix: true })}
          </span>
        )}
      </div>

      {job.checklist_progress !== null && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, job.checklist_progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default JobCard;
