import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Link2Off, RefreshCw, Eye, EyeOff, Loader2, CheckCircle,
  AlertTriangle, Plus, Pencil, Trash2, ShieldAlert, Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { SectionCard } from '../components/common/SectionCard';
import { TemperatureSlider } from '../components/common/TemperatureSlider';
import { UserAssignmentDropdown } from '../components/common/UserAssignmentDropdown';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { RoutingRuleModal } from '../components/settings/RoutingRuleModal';
import { getLateConnectionStatus, saveLateApiKey, disconnectLate, syncNow } from '../services/reputationSyncService';
import { getSettings, upsertSettings } from '../services/reputationSettingsService';
import { listRules, createRule, updateRule, deleteRule } from '../services/reputationRoutingService';
import { getIntegrationStatus, getSyncHealthLast7Days } from '../services/reputationIntegrationStatusService';
import type {
  ReputationSettings, ReputationRoutingRule, RoutingRuleFormValues,
  ReputationIntegrationStatus, AITone,
} from '../types';

interface Props {
  orgId: string;
  canReadSettings?: boolean;
  canWriteSettings?: boolean;
  canManageIntegration?: boolean;
}

const TONE_OPTIONS: { value: AITone; label: string }[] = [
  { value: 'concise', label: 'Concise' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'fixit', label: 'Problem-Solving' },
  { value: 'professional', label: 'Professional' },
  { value: 'warm', label: 'Warm' },
  { value: 'direct', label: 'Direct' },
  { value: 'apologetic', label: 'Apologetic' },
  { value: 'brand_voice', label: 'Brand Voice' },
];

const ESCALATION_TRIGGERS = [
  'Rating is 1 or 2 stars',
  'SLA deadline has passed without a reply',
  'Review text contains: refund, lawsuit, attorney, scam, legal, court, medical, doctor, injury, or safety',
];

