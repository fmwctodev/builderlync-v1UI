import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, List, MoreVertical, Send, Clock, CheckCircle, XCircle, CreditCard as Edit3, Trash2, Copy } from 'lucide-react';
import type { SocialPost, SocialAccount, SocialPostStatus } from '../types';
import { getSocialPosts, deleteSocialPost, duplicatePost, approvePost, cancelPost } from '../services/socialPosts';
import { getSocialAccounts } from '../services/socialAccounts';
import ProviderIcon from '../components/ProviderIcon';
import { STATUS_STYLES } from '../types';

interface SocialPostsProps {
  orgId: string;
  userId: string;
}

const STATUS_FILTER_OPTIONS: { value: SocialPostStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'posted', label: 'Posted' },
  { value: 'failed', label: 'Failed' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PostRow: React.FC<{
  post: SocialPost;
  accounts: SocialAccount[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
}> = ({ post, accounts, onDelete, onDuplicate, onApprove, onCancel }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const postAccounts = accounts.filter((a) => (post.targets ?? []).includes(a.id));

  const style = STATUS_STYLES[post.status] ?? STATUS_STYLES['draft'];

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/50 border-b border-slate-800 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{post.body || post.hook_text || 'Untitled draft'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text}`}>
            {post.status === 'draft' && <Edit3 size={10} />}
            {post.status === 'scheduled' && <Clock size={10} />}
            {post.status === 'posted' && <CheckCircle size={10} />}
            {post.status === 'failed' && <XCircle size={10} />}
            {post.status === 'pending_approval' && <Send size={10} />}
            <span className="capitalize">{post.status.replace('_', ' ')}</span>
          </span>
          {post.scheduled_at_utc && (
            <span className="text-xs text-slate-500">{formatDate(post.scheduled_at_utc)}</span>
          )}
          {post.ai_generated && (
            <span className="text-xs text-cyan-600 bg-cyan-600/10 px-1.5 py-0.5 rounded">AI</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {postAccounts.slice(0, 4).map((acc) => (
          <div key={acc.id} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
            <ProviderIcon provider={acc.provider} size={12} />
          </div>
        ))}
        {postAccounts.length > 4 && (
          <span className="text-xs text-slate-500">+{postAccounts.length - 4}</span>
        )}
      </div>

      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-xl shadow-xl overflow-hidden min-w-[160px] z-20">
            {post.status === 'pending_approval' && (
              <button
                onClick={() => { onApprove(post.id); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-emerald-400 hover:bg-slate-600"
              >
                <CheckCircle size={14} />
                Approve
              </button>
            )}
            <button
              onClick={() => { onDuplicate(post.id); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600"
            >
              <Copy size={14} />
              Duplicate
            </button>
            {(post.status === 'scheduled' || post.status === 'pending_approval') && (
              <button
                onClick={() => { onCancel(post.id); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-yellow-400 hover:bg-slate-600"
              >
                <XCircle size={14} />
                Cancel
              </button>
            )}
            <button
              onClick={() => { onDelete(post.id); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SocialPosts: React.FC<SocialPostsProps> = ({ orgId }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SocialPostStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([getSocialPosts(orgId), getSocialAccounts(orgId)]);
      setPosts(p);
      setAccounts(a);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSocialPost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicate = async (id: string) => {
    const newId = await duplicatePost(id);
    const original = posts.find((p) => p.id === id);
    if (original) setPosts((prev) => [{ ...original, id: newId, status: 'draft', created_at: new Date().toISOString() }, ...prev]);
  };

  const handleApprove = async (id: string) => {
    await approvePost(id);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'scheduled' } : p)));
  };

  const handleCancel = async (id: string) => {
    await cancelPost(id);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'draft' } : p)));
  };

  const filtered = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.body?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 flex-1 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                statusFilter === opt.value
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-xl transition-colors">
          <Plus size={14} />
          New post
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Calendar size={28} className="mb-2 opacity-50" />
            <p className="text-sm">No posts found</p>
          </div>
        ) : (
          filtered.map((post) => (
            <PostRow
              key={post.id}
              post={post}
              accounts={accounts}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onApprove={handleApprove}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SocialPosts;
