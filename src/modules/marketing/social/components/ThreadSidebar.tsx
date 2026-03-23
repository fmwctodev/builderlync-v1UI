import React from 'react';
import { Plus, Archive, Trash2, MessageSquare } from 'lucide-react';
import type { SocialAIThread } from '../types';

interface ThreadSidebarProps {
  threads: SocialAIThread[];
  activeThreadId: string | null;
  loading: boolean;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onArchiveThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  showOwner?: boolean;
  currentUserId?: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ThreadSidebar: React.FC<ThreadSidebarProps> = ({
  threads,
  activeThreadId,
  loading,
  onSelectThread,
  onNewThread,
  onArchiveThread,
  onDeleteThread,
  showOwner,
}) => {
  return (
    <div className="bg-slate-800 border-r border-slate-700 h-full flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <span className="text-sm font-semibold text-slate-200">Conversations</span>
        <button
          onClick={onNewThread}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
          title="New conversation"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-1" />
                <div className="h-3 bg-slate-700/50 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-3">
              <MessageSquare size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">No conversations yet</p>
            <p className="text-slate-500 text-xs mb-4">Start chatting with Sierra AI to generate social content</p>
            <button
              onClick={onNewThread}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
            >
              New conversation
            </button>
          </div>
        ) : (
          <div className="py-2">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === activeThreadId}
                showOwner={showOwner}
                onSelect={() => onSelectThread(thread.id)}
                onArchive={() => onArchiveThread(thread.id)}
                onDelete={() => onDeleteThread(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ThreadItemProps {
  thread: SocialAIThread;
  isActive: boolean;
  showOwner?: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({
  thread,
  isActive,
  showOwner,
  onSelect,
  onArchive,
  onDelete,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={`group relative flex items-start gap-2 px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate font-medium leading-tight">
          {thread.title || 'New conversation'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{relativeTime(thread.updated_at)}</span>
          {showOwner && thread.owner_name && (
            <span className="text-xs px-1.5 py-0.5 bg-slate-600 text-slate-300 rounded">
              {thread.owner_name}
            </span>
          )}
        </div>
      </div>

      {hovered && (
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-600 transition-colors"
            title="Archive"
          >
            <Archive size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreadSidebar;
