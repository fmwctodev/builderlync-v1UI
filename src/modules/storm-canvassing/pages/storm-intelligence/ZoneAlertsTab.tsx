import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  MapPin,
  CloudLightning,
  X,
  Search,
} from 'lucide-react';
import type { ZoneAlertSubscription } from '../../services/zoneSubscriptionsApi';
import type { ParsedHailAlert, NWSSeverity } from '../../services/nwsApiService';
import {
  getZoneSubscriptions,
  createZoneSubscription,
  deleteZoneSubscription,
  toggleZoneSubscription,
} from '../../services/zoneSubscriptionsApi';
import { fetchActiveAlertsByZone, fetchZonesByState, formatAlertExpiry } from '../../services/nwsApiService';

interface Props {
  organizationId: string;
  userId: string;
  operatingStates: string[];
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const SEVERITY_OPTIONS: NWSSeverity[] = ['Minor', 'Moderate', 'Severe', 'Extreme'];

const DEFAULT_EVENT_TYPES = [
  'Severe Thunderstorm Warning',
  'Tornado Warning',
  'Severe Thunderstorm Watch',
  'Tornado Watch',
  'Flash Flood Warning',
  'Winter Storm Warning',
];

function SubscriptionCard({
  sub,
  alerts,
  onDelete,
  onToggle,
}: {
  sub: ZoneAlertSubscription;
  alerts: ParsedHailAlert[];
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}) {
  const activeAlerts = alerts.filter(
    (a) => a.ugcZones.includes(sub.zone_code) || a.ugcZones.some((z) => z.endsWith(sub.zone_code.slice(-3)))
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 transition-opacity ${
        sub.is_active ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`p-2 rounded-lg ${
              sub.is_active
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {sub.is_active ? (
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {sub.zone_name || sub.zone_code}
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {sub.zone_code}
              </span>
              <span className="text-xs text-gray-400">{sub.state_code}</span>
              {activeAlerts.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>Min severity: {sub.min_severity}</span>
              <span>{sub.event_types.length} event type{sub.event_types.length !== 1 ? 's' : ''}</span>
              {sub.notify_push && <span className="text-blue-500">Push on</span>}
            </div>

            {activeAlerts.length > 0 && (
              <div className="mt-3 space-y-2">
                {activeAlerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800"
                  >
                    <CloudLightning className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">{alert.event}</span>
                    <span className="text-xs text-red-500 ml-auto shrink-0">{formatAlertExpiry(alert.expires)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggle(!sub.is_active)}
            title={sub.is_active ? 'Pause subscription' : 'Activate subscription'}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sub.is_active ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            title="Delete subscription"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddZoneModal({
  onClose,
  onAdd,
  operatingStates,
}: {
  onClose: () => void;
  onAdd: (data: {
    zone_code: string;
    zone_name: string;
    state_code: string;
    zone_type: string;
    min_severity: NWSSeverity;
    event_types: string[];
    notify_push: boolean;
  }) => Promise<void>;
  operatingStates: string[];
}) {
  const [step, setStep] = useState<'search' | 'configure'>('search');
  const [selectedState, setSelectedState] = useState(operatingStates[0] || 'TX');
  const [zoneSearch, setZoneSearch] = useState('');
  const [zones, setZones] = useState<Array<{ code: string; name: string }>>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{ code: string; name: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [config, setConfig] = useState({
    min_severity: 'Severe' as NWSSeverity,
    event_types: DEFAULT_EVENT_TYPES.slice(0, 4),
    notify_push: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadZones = async (state: string) => {
    setLoadingZones(true);
    try {
      const data = await fetchZonesByState(state);
      setZones(data.map((z) => ({ code: z.properties.id, name: z.properties.name })));
    } catch {
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  };

  useEffect(() => {
    loadZones(selectedState);
  }, [selectedState]);

  const filteredZones = zones.filter(
    (z) =>
      !zoneSearch ||
      z.name.toLowerCase().includes(zoneSearch.toLowerCase()) ||
      z.code.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const handleProceed = () => {
    if (!selectedZone && !manualCode.trim()) return;
    setStep('configure');
  };

  const handleAdd = async () => {
    const zoneCode = selectedZone?.code || manualCode.trim().toUpperCase();
    const zoneName = selectedZone?.name || zoneCode;
    if (!zoneCode) return;

    setIsSaving(true);
    try {
      await onAdd({
        zone_code: zoneCode,
        zone_name: zoneName,
        state_code: selectedState,
        zone_type: zoneCode.match(/[CZ]/)?.[0] || 'Z',
        min_severity: config.min_severity,
        event_types: config.event_types,
        notify_push: config.notify_push,
      });
      onClose();
    } catch {
      // handle silently
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Zone Subscription</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          {step === 'search' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search NWS Forecast Zones
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={zoneSearch}
                    onChange={(e) => setZoneSearch(e.target.value)}
                    placeholder="Search by name or zone code..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {loadingZones ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredZones.slice(0, 30).map((zone) => (
                    <button
                      key={zone.code}
                      onClick={() => setSelectedZone(zone)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                        selectedZone?.code === zone.code
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{zone.name}</span>
                      <span className="font-mono text-xs text-gray-400">{zone.code}</span>
                    </button>
                  ))}
                  {filteredZones.length === 0 && (
                    <div className="px-3 py-4 text-sm text-gray-400 text-center">No zones found</div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Or enter UGC code manually (e.g. TXZ001)
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="TXZ001"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  disabled={!selectedZone && !manualCode.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  Configure →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm text-blue-900 dark:text-blue-200">
                    {selectedZone?.name || manualCode}
                  </span>
                  <span className="font-mono text-xs text-blue-600">
                    {selectedZone?.code || manualCode}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Severity
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SEVERITY_OPTIONS.map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setConfig((c) => ({ ...c, min_severity: sev }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        config.min_severity === sev
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {sev}+
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Event Types
                </label>
                <div className="space-y-1.5">
                  {DEFAULT_EVENT_TYPES.map((et) => (
                    <label key={et} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={config.event_types.includes(et)}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            event_types: e.target.checked
                              ? [...c.event_types, et]
                              : c.event_types.filter((t) => t !== et),
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{et}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={config.notify_push}
                  onChange={(e) => setConfig((c) => ({ ...c, notify_push: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-gray-700 dark:text-gray-300">Enable push notifications</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep('search')}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleAdd}
                  disabled={isSaving || config.event_types.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  Subscribe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ZoneAlertsTab({ organizationId, userId, operatingStates }: Props) {
  const [subscriptions, setSubscriptions] = useState<ZoneAlertSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<ParsedHailAlert[]>([]);
  const [checkingAlerts, setCheckingAlerts] = useState(false);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await getZoneSubscriptions(organizationId, userId);
      setSubscriptions(data);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  };

  const checkActiveAlerts = async () => {
    const activeSubs = subscriptions.filter((s) => s.is_active);
    if (activeSubs.length === 0) return;

    setCheckingAlerts(true);
    const allAlerts: ParsedHailAlert[] = [];
    const seen = new Set<string>();

    for (const sub of activeSubs) {
      try {
        const alerts = await fetchActiveAlertsByZone(sub.zone_code);
        for (const alert of alerts) {
          if (!seen.has(alert.id)) {
            seen.add(alert.id);
            allAlerts.push(alert);
          }
        }
      } catch {
        //
      }
    }

    setActiveAlerts(allAlerts);
    setCheckingAlerts(false);
  };

  useEffect(() => {
    loadSubscriptions();
  }, [organizationId, userId]);

  useEffect(() => {
    if (subscriptions.length > 0) checkActiveAlerts();
  }, [subscriptions.length]);

  const handleAdd = async (data: Parameters<typeof createZoneSubscription>[2]) => {
    const newSub = await createZoneSubscription(organizationId, userId, data);
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const handleDelete = async (id: string) => {
    await deleteZoneSubscription(id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggle = async (id: string, active: boolean) => {
    await toggleZoneSubscription(id, active);
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: active } : s)));
  };

  const totalActive = subscriptions.filter((s) => s.is_active).length;
  const alertingZones = subscriptions.filter((s) =>
    activeAlerts.some((a) => a.ugcZones.some((z) => s.zone_code.includes(z.slice(-3))))
  ).length;

  return (
    <div className="space-y-5">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm text-green-900 dark:text-green-200 mb-1">
              Zone-Based Alert Subscriptions
            </h3>
            <p className="text-xs text-green-700 dark:text-green-300">
              Subscribe to specific NWS UGC forecast zones or counties. When a hail or storm alert
              is issued for a subscribed zone, you'll be notified. Uses NWS zone codes (e.g. TXZ001
              for Texas forecast zone 001).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{subscriptions.length}</div>
            <div className="text-xs text-gray-500">Subscriptions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalActive}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          {alertingZones > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alertingZones}</div>
              <div className="text-xs text-gray-500">Alerting Now</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={checkActiveAlerts}
            disabled={checkingAlerts || subscriptions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingAlerts ? 'animate-spin' : ''}`} />
            Check Alerts
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Zone
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="font-medium text-gray-900 dark:text-white mb-1">No zone subscriptions yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Subscribe to NWS zones to get notified when storm alerts are issued
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Zone
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              alerts={activeAlerts}
              onDelete={() => handleDelete(sub.id)}
              onToggle={(active) => handleToggle(sub.id, active)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddZoneModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
          operatingStates={operatingStates.length > 0 ? operatingStates : US_STATES.slice(0, 5)}
        />
      )}
    </div>
  );
}
