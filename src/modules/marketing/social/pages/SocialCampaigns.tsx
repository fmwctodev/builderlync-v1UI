import React, { useState, useEffect } from 'react';
import { Plus, Zap, Calendar, MoreVertical, Trash2, Play, Pause, ChevronRight } from 'lucide-react';
import type { SocialCampaign, SocialAccount } from '../types';
import { getCampaigns, createCampaign, deleteCampaign, toggleAutopilot, generateCampaignPosts } from '../services/socialCampaigns';
import { getSocialAccounts } from '../services/socialAccounts';
import AccountSelector from '../components/AccountSelector';
import { getAccountGroups } from '../services/socialAccountGroups';
import type { SocialAccountGroup } from '../types';

interface SocialCampaignsProps {
  orgId: string;
  userId: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const CreateCampaignModal: React.FC<{
  accounts: SocialAccount[];
  groups: SocialAccountGroup[];
  onClose: () => void;
  onCreate: (data: { name: string; goal: string; frequency: string; accountIds: string[] }) => void;
}> = ({ accounts, groups, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [frequency, setFrequency] = useState('3x/week');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-base font-semibold text-white">New Campaign</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Campaign name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Storm Season Awareness"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Goal / brief</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe the campaign goal and content style..."
              rows={3}
              className="w-full resize-none bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Posting frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {['1x/week', '2x/week', '3x/week', '5x/week', 'Daily'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-2">Target accounts</label>
            <AccountSelector
              accounts={accounts}
              groups={groups}
              selected={selectedAccounts}
              onChange={setSelectedAccounts}
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onCreate({ name, goal, frequency, accountIds: selectedAccounts })}
            disabled={!name.trim()}
            className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm rounded-xl transition-colors"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignCard: React.FC<{
  campaign: SocialCampaign;
  onDelete: (id: string) => void;
  onToggleAutopilot: (id: string, value: boolean) => void;
  onGenerate: (id: string) => void;
}> = ({ campaign, onDelete, onToggleAutopilot, onGenerate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate(campaign.id);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
          {campaign.goal && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{campaign.goal}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleAutopilot(campaign.id, !campaign.autopilot_enabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
              campaign.autopilot_enabled
                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-700 border-slate-600 text-slate-400'
            }`}
          >
            {campaign.autopilot_enabled ? <Zap size={11} /> : <Pause size={11} />}
            {campaign.autopilot_enabled ? 'Autopilot' : 'Manual'}
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-xl shadow-xl overflow-hidden min-w-[140px] z-20">
                <button
                  onClick={() => { onDelete(campaign.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {campaign.frequency ?? '—'}
        </span>
        {campaign.start_date && (
          <span>{formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}</span>
        )}
        <span>{campaign.total_posts_count ?? 0} posts</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs text-slate-300 hover:text-white rounded-xl transition-colors disabled:opacity-50"
        >
          {generating ? (
            <span className="w-3 h-3 border border-slate-400 border-t-white rounded-full animate-spin" />
          ) : (
            <Play size={11} />
          )}
          Generate posts
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
          View posts
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

const SocialCampaigns: React.FC<SocialCampaignsProps> = ({ orgId, userId }) => {
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [groups, setGroups] = useState<SocialAccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, a, g] = await Promise.all([
        getCampaigns(orgId),
        getSocialAccounts(orgId),
        getAccountGroups(orgId),
      ]);
      setCampaigns(c);
      setAccounts(a);
      setGroups(g);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async ({ name, goal, frequency, accountIds }: { name: string; goal: string; frequency: string; accountIds: string[] }) => {
    const c = await createCampaign(orgId, userId, name, goal, frequency, accountIds);
    setCampaigns((prev) => [c, ...prev]);
    setShowCreate(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleAutopilot = async (id: string, value: boolean) => {
    await toggleAutopilot(id, value);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, autopilot_enabled: value } : c)));
  };

  const handleGenerate = async (id: string) => {
    await generateCampaignPosts(id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800/50">
        <div>
          <h2 className="text-base font-semibold text-white">Campaigns</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage content campaigns with autopilot scheduling</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-xl transition-colors"
        >
          <Plus size={14} />
          New campaign
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Zap size={28} className="mb-2 opacity-50" />
            <p className="text-sm">No campaigns yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Create your first campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDelete={handleDelete}
                onToggleAutopilot={handleToggleAutopilot}
                onGenerate={handleGenerate}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCampaignModal
          accounts={accounts}
          groups={groups}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default SocialCampaigns;
