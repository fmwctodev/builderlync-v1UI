import { useState, useEffect } from 'react';
import {
  Radar,
  CloudLightning,
  History,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import { getOrgSettings } from '../services/orgSettingsApi';
import type { TrackedEventType } from '../types';
import { ALL_TRACKED_EVENT_TYPES } from '../types';

import { RealTimeAlertsTab } from './storm-intelligence/RealTimeAlertsTab';
import { HistoricalStormTab } from './storm-intelligence/HistoricalStormTab';
import { HailForecastTab } from './storm-intelligence/HailForecastTab';
import { ZoneAlertsTab } from './storm-intelligence/ZoneAlertsTab';
import { IntelligenceSettingsTab } from './storm-intelligence/IntelligenceSettingsTab';

type Tab = 'realtime' | 'historical' | 'forecast' | 'zones' | 'settings';

const TABS: Array<{ id: Tab; label: string; shortLabel: string; icon: React.ReactNode; description: string }> = [
  {
    id: 'realtime',
    label: 'Real-Time Alerts',
    shortLabel: 'Live Alerts',
    icon: <CloudLightning className="w-4 h-4" />,
    description: 'Active NWS warnings & watches with live polygon overlays',
  },
  {
    id: 'historical',
    label: 'Historical Storm Paths',
    shortLabel: 'History',
    icon: <History className="w-4 h-4" />,
    description: 'Past hail observations from nearby weather stations',
  },
  {
    id: 'forecast',
    label: 'Hail Risk Forecast',
    shortLabel: 'Forecast',
    icon: <BarChart3 className="w-4 h-4" />,
    description: '7-day gridpoint hail risk using NWS forecast data',
  },
  {
    id: 'zones',
    label: 'Zone Subscriptions',
    shortLabel: 'Alerts',
    icon: <Bell className="w-4 h-4" />,
    description: 'Subscribe to UGC zones for geofenced notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: <Settings className="w-4 h-4" />,
    description: 'Turfs, alert preferences, and tracking configuration',
  },
];

export function StormIntelligencePage() {
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const { user } = useSupabaseUser();
  const organizationId = currentOrganization?.id || '';
  const userId = user?.id || '';

  const [activeTab, setActiveTab] = useState<Tab>('realtime');
  const [operatingStates, setOperatingStates] = useState<string[]>([]);
  const [trackedEventTypes, setTrackedEventTypes] = useState<TrackedEventType[]>(ALL_TRACKED_EVENT_TYPES);
  const [historicalDaysBack, setHistoricalDaysBack] = useState(90);

  useEffect(() => {
    if (!organizationId) return;
    getOrgSettings(organizationId).then((settings) => {
      if (settings?.operating_states && settings.operating_states.length > 0) {
        setOperatingStates(settings.operating_states);
      }
      if (settings?.tracked_event_types && settings.tracked_event_types.length > 0) {
        setTrackedEventTypes(settings.tracked_event_types as TrackedEventType[]);
      }
      if (settings?.default_historical_days_back) {
        setHistoricalDaysBack(settings.default_historical_days_back);
      }
    }).catch(() => {});
  }, [organizationId]);

  const handleSettingsChanged = ({
    trackedEventTypes: newTypes,
    historicalDaysBack: newDays,
  }: {
    trackedEventTypes: TrackedEventType[];
    historicalDaysBack: number;
  }) => {
    setTrackedEventTypes(newTypes);
    setHistoricalDaysBack(newDays);
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Radar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Storm Intelligence</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentTab?.description}
                {operatingStates.length > 0 && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    Monitoring: {operatingStates.join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/storm-canvassing/settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Configure States
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'realtime' && (
          <RealTimeAlertsTab operatingStates={operatingStates} />
        )}
        {activeTab === 'historical' && (
          <HistoricalStormTab operatingStates={operatingStates} />
        )}
        {activeTab === 'forecast' && (
          <HailForecastTab />
        )}
        {activeTab === 'zones' && organizationId && userId && (
          <ZoneAlertsTab
            organizationId={organizationId}
            userId={userId}
            operatingStates={operatingStates}
          />
        )}
        {activeTab === 'settings' && organizationId && userId && (
          <IntelligenceSettingsTab
            organizationId={organizationId}
            userId={userId}
            onSettingsChanged={handleSettingsChanged}
          />
        )}
      </div>
    </div>
  );
}
