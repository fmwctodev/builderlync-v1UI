import React from 'react';
import {
  Camera, Trash2, Tag, Check, CheckSquare, FileText,
  Link2, XCircle, MessageSquare, Layers, Upload, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { JobActivityEvent, ActivityEventType } from '../../types/jobCam';

interface Props {
  events: JobActivityEvent[];
  loading?: boolean;
}

const eventConfig: Record<ActivityEventType, { icon: React.ElementType; color: string }> = {
  photo_uploaded: { icon: Camera, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' },
  photo_deleted: { icon: Trash2, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  photo_tagged: { icon: Tag, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  photo_reviewed: { icon: Check, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  checklist_completed: { icon: CheckSquare, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  report_created: { icon: FileText, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  report_finalized: { icon: FileText, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  file_uploaded: { icon: Upload, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  file_deleted: { icon: Trash2, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  share_link_created: { icon: Link2, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
  share_link_revoked: { icon: XCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  note_added: { icon: MessageSquare, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  bulk_update: { icon: Layers, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};

const ActivityTimeline: React.FC<Props> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">No activity found</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Everything that happens on this job will be logged here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
      {events.map((event) => {
        const config = eventConfig[event.event_type] ?? { icon: Layers, color: 'bg-gray-100 text-gray-600' };
        const Icon = config.icon;
        return (
          <div key={event.id} className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform ${config.color}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight uppercase tracking-tight">{event.summary}</p>
              <div className="flex items-center gap-3 mt-1.5 font-medium">
                {event.user_email && (
                    <span className="text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                        {event.user_email}
                    </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
