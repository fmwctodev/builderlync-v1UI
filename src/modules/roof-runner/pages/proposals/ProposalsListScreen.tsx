import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, Sparkles, Plus, ArrowLeft, MoreVertical, Trash2, Archive, Send, X } from 'lucide-react';
import { useProposals } from './useProposals';
import { getStatusColor, getStatusLabel, formatCurrency, formatRelativeDate } from './proposalUtils';
import type { Proposal, ProposalStatus } from '../../types/proposalIntegration';

const STATUS_FILTERS: { label: string; value: ProposalStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'waiting' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Declined', value: 'declined' },
  { label: 'Expired', value: 'expired' },
];

interface SwipeCardProps {
  proposal: Proposal;
  onView: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onSend: () => void;
}

function SwipeCard({ proposal, onView, onArchive, onDelete, onSend }: SwipeCardProps) {
  const [showActions, setShowActions] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 60) setShowActions(true);
    if (diff < -60) setShowActions(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2">
      <div className="absolute right-0 top-0 bottom-0 flex items-center">
        <div className="flex h-full">
          {proposal.status === 'draft' && (
            <button
              onClick={onSend}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 h-full flex items-center gap-1 text-xs font-medium"
            >
              <Send size={14} />
              Send
            </button>
          )}
          <button
            onClick={onArchive}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 h-full flex items-center gap-1 text-xs font-medium"
          >
            <Archive size={14} />
            Archive
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-r-2xl h-full flex items-center gap-1 text-xs font-medium"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div
        className={`relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-transform duration-200 ${showActions ? '-translate-x-32' : 'translate-x-0'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={onView} className="w-full text-left p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{proposal.title}</p>
                <button
                  onClick={e => { e.stopPropagation(); setShowActions(!showActions); }}
                  className="text-gray-400 flex-shrink-0 p-0.5"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
              {proposal.property_address && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{proposal.property_address}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(proposal.status as any)}`}>
                  {getStatusLabel(proposal.status as any)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeDate(proposal.updated_at || proposal.created_at)}</span>
              </div>
            </div>
            {proposal.value ? (
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex-shrink-0">
                {formatCurrency(proposal.value)}
              </span>
            ) : null}
          </div>
        </button>
      </div>
    </div>
  );
}

export default function ProposalsListScreen() {
  const navigate = useNavigate();
  const { proposals, isLoading, changeStatus, remove } = useProposals('all');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProposalStatus | 'all'>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [sendTarget, setSendTarget] = useState<Proposal | null>(null);

  const filtered = useMemo(() => {
    let list = proposals;
    if (activeFilter !== 'all') {
      list = list.filter(p => p.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.property_address?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [proposals, activeFilter, search]);

  const handleArchive = async (id: string) => {
    await changeStatus(id, 'archived');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this proposal? This cannot be undone.')) {
      await remove(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 py-4">
            <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 p-1">
              <ArrowLeft size={22} />
            </button>
            {showSearch ? (
              <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search proposals..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
            ) : (
              <h1 className="flex-1 text-lg font-bold text-gray-900 dark:text-white">All Proposals</h1>
            )}
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-gray-500 dark:text-gray-400">
              {showSearch ? <X size={20} /> : <Search size={20} />}
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400">
              <Filter size={20} />
            </button>
          </div>

          <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === f.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {search ? 'No proposals match your search' : 'No proposals here'}
            </p>
            {!search && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different filter</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{filtered.length} proposal{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map(p => (
              <SwipeCard
                key={p.id}
                proposal={p}
                onView={() => navigate(`../proposals/${p.id}/edit`)}
                onArchive={() => handleArchive(p.id)}
                onDelete={() => handleDelete(p.id)}
                onSend={() => setSendTarget(p)}
              />
            ))}
          </>
        )}
      </div>

      <button
        onClick={() => navigate('../proposals/ai-generate')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      {sendTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSendTarget(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Send Proposal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{sendTarget.title}</p>
            <button
              onClick={async () => {
                await changeStatus(sendTarget.id, 'waiting');
                setSendTarget(null);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm mb-2 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Mark as Sent
            </button>
            <button onClick={() => setSendTarget(null)} className="w-full py-2 text-sm text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
