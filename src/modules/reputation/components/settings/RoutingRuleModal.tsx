import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { UserAssignmentDropdown } from '../common/UserAssignmentDropdown';
import type { ReputationRoutingRule, RoutingRuleFormValues, Platform, Priority } from '../../types';

interface Props {
  orgId: string;
  rule: ReputationRoutingRule | null;
  onSave: (values: RoutingRuleFormValues) => Promise<void>;
  onClose: () => void;
}

const EMPTY: RoutingRuleFormValues = {
  platform: null,
  min_rating: 1,
  max_rating: 3,
  assign_to_user_id: null,
  assign_to_role: null,
  priority: 'normal',
  requires_manual_approval: false,
};

export const RoutingRuleModal: React.FC<Props> = ({ orgId, rule, onSave, onClose }) => {
  const [form, setForm] = useState<RoutingRuleFormValues>(EMPTY);
  const [assignMode, setAssignMode] = useState<'user' | 'role'>('user');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setForm({
        platform: rule.platform,
        min_rating: rule.min_rating,
        max_rating: rule.max_rating,
        assign_to_user_id: rule.assign_to_user_id,
        assign_to_role: rule.assign_to_role,
        priority: rule.priority,
        requires_manual_approval: rule.requires_manual_approval,
      });
      setAssignMode(rule.assign_to_role ? 'role' : 'user');
    }
  }, [rule]);

  const set = <K extends keyof RoutingRuleFormValues>(key: K, val: RoutingRuleFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (form.min_rating > form.max_rating) {
      setError('Min rating cannot exceed max rating.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: RoutingRuleFormValues = {
        ...form,
        assign_to_user_id: assignMode === 'user' ? form.assign_to_user_id : null,
        assign_to_role: assignMode === 'role' ? form.assign_to_role : null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {rule ? 'Edit Routing Rule' : 'Add Routing Rule'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Platform
            </label>
            <select
              value={form.platform ?? ''}
              onChange={(e) => set('platform', (e.target.value as Platform) || null)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any platform</option>
              <option value="googlebusiness">Google Business</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Rating Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.min_rating}
                  onChange={(e) => set('min_rating', Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-gray-400 mt-5">–</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.max_rating}
                  onChange={(e) => set('max_rating', Math.min(5, Math.max(1, parseInt(e.target.value) || 5)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Assign To
            </label>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden mb-2">
              {(['user', 'role'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAssignMode(mode)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    assignMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {mode === 'user' ? 'Specific User' : 'By Role'}
                </button>
              ))}
            </div>

            {assignMode === 'user' ? (
              <UserAssignmentDropdown
                orgId={orgId}
                value={form.assign_to_user_id}
                onChange={(v) => set('assign_to_user_id', v)}
                placeholder="Select user…"
              />
            ) : (
              <select
                value={form.assign_to_role ?? ''}
                onChange={(e) => set('assign_to_role', e.target.value || null)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select role…</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="staff">Staff</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as Priority)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.requires_manual_approval}
              onChange={(e) => set('requires_manual_approval', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Requires manual approval before replying</span>
          </label>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {rule ? 'Save Changes' : 'Add Rule'}
          </button>
        </div>
      </div>
    </div>
  );
};
