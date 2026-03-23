import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, AlertCircle, CheckCircle, XCircle, Users } from 'lucide-react';
import type { SocialAccount, SocialAccountGroup, SocialProvider } from '../types';
import { getSocialAccounts, disconnectSocialAccount, deleteSocialAccount, reconnectViaLate } from '../services/socialAccounts';
import { getAccountGroups, createAccountGroup, deleteAccountGroup } from '../services/socialAccountGroups';
import ProviderIcon from '../components/ProviderIcon';
import { PROVIDER_CONFIG } from '../types';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';

interface SocialAccountsProps {
  orgId: string;
}

const PROVIDERS: SocialProvider[] = ['facebook', 'instagram', 'linkedin', 'google_business', 'tiktok', 'youtube', 'reddit'];

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'connected') return <CheckCircle size={14} className="text-emerald-400" />;
  if (status === 'error' || status === 'expired') return <XCircle size={14} className="text-red-400" />;
  return <AlertCircle size={14} className="text-yellow-400" />;
};

const AccountCard: React.FC<{
  account: SocialAccount;
  onDisconnect: (id: string) => void;
  onDelete: (id: string) => void;
  onReconnect: (id: string) => void;
}> = ({ account, onDisconnect, onDelete, onReconnect }) => {
  const [reconnecting, setReconnecting] = useState(false);
  const config = PROVIDER_CONFIG[account.provider];

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await onReconnect(account.id);
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config?.bgColor ?? '#334155' }}
      >
        <ProviderIcon provider={account.provider} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{account.account_name}</p>
          <StatusIcon status={account.status} />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 capitalize">{account.provider.replace('_', ' ')}</p>
        {account.status === 'error' && account.error_message && (
          <p className="text-xs text-red-400 mt-1 truncate">{account.error_message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {(account.status === 'error' || account.status === 'expired') && (
          <button
            onClick={handleReconnect}
            disabled={reconnecting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={reconnecting ? 'animate-spin' : ''} />
            Reconnect
          </button>
        )}
        <button
          onClick={() => onDisconnect(account.id)}
          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Disconnect"
        >
          <XCircle size={14} />
        </button>
        <button
          onClick={() => onDelete(account.id)}
          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const SocialAccounts: React.FC<SocialAccountsProps> = ({ orgId }) => {
  const { user } = useSupabaseUser();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [groups, setGroups] = useState<SocialAccountGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupAccounts, setNewGroupAccounts] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, g] = await Promise.all([getSocialAccounts(orgId), getAccountGroups(orgId)]);
      setAccounts(a);
      setGroups(g);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (provider: SocialProvider) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/late-connect?provider=${provider}&org_id=${orgId}`;
    window.open(url, '_blank', 'width=600,height=700');
  };

  const handleDisconnect = async (id: string) => {
    await disconnectSocialAccount(id);
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'disconnected' } : a)));
  };

  const handleDelete = async (id: string) => {
    await deleteSocialAccount(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReconnect = async (id: string) => {
    await reconnectViaLate(id);
    await loadData();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const g = await createAccountGroup(orgId, newGroupName, newGroupAccounts, user.id);
    setGroups((prev) => [g, ...prev]);
    setNewGroupName('');
    setNewGroupAccounts([]);
    setShowGroupModal(false);
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteAccountGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const connected = accounts.filter((a) => a.status === 'connected');
  const disconnected = accounts.filter((a) => a.status !== 'connected');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Social Accounts</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Connect and manage your social media accounts</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        <section>
          <h3 className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Connect New Account</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {PROVIDERS.map((provider) => {
              const config = PROVIDER_CONFIG[provider];
              const isConnected = accounts.some((a) => a.provider === provider && a.status === 'connected');
              return (
                <button
                  key={provider}
                  onClick={() => handleConnect(provider)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-105 ${
                    isConnected
                      ? 'bg-emerald-900/20 border-emerald-700/40'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: config?.bgColor ?? '#334155' }}
                  >
                    <ProviderIcon provider={provider} size={22} />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">{provider.replace('_', ' ')}</span>
                  {isConnected && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={10} />
                      Connected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {accounts.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Connected Accounts</h3>
            <div className="space-y-2">
              {connected.map((acc) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  onDisconnect={handleDisconnect}
                  onDelete={handleDelete}
                  onReconnect={handleReconnect}
                />
              ))}
            </div>
            {disconnected.length > 0 && (
              <>
                <h4 className="text-xs text-gray-400 dark:text-slate-500 mt-4 mb-2">Disconnected</h4>
                <div className="space-y-2 opacity-60">
                  {disconnected.map((acc) => (
                    <AccountCard
                      key={acc.id}
                      account={acc}
                      onDisconnect={handleDisconnect}
                      onDelete={handleDelete}
                      onReconnect={handleReconnect}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Account Groups</h3>
            <button
              onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-1 text-xs text-primary-500 dark:text-primary-400 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <Plus size={12} />
              New group
            </button>
          </div>
          {groups.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500">No groups yet. Groups let you publish to multiple accounts at once.</p>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Users size={16} className="text-gray-400 dark:text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-slate-200">{g.name}</p>
                    {g.description && <p className="text-xs text-gray-400 dark:text-slate-500">{g.description}</p>}
                    <p className="text-xs text-gray-400 dark:text-slate-500">{g.account_ids.length} accounts</p>
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(g.id)}
                    className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Create Account Group</h3>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Select accounts</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {accounts.map((acc) => (
                  <label key={acc.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupAccounts.includes(acc.id)}
                      onChange={(e) =>
                        setNewGroupAccounts((prev) =>
                          e.target.checked ? [...prev, acc.id] : prev.filter((id) => id !== acc.id)
                        )
                      }
                      className="accent-primary-500"
                    />
                    <ProviderIcon provider={acc.provider} size={14} />
                    <span className="text-sm text-gray-700 dark:text-slate-300">{acc.account_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm rounded-xl transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAccounts;
