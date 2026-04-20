import { useState } from 'react';
import { Bell, BellOff, Plus, Trash2, Mail, Monitor, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import type { ZoneAlertSubscription, CreateZoneSubscriptionInput } from '../../services/zoneSubscriptionsApi';
import type { NWSZone } from '../../services/nwsApiService';

export interface ZoneSubscriptionsPanelProps {
  subscriptions: ZoneAlertSubscription[];
  availableZones?: NWSZone[];
  zonesLoading?: boolean;
  onCreateSubscription: (input: CreateZoneSubscriptionInput) => Promise<void>;
  onToggleSubscription: (id: string, isActive: boolean) => Promise<void>;
  onDeleteSubscription: (id: string) => Promise<void>;
}

export function ZoneSubscriptionsPanel({
  subscriptions,
  availableZones = [],
  zonesLoading,
  onCreateSubscription,
  onToggleSubscription,
  onDeleteSubscription,
}: ZoneSubscriptionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = subscriptions.filter((s) => s.is_active).length;

  const handleAddSubscription = async () => {
    const zone = availableZones.find(
      (z) => z.properties.id === selectedZoneId
    );
    if (!zone) return;

    setIsSubmitting(true);
    try {
      await onCreateSubscription({
        zone_code: zone.properties.id,
        zone_name: zone.properties.name,
        state_code: zone.properties.state || '',
        zone_type: zone.properties.type || 'Z',
        notify_email: notifyEmail,
        notify_push: notifyPush,
      });
      setShowAddForm(false);
      setSelectedZoneId('');
    } catch {
      // handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Zone Alerts
          </span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {subscriptions.length === 0 && !showAddForm && (
            <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
              No zone subscriptions yet. Add zones to receive storm alerts.
            </p>
          )}

          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                sub.is_active
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {sub.zone_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{sub.zone_code}</span>
                  <div className="flex items-center gap-1">
                    {sub.notify_push && <Monitor className="w-3 h-3 text-gray-400" />}
                    {sub.notify_email && <Mail className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => onToggleSubscription(sub.id, !sub.is_active)}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={sub.is_active ? 'Pause' : 'Resume'}
                >
                  {sub.is_active ? (
                    <Bell className="w-3.5 h-3.5 text-primary-500" />
                  ) : (
                    <BellOff className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => onDeleteSubscription(sub.id)}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}

          {showAddForm ? (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full px-2.5 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">
                  {zonesLoading ? 'Loading zones...' : 'Select a forecast zone'}
                </option>
                {availableZones
                  .filter((z) => !subscriptions.some((s) => s.zone_code === z.properties.id))
                  .map((z) => (
                    <option key={z.properties.id} value={z.properties.id}>
                      {z.properties.name} ({z.properties.id})
                    </option>
                  ))}
              </select>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={notifyPush}
                    onChange={(e) => setNotifyPush(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <Monitor className="w-3 h-3" />
                  Browser
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="rounded text-primary-600"
                  />
                  <Mail className="w-3 h-3" />
                  Email
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubscription}
                  disabled={!selectedZoneId || isSubmitting}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Zone'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Zone Subscription
            </button>
          )}
        </div>
      )}
    </div>
  );
}
