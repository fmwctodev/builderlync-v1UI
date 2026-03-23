import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Cloud,
  MapPin,
  Wifi,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  AlertTriangle,
  Play,
} from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import {
  getOrCreateOrgSettings,
  updateOrgSettings,
  testStormProviderConnection,
} from '../services/orgSettingsApi';
import { getCreditBalance, getCreditLedgerHistory } from '../services/contactRevealApi';
import { getAvailableStormProviders } from '../providers/stormProvider';
import { getAvailableContactProviders } from '../providers/contactProvider';
import { runMockIngestion } from '../services/noaaEngine';
import type { CanvassOrgSettings, StormProvider, ContactProvider } from '../types';

type SettingsTab = 'general' | 'providers' | 'noaa' | 'credits';

export function CanvassSettingsPage() {
  const { currentOrganization } = useCurrentOrganization();
  const organizationId = currentOrganization?.id;

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<CanvassOrgSettings | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRunningIngestion, setIsRunningIngestion] = useState(false);
  const [ingestionMessage, setIngestionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formState, setFormState] = useState({
    contactRevealCacheHours: 720,
    contactRevealCost: 1,
    allowGpsTracking: false,
    offlineSyncEnabled: true,
    defaultDoorDensity: 150,
    defaultStormProvider: 'MOCK' as StormProvider,
    defaultContactProvider: 'MOCK' as ContactProvider,
    hailtraceApiKey: '',
    hailReconApiKey: '',
    noaaModeEnabled: false,
    mrmsBaseUrl: 'https://mrms.ncep.noaa.gov/data/2D/',
    hailMinThresholdInches: 0.75,
  });

  const stormProviders = getAvailableStormProviders();
  const contactProviders = getAvailableContactProviders();

  useEffect(() => {
    if (!organizationId) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [settingsData, balance, ledger] = await Promise.all([
          getOrCreateOrgSettings(organizationId!),
          getCreditBalance(organizationId!),
          getCreditLedgerHistory(organizationId!),
        ]);

        setSettings(settingsData);
        setCreditBalance(balance);
        setLedgerHistory(ledger.entries);

        setFormState({
          contactRevealCacheHours: settingsData.contact_reveal_cache_hours,
          contactRevealCost: settingsData.contact_reveal_cost,
          allowGpsTracking: settingsData.allow_gps_tracking,
          offlineSyncEnabled: settingsData.offline_sync_enabled,
          defaultDoorDensity: settingsData.default_door_density,
          defaultStormProvider: settingsData.default_storm_provider,
          defaultContactProvider: settingsData.default_contact_provider,
          hailtraceApiKey: settingsData.hailtrace_api_key || '',
          hailReconApiKey: settingsData.hail_recon_api_key || '',
          noaaModeEnabled: settingsData.noaa_mode_enabled || false,
          mrmsBaseUrl: settingsData.mrms_base_url || 'https://mrms.ncep.noaa.gov/data/2D/',
          hailMinThresholdInches: settingsData.hail_min_threshold_inches || 0.75,
        });
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [organizationId]);

  const handleSave = async () => {
    if (!organizationId) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateOrgSettings(organizationId, {
        contact_reveal_cache_hours: formState.contactRevealCacheHours,
        contact_reveal_cost: formState.contactRevealCost,
        allow_gps_tracking: formState.allowGpsTracking,
        offline_sync_enabled: formState.offlineSyncEnabled,
        default_door_density: formState.defaultDoorDensity,
        default_storm_provider: formState.defaultStormProvider,
        default_contact_provider: formState.defaultContactProvider,
        hailtrace_api_key: formState.hailtraceApiKey || undefined,
        hail_recon_api_key: formState.hailReconApiKey || undefined,
        noaa_mode_enabled: formState.noaaModeEnabled,
        mrms_base_url: formState.mrmsBaseUrl || undefined,
        hail_min_threshold_inches: formState.hailMinThresholdInches,
      });

      setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestStormProvider = async () => {
    const result = await testStormProviderConnection(
      formState.defaultStormProvider,
      formState.defaultStormProvider === 'HAILTRACE'
        ? formState.hailtraceApiKey
        : formState.hailReconApiKey
    );
    alert(result.message);
  };

  const handleRunIngestion = async () => {
    if (!organizationId) return;
    setIsRunningIngestion(true);
    setIngestionMessage(null);
    try {
      const result = await runMockIngestion(organizationId);
      setIngestionMessage({
        type: 'success',
        text: `Ingestion complete: ${result.eventsCreated} events created, ${result.layersCreated} layers created`,
      });
    } catch (err) {
      setIngestionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Ingestion failed',
      });
    } finally {
      setIsRunningIngestion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TABS: Array<{ id: SettingsTab; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'providers', label: 'Data Providers' },
    { id: 'noaa', label: 'Storm Data (NOAA)' },
    { id: 'credits', label: 'Credits' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Canvassing Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure storm canvassing preferences and integrations
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Canvassing Options
              </h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.allowGpsTracking}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, allowGpsTracking: e.target.checked }))
                  }
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Enable GPS Tracking
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track rep locations and show on manager dashboard
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.offlineSyncEnabled}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, offlineSyncEnabled: e.target.checked }))
                  }
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Enable Offline Mode
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow reps to log visits while offline
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Door Density (per turf)
                </label>
                <input
                  type="number"
                  value={formState.defaultDoorDensity}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      defaultDoorDensity: parseInt(e.target.value) || 100,
                    }))
                  }
                  min={10}
                  max={500}
                  className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Storm Data Provider
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Storm Provider
                </label>
                <select
                  value={formState.defaultStormProvider}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      defaultStormProvider: e.target.value as StormProvider,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {stormProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              {formState.defaultStormProvider === 'HAILTRACE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    HailTrace API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={formState.hailtraceApiKey}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, hailtraceApiKey: e.target.value }))
                      }
                      placeholder="Enter your HailTrace API key"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleTestStormProvider}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Test
                    </button>
                  </div>
                </div>
              )}

              {formState.defaultStormProvider === 'HAIL_RECON' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hail Recon API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={formState.hailReconApiKey}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, hailReconApiKey: e.target.value }))
                      }
                      placeholder="Enter your Hail Recon API key"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleTestStormProvider}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Test
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Contact Provider
                </label>
                <select
                  value={formState.defaultContactProvider}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      defaultContactProvider: e.target.value as ContactProvider,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {contactProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'noaa' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    NOAA Storm Data Engine
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Auto-ingest hail and severe weather data from NOAA MRMS
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formState.noaaModeEnabled}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, noaaModeEnabled: e.target.checked }))
                    }
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Enable NOAA Mode
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use NOAA MRMS radar-derived hail data for storm events
                    </p>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    MRMS Base URL
                  </label>
                  <input
                    type="url"
                    value={formState.mrmsBaseUrl}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, mrmsBaseUrl: e.target.value }))
                    }
                    placeholder="https://mrms.ncep.noaa.gov/data/2D/"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    NOAA MRMS GRIB2 data endpoint for mesh hail analysis
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Hail Threshold: {formState.hailMinThresholdInches}"
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.75"
                    step="0.05"
                    value={formState.hailMinThresholdInches}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        hailMinThresholdInches: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0.1" (Trace)</span>
                    <span>0.75" (Quarter)</span>
                    <span>1.75" (Golf Ball)</span>
                    <span>2.75" (Baseball)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Only import storm events where max hail exceeds this size
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manual Ingestion
                </h2>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Manually trigger a storm data ingestion run to pull the latest events from the configured provider.
                In demo mode, this generates realistic mock storm events with hail data.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunIngestion}
                  disabled={isRunningIngestion}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isRunningIngestion ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isRunningIngestion ? 'Running...' : 'Run Ingestion Now'}
                </button>

                {ingestionMessage && (
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      ingestionMessage.type === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {ingestionMessage.type === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {ingestionMessage.text}
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  NOAA MRMS integration is currently in mock/demo mode. Real MRMS ingestion
                  requires a server-side worker process. Contact support to enable live data ingestion.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Reveal Credits
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current balance: <span className="font-bold text-green-600">{creditBalance}</span> credits
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cache Duration (hours)
                </label>
                <input
                  type="number"
                  value={formState.contactRevealCacheHours}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      contactRevealCacheHours: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  How long to cache revealed contacts before re-charging
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost Per Reveal
                </label>
                <input
                  type="number"
                  value={formState.contactRevealCost}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      contactRevealCost: parseInt(e.target.value) || 1,
                    }))
                  }
                  min={1}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {ledgerHistory.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4" />
                  Recent Activity
                </h3>
                <div className="space-y-1">
                  {ledgerHistory.slice(0, 8).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {entry.ledger_type}: {entry.reason || 'N/A'}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            entry.delta > 0
                              ? 'text-green-600 dark:text-green-400 font-medium'
                              : 'text-red-600 dark:text-red-400 font-medium'
                          }
                        >
                          {entry.delta > 0 ? '+' : ''}
                          {entry.delta}
                        </span>
                        {entry.balance_after != null && (
                          <span className="text-xs text-gray-400">
                            bal: {entry.balance_after}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {saveMessage && (
            <div
              className={`flex items-center gap-2 text-sm ${
                saveMessage.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {saveMessage.text}
            </div>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