export const SettingsPage: React.FC<Props> = ({
  orgId,
  canReadSettings = true,
  canWriteSettings = true,
  canManageIntegration = true,
}) => {
  const [connected, setConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<ReputationIntegrationStatus | null>(null);
  const [syncHealth, setSyncHealth] = useState<{ total: number; successful: number; rate: number } | null>(null);
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  const [settings, setSettings] = useState<ReputationSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rules, setRules] = useState<ReputationRoutingRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [ruleModal, setRuleModal] = useState<{ open: boolean; rule: ReputationRoutingRule | null }>({ open: false, rule: null });
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAll = useCallback(async () => {
    if (!orgId) return;
    const [lateStatus, status, health] = await Promise.all([
      getLateConnectionStatus(orgId).catch(() => ({ connected: false })),
      getIntegrationStatus(orgId).catch(() => null),
      getSyncHealthLast7Days(orgId).catch(() => null),
    ]);
    setConnected(lateStatus.connected);
    setIntegrationStatus(status);
    setSyncHealth(health);

    if (canReadSettings) {
      setLoadingSettings(true);
      const s = await getSettings(orgId).catch(() => null);
      setSettings(s);
      setLoadingSettings(false);

      setLoadingRules(true);
      const r = await listRules(orgId).catch(() => []);
      setRules(r);
      setLoadingRules(false);
    }
  }, [orgId, canReadSettings]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  const patch = (updates: Partial<ReputationSettings>) => {
    if (!canWriteSettings) return;
    setSettings((s) => s ? { ...s, ...updates } : s);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await upsertSettings(orgId, updates);
      } catch (err) {
        console.error('Failed to save settings:', err);
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  const handleConnectLate = async () => {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try {
      await saveLateApiKey(orgId, apiKey.trim());
      setConnected(true);
      setApiKey('');
      showToast('Late API key saved. Integration connected.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save API key', true);
    } finally {
      setSavingKey(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect Late integration? Reviews will no longer sync.')) return;
    setDisconnecting(true);
    try {
      await disconnectLate(orgId);
      setConnected(false);
      setIntegrationStatus(null);
      showToast('Late integration disconnected.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to disconnect', true);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncNow(orgId);
      const [status, health] = await Promise.all([
        getIntegrationStatus(orgId).catch(() => null),
        getSyncHealthLast7Days(orgId).catch(() => null),
      ]);
      setIntegrationStatus(status);
      setSyncHealth(health);
      if (result.meta?.failedAccounts?.length > 0) {
        showToast(`Synced ${result.synced} reviews. Some accounts failed.`, true);
      } else {
        showToast(`Synced ${result.synced} reviews successfully.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      showToast(
        msg === 'LATE_NOT_CONNECTED' ? 'Late integration is not connected.' :
        msg === 'LATE_AUTH_ERROR' ? 'Late API authentication failed. Check your API key.' : msg,
        true
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveRule = async (values: RoutingRuleFormValues) => {
    if (ruleModal.rule) {
      const updated = await updateRule(ruleModal.rule.id, values);
      setRules((r) => r.map((x) => (x.id === updated.id ? updated : x)));
    } else {
      const created = await createRule(orgId, values);
      setRules((r) => [...r, created]);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Delete this routing rule?')) return;
    setDeletingRuleId(id);
    try {
      await deleteRule(id);
      setRules((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete rule', true);
    } finally {
      setDeletingRuleId(null);
    }
  };

  const accountsList = (integrationStatus?.accounts_connected ?? []) as Array<{ accountId: string; platform: string; username?: string }>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reputation Settings</h2>

      {/* Integration */}
      <SectionCard
        title="Late Integration"
        subtitle="Connect your Late API key to sync Facebook and Google Business reviews."
        rightSlot={
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            connected
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {connected ? <><Link2 className="w-3 h-3" /> Connected</> : <><Link2Off className="w-3 h-3" /> Disconnected</>}
          </span>
        }
      >
        {!connected && canManageIntegration && (
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Paste your Late API key…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 pr-9 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button onClick={handleConnectLate} disabled={!apiKey.trim() || savingKey}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800 text-white transition-colors">
              {savingKey && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Connect
            </button>
          </div>
        )}

        {connected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button onClick={handleSync} disabled={syncing || !canManageIntegration}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
              {canManageIntegration && (
                <button onClick={handleDisconnect} disabled={disconnecting}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                  {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2Off className="w-3.5 h-3.5" />}
                  Disconnect
                </button>
              )}
            </div>

            {integrationStatus?.last_sync_at && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Last synced: {format(new Date(integrationStatus.last_sync_at), 'MMM d, yyyy h:mm a')}
              </p>
            )}

            {accountsList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {accountsList.map((a) => (
                  <span key={a.accountId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {a.platform === 'googlebusiness' ? 'Google' : 'Facebook'}
                    {a.username ? ` · ${a.username}` : ''}
                  </span>
                ))}
              </div>
            )}

            {integrationStatus?.last_error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <p>Last sync error: {integrationStatus.last_error}</p>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* AI Defaults */}
      {canReadSettings && (
        <SectionCard
          title="AI Reply Defaults"
          subtitle="Configure how AI-generated reply drafts are produced."
          rightSlot={
            isSaving ? (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving
              </span>
            ) : null
          }
        >
          {loadingSettings ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Tone</label>
                <select
                  value={settings?.default_ai_tone ?? 'concise'}
                  disabled={!canWriteSettings}
                  onChange={(e) => patch({ default_ai_tone: e.target.value as AITone })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {TONE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Creativity (Temperature)
                </label>
                <TemperatureSlider
                  value={settings?.default_temperature ?? 0.4}
                  disabled={!canWriteSettings}
                  onChange={(v) => patch({ default_temperature: v })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.auto_append_signature ?? false}
                    disabled={!canWriteSettings}
                    onChange={(e) => patch({ auto_append_signature: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Auto-append signature to AI drafts
                  </span>
                </label>

                {settings?.auto_append_signature && (
                  <textarea
                    rows={3}
                    placeholder="e.g. — The Team at Acme Roofing"
                    value={settings?.default_signature ?? ''}
                    disabled={!canWriteSettings}
                    onChange={(e) => patch({ default_signature: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-50"
                  />
                )}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* SLA Targets */}
      {canReadSettings && (
        <SectionCard
          title="SLA Targets"
          subtitle="Set target response times. Reviews breaching these deadlines will be flagged."
        >
          {loadingSettings ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Positive reviews (4–5 stars)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={settings?.sla_hours_positive ?? 48}
                    disabled={!canWriteSettings}
                    onChange={(e) => patch({ sla_hours_positive: Math.max(1, parseInt(e.target.value) || 48) })}
                    className="w-24 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">hours</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Negative reviews (1–3 stars)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={settings?.sla_hours_negative ?? 12}
                    disabled={!canWriteSettings}
                    onChange={(e) => patch({ sla_hours_negative: Math.max(1, parseInt(e.target.value) || 12) })}
                    className="w-24 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">hours</span>
                </div>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            SLA is measured from the review's posting date. Unanswered reviews that exceed the limit will be marked as Overdue in the inbox.
          </p>
        </SectionCard>
      )}

      {/* Routing Rules */}
      {canReadSettings && (
        <SectionCard
          title="Routing Rules"
          subtitle="Automatically assign incoming reviews to specific users or roles."
          rightSlot={
            canWriteSettings ? (
              <button
                onClick={() => setRuleModal({ open: true, rule: null })}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            ) : null
          }
        >
          {loadingRules ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : rules.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-2">
              No routing rules configured. Reviews will not be auto-assigned.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-2 px-1 font-medium text-gray-500 dark:text-gray-400">Platform</th>
                    <th className="text-left py-2 px-1 font-medium text-gray-500 dark:text-gray-400">Rating</th>
                    <th className="text-left py-2 px-1 font-medium text-gray-500 dark:text-gray-400">Assigned To</th>
                    <th className="text-left py-2 px-1 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                    <th className="text-left py-2 px-1 font-medium text-gray-500 dark:text-gray-400">Approval</th>
                    {canWriteSettings && <th className="py-2 px-1" />}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b border-gray-50 dark:border-gray-700/50">
                      <td className="py-2.5 px-1 text-gray-700 dark:text-gray-300">
                        {rule.platform === 'googlebusiness' ? 'Google' : rule.platform === 'facebook' ? 'Facebook' : 'Any'}
                      </td>
                      <td className="py-2.5 px-1 text-gray-700 dark:text-gray-300">
                        {rule.min_rating}–{rule.max_rating} ★
                      </td>
                      <td className="py-2.5 px-1 text-gray-700 dark:text-gray-300">
                        {rule.assign_to_role ? `Role: ${rule.assign_to_role}` : rule.assign_to_user_id ? 'User' : '—'}
                      </td>
                      <td className="py-2.5 px-1">
                        <PriorityBadge priority={rule.priority} />
                      </td>
                      <td className="py-2.5 px-1 text-gray-500 dark:text-gray-400">
                        {rule.requires_manual_approval ? 'Required' : 'No'}
                      </td>
                      {canWriteSettings && (
                        <td className="py-2.5 px-1">
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setRuleModal({ open: true, rule })}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              disabled={deletingRuleId === rule.id}
                              className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              {deletingRuleId === rule.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* Escalation */}
      {canReadSettings && (
        <SectionCard
          title="Escalation"
          subtitle="Auto-escalate reviews that need urgent attention and notify the right people."
          rightSlot={<ShieldAlert className="w-4 h-4 text-red-500" />}
        >
          {loadingSettings ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Escalation Email
                </label>
                <input
                  type="email"
                  placeholder="alerts@yourcompany.com"
                  value={settings?.escalation_email ?? ''}
                  disabled={!canWriteSettings}
                  onChange={(e) => patch({ escalation_email: e.target.value || null })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Escalation Assignee
                </label>
                <UserAssignmentDropdown
                  orgId={orgId}
                  value={settings?.escalation_user_id ?? null}
                  onChange={(v) => patch({ escalation_user_id: v })}
                  disabled={!canWriteSettings}
                  placeholder="Select a team member…"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger conditions:</p>
                <ul className="space-y-1">
                  {ESCALATION_TRIGGERS.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Health Monitor */}
      <SectionCard
        title="Sync Health"
        subtitle="Status and performance of your last 7 days of syncs."
        rightSlot={<Activity className="w-4 h-4 text-gray-400" />}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connection</p>
              <span className={`inline-flex items-center gap-1 mt-0.5 text-xs font-medium ${
                connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {connected ? <CheckCircle className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                {connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                {integrationStatus?.last_sync_at
                  ? format(new Date(integrationStatus.last_sync_at), 'MMM d, h:mm a')
                  : '—'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Accounts Connected</p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                {accountsList.length > 0 ? accountsList.length : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate (7d)</p>
              {syncHealth ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${syncHealth.rate >= 80 ? 'bg-emerald-500' : syncHealth.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${syncHealth.rate}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {syncHealth.rate}%
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">No data</p>
              )}
            </div>
          </div>
        </div>
        {integrationStatus?.last_error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Last error: {integrationStatus.last_error}</span>
          </div>
        )}
      </SectionCard>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.isError
            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
        }`}>
          {toast.isError
            ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.text}
        </div>
      )}

      {/* Routing Rule Modal */}
      {ruleModal.open && (
        <RoutingRuleModal
          orgId={orgId}
          rule={ruleModal.rule}
          onSave={handleSaveRule}
          onClose={() => setRuleModal({ open: false, rule: null })}
        />
      )}
    </div>
  );
};
