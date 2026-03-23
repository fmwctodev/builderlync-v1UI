import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Sparkles, ChevronRight, TrendingUp,
  CheckCircle, Clock, XCircle, ArrowRight, RefreshCw
} from 'lucide-react';
import { useProposals } from './useProposals';
import { getStatusColor, getStatusLabel, formatCurrency, formatRelativeDate } from './proposalUtils';
import type { Proposal } from '../../types/proposalIntegration';

interface NewProposalSheetProps {
  onClose: () => void;
  onCreate: (title: string) => Promise<string | null>;
}

function NewProposalSheet({ onClose, onCreate }: NewProposalSheetProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const t = title.trim() || 'Untitled Proposal';
    setCreating(true);
    const id = await onCreate(t);
    setCreating(false);
    if (id) {
      navigate(`proposals/${id}/edit`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Proposal</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proposal Title
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Roof Replacement – Smith Residence"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            <FileText size={18} />
            <span className="flex-1 text-left">Start from Scratch</span>
            {creating ? <RefreshCw size={16} className="animate-spin" /> : <ChevronRight size={16} />}
          </button>
          <button
            onClick={() => { navigate('proposals/ai-generate'); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium text-sm transition-colors"
          >
            <Sparkles size={18} />
            <span className="flex-1 text-left">Generate with AI</span>
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400">
          Cancel
        </button>
      </div>
    </div>
  );
}

function StatsStrip({ stats }: { stats: ReturnType<typeof useProposals>['stats'] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-green-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Value</span>
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.total} proposals</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-green-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Accepted</span>
        </div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.acceptedValue)}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.accepted} won</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={16} className="text-blue-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Awaiting</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.waiting}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">sent out</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={16} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Drafts</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">in progress</p>
      </div>
    </div>
  );
}

function ProposalCard({ proposal, onClick }: { proposal: Proposal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
        <FileText size={18} className="text-red-600 dark:text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{proposal.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {proposal.property_address || 'No address'} · {formatRelativeDate(proposal.updated_at || proposal.created_at)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(proposal.status as any)}`}>
          {getStatusLabel(proposal.status as any)}
        </span>
        {proposal.value ? (
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(proposal.value)}</span>
        ) : null}
      </div>
    </button>
  );
}

export default function ProposalsHome() {
  const navigate = useNavigate();
  const { proposals, isLoading, stats, create, refresh } = useProposals('all');
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const recentProposals = proposals.slice(0, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proposals</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track your proposals</p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <StatsStrip stats={stats} />

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Proposals</h2>
                <button
                  onClick={() => navigate('proposals/all')}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              {recentProposals.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
                  <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No proposals yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create your first proposal to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProposals.map(p => (
                    <ProposalCard
                      key={p.id}
                      proposal={p}
                      onClick={() => navigate(`proposals/${p.id}/edit`)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => navigate('proposals/all')}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white shadow-sm"
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="flex-1 text-left">Browse All Proposals</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={() => navigate('proposals/ai-generate')}
                  className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-white shadow-sm"
                >
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="flex-1 text-left">AI Proposal Generator</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => setShowNewSheet(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      {showNewSheet && (
        <NewProposalSheet
          onClose={() => setShowNewSheet(false)}
          onCreate={create}
        />
      )}
    </div>
  );
}
