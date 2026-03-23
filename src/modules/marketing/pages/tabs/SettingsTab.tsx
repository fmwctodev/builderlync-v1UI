import React, { useState, useEffect, useCallback } from 'react';
import { Bell, DollarSign, Users, Zap, ChevronRight, Check, ToggleLeft, ToggleRight, Loader2, Save } from 'lucide-react';
import type { ApprovalMode } from '../../types/marketing';
import { settingsApi } from '../../services/settingsApi';
import type { MarketingSettings } from '../../services/settingsApi';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

const APPROVAL_MODES: { value: ApprovalMode; label: string; description: string; riskLevel: string }[] = [
  {
    value: 'manual_only',
    label: 'Manual Only',
    description: 'Sierra never touches your accounts. You execute everything yourself after reviewing recommendations.',
    riskLevel: 'No automation',
  },
  {
    value: 'recommend_and_approve',
    label: 'Recommend & Approve',
    description: 'Sierra surfaces recommendations and queues actions. You review and approve each one before execution.',
    riskLevel: 'Human-in-the-loop',
  },
  {
    value: 'assisted_autopilot',
    label: 'Assisted Autopilot',
    description: 'Sierra executes low-risk actions automatically (budget micro-adjustments, scheduling). High-impact changes require approval.',
    riskLevel: 'Partially automated',
  },
  {
    value: 'full_autopilot',
    label: 'Full Autopilot',
    description: 'Sierra manages your marketing autonomously, optimizing campaigns in real-time. You receive weekly summaries.',
    riskLevel: 'Full automation',
  },
];

const riskColor: Record<string, string> = {
  'No automation': 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  'Human-in-the-loop': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Partially automated': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Full automation': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
    <button onClick={() => onChange(!value)} className="shrink-0">
      {value
        ? <ToggleRight size={24} className="text-red-500" />
        : <ToggleLeft size={24} className="text-gray-400" />
      }
    </button>
  </div>
);

export const SettingsTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MarketingSettings>({
    approval_mode: 'recommend_and_approve',
    budget_guard_enabled: true,
    daily_cap: 500,
    monthly_cap: 8000,
    notifications: {
      new_lead: true,
      action_queued: true,
      pixel_issue: true,
      budget_alert: true,
      weekly_summary: true,
      anomaly_detected: true,
    },
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsApi.getSettings(orgId);
      setSettings(data);
    } catch {
      addToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.saveSettings(settings, orgId);
      addToast('success', 'Settings saved successfully');
    } catch {
      addToast('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof MarketingSettings['notifications']) =>
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [key]: !s.notifications[key] } }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Zap size={16} className="text-red-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Sierra Approval Mode</p>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500 px-2">Choose how much autonomy Sierra has over your marketing accounts.</p>
          {APPROVAL_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setSettings((s) => ({ ...s, approval_mode: m.value }))}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                settings.approval_mode === m.value
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.label}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor[m.riskLevel]}`}>
                      {m.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{m.description}</p>
                </div>
                {settings.approval_mode === m.value && <Check size={16} className="text-red-500 shrink-0 mt-0.5" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <DollarSign size={16} className="text-green-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Budget Guardrails</p>
        </div>
        <div className="p-6 space-y-4">
          <ToggleRow
            label="Enable Budget Guardrails"
            description="Sierra will never exceed your specified daily or monthly spend caps across all channels."
            value={settings.budget_guard_enabled}
            onChange={(v) => setSettings((s) => ({ ...s, budget_guard_enabled: v }))}
          />
          {settings.budget_guard_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Daily Cap (all channels)
                </label>
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm border-r border-gray-200 dark:border-gray-600">$</span>
                  <input
                    value={settings.daily_cap}
                    onChange={(e) => setSettings((s) => ({ ...s, daily_cap: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    type="number"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Monthly Cap (all channels)
                </label>
                <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm border-r border-gray-200 dark:border-gray-600">$</span>
                  <input
                    value={settings.monthly_cap}
                    onChange={(e) => setSettings((s) => ({ ...s, monthly_cap: Number(e.target.value) }))}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                    type="number"
                    min={0}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Bell size={16} className="text-blue-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
        </div>
        <div className="px-6 py-2">
          <ToggleRow
            label="New Lead Alert"
            description="Notify when a new lead enters the system from any tracked channel."
            value={settings.notifications.new_lead}
            onChange={() => toggleNotification('new_lead')}
          />
          <ToggleRow
            label="Action Queued for Approval"
            description="Notify when Sierra queues a new action requiring your review."
            value={settings.notifications.action_queued}
            onChange={() => toggleNotification('action_queued')}
          />
          <ToggleRow
            label="Pixel / Tracking Issues"
            description="Alert when a conversion pixel stops firing or has data gaps."
            value={settings.notifications.pixel_issue}
            onChange={() => toggleNotification('pixel_issue')}
          />
          <ToggleRow
            label="Budget Threshold Alert"
            description="Notify when daily or monthly spend exceeds 80% of cap."
            value={settings.notifications.budget_alert}
            onChange={() => toggleNotification('budget_alert')}
          />
          <ToggleRow
            label="Weekly Summary Email"
            description="Receive a weekly performance digest every Monday morning."
            value={settings.notifications.weekly_summary}
            onChange={() => toggleNotification('weekly_summary')}
          />
          <ToggleRow
            label="Anomaly Detection Alerts"
            description="Sierra alerts you when it detects unusual spikes or drops in performance."
            value={settings.notifications.anomaly_detected}
            onChange={() => toggleNotification('anomaly_detected')}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Team Permissions</p>
        </div>
        <div className="p-4 space-y-2">
          {[
            { role: 'Owner', permissions: ['View', 'Edit', 'Approve Actions', 'Manage Settings', 'Connect Channels'] },
            { role: 'Admin', permissions: ['View', 'Edit', 'Approve Actions', 'Manage Settings'] },
            { role: 'Marketing Manager', permissions: ['View', 'Edit', 'Approve Actions'] },
            { role: 'Sales Rep', permissions: ['View'] },
          ].map((r) => (
            <div
              key={r.role}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white w-40">{r.role}</p>
              <div className="flex flex-wrap gap-1 flex-1">
                {r.permissions.map((p) => (
                  <span key={p} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
              <button className="text-xs text-gray-400 hover:text-gray-600 ml-2">
                <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
