import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Plus,
  Settings,
  Users,
  Bell,
  Check,
  X,
  Loader2,
  User,
  Home,
  ChevronDown,
  ChevronRight,
  Save,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../shared/lib/supabase';
import { getOrCreateOrgSettings, updateOrgSettings } from '../../services/orgSettingsApi';
import { getTurfs, createTurf } from '../../services/turfsApi';
import { getStormEvents } from '../../services/stormEventsApi';
import type { Turf, StormEvent, TurfStatus, TrackedEventType } from '../../types';
import { ALL_TRACKED_EVENT_TYPES, TRACKED_EVENT_TYPE_LABELS } from '../../types';
import { CreateTurfModal } from '../../components/panels/CreateTurfModal';

interface OrgMember {
  user_id: string;
  full_name: string | null;
  email: string;
}

interface Props {
  organizationId: string;
  userId: string;
  onSettingsChanged?: (settings: {
    trackedEventTypes: TrackedEventType[];
    historicalDaysBack: number;
  }) => void;
}

const TURF_STATUS_STYLES: Record<TurfStatus, { bg: string; text: string; label: string }> = {
  NOT_STARTED: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-400',
    label: 'Not Started',
  },
  IN_PROGRESS: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'In Progress',
  },
  COMPLETED: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    label: 'Completed',
  },
  ARCHIVED: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-500 dark:text-gray-500',
    label: 'Archived',
  },
};

function SectionCard({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600 dark:text-blue-400">{icon}</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

export function IntelligenceSettingsTab({ organizationId, userId, onSettingsChanged }: Props) {
  const navigate = useNavigate();

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [stormEvents, setStormEvents] = useState<StormEvent[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);

  const [trackedEventTypes, setTrackedEventTypes] = useState<Set<TrackedEventType>>(
    new Set(ALL_TRACKED_EVENT_TYPES)
  );
  const [historicalDaysBack, setHistoricalDaysBack] = useState(90);
  const [recipientUserIds, setRecipientUserIds] = useState<Set<string>>(new Set());
  const [externalEmails, setExternalEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  const [isLoadingTurfs, setIsLoadingTurfs] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingRecipients, setIsSavingRecipients] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [recipientsSaved, setRecipientsSaved] = useState(false);

  const [showCreateTurfModal, setShowCreateTurfModal] = useState(false);

  const loadTurfs = useCallback(async () => {
    if (!organizationId) return;
    setIsLoadingTurfs(true);
    try {
      const [turfsData, eventsData] = await Promise.all([
        getTurfs(organizationId),
        getStormEvents(organizationId),
      ]);
      setTurfs(turfsData);
      setStormEvents(eventsData);
    } catch (err) {
      console.error('Error loading turfs:', err);
    } finally {
      setIsLoadingTurfs(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadTurfs();
  }, [loadTurfs]);

  useEffect(() => {
    if (!organizationId) return;
    setIsLoadingSettings(true);
    getOrCreateOrgSettings(organizationId)
      .then((settings) => {
        if (settings.tracked_event_types && settings.tracked_event_types.length > 0) {
          setTrackedEventTypes(new Set(settings.tracked_event_types as TrackedEventType[]));
        }
        if (settings.default_historical_days_back) {
          setHistoricalDaysBack(settings.default_historical_days_back);
        }
        if (settings.alert_recipient_user_ids) {
          setRecipientUserIds(new Set(settings.alert_recipient_user_ids));
        }
        if (settings.alert_recipient_external_emails) {
          setExternalEmails(settings.alert_recipient_external_emails);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingSettings(false));
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    setIsLoadingMembers(true);
    supabase
      .from('organization_members')
      .select('user_id, user_profiles(full_name, email)')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading members:', error);
          return;
        }
        const mapped: OrgMember[] = (data || []).map((m: any) => ({
          user_id: m.user_id,
          full_name: m.user_profiles?.full_name || null,
          email: m.user_profiles?.email || '',
        }));
        setMembers(mapped);
      })
      .finally(() => setIsLoadingMembers(false));
  }, [organizationId]);

  const handleCreateTurf = async (data: {
    name: string;
    description: string;
    stormEventId: string;
    color: string;
  }) => {
    const defaultGeometry: GeoJSON.MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [[[[-97.9, 30.1], [-97.5, 30.1], [-97.5, 30.5], [-97.9, 30.5], [-97.9, 30.1]]]],
    };
    await createTurf(organizationId, {
      name: data.name,
      description: data.description || undefined,
      geometry: defaultGeometry,
      stormEventId: data.stormEventId || undefined,
      color: data.color,
    });
    await loadTurfs();
  };

  const toggleEventType = (type: TrackedEventType) => {
    setTrackedEventTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) return prev;
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setPreferencesSaved(false);
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      await updateOrgSettings(organizationId, {
        tracked_event_types: [...trackedEventTypes],
        default_historical_days_back: historicalDaysBack,
      });
      setPreferencesSaved(true);
      onSettingsChanged?.({
        trackedEventTypes: [...trackedEventTypes],
        historicalDaysBack,
      });
      setTimeout(() => setPreferencesSaved(false), 2500);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const toggleRecipientUser = (userId: string) => {
    setRecipientUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
    setRecipientsSaved(false);
  };

  const addExternalEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (externalEmails.includes(email)) {
      setEmailError('This email has already been added');
      return;
    }
    setExternalEmails((prev) => [...prev, email]);
    setEmailInput('');
    setEmailError('');
    setRecipientsSaved(false);
  };

  const removeExternalEmail = (email: string) => {
    setExternalEmails((prev) => prev.filter((e) => e !== email));
    setRecipientsSaved(false);
  };

  const handleSaveRecipients = async () => {
    setIsSavingRecipients(true);
    try {
      await updateOrgSettings(organizationId, {
        alert_recipient_user_ids: [...recipientUserIds],
        alert_recipient_external_emails: externalEmails,
      });
      setRecipientsSaved(true);
      setTimeout(() => setRecipientsSaved(false), 2500);
    } catch (err) {
      console.error('Error saving recipients:', err);
    } finally {
      setIsSavingRecipients(false);
    }
  };

  const eventForTurf = (turf: Turf) =>
    stormEvents.find((e) => e.id === turf.storm_event_id);

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Turf Management */}
      <SectionCard title="Turf Management" icon={<MapPin className="w-5 h-5" />}>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your canvassing territories linked to storm events.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateTurfModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Turf
              </button>
              <button
                onClick={() => navigate('/storm-canvassing/turfs')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Manage All
              </button>
            </div>
          </div>

          {isLoadingTurfs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : turfs.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
              <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No turfs yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Create your first turf to start canvassing
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
              {turfs.slice(0, 8).map((turf) => {
                const event = eventForTurf(turf);
                const statusStyle = TURF_STATUS_STYLES[turf.status];
                return (
                  <div
                    key={turf.id}
                    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: turf.color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {turf.name}
                      </p>
                      {event && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {event.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {turf.total_doors != null && turf.total_doors > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {turf.total_doors}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {turfs.length > 8 && (
                <button
                  onClick={() => navigate('/storm-canvassing/turfs')}
                  className="w-full px-4 py-2.5 text-xs text-blue-600 dark:text-blue-400 text-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors bg-white dark:bg-gray-800"
                >
                  View all {turfs.length} turfs
                </button>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Storm Tracking Preferences */}
      <SectionCard title="Storm Tracking Preferences" icon={<Settings className="w-5 h-5" />}>
        <div className="mt-4 space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracked Event Types
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Select the storm categories shown across Real-Time Alerts and Zone Subscriptions.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TRACKED_EVENT_TYPES.map((type) => {
                const active = trackedEventTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleEventType(type)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        active ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {active && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span>{TRACKED_EVENT_TYPE_LABELS[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Historical Lookback Window
              </p>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {historicalDaysBack} days
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Default date range loaded in the Historical Storm Paths tab.
            </p>
            <input
              type="range"
              min={7}
              max={365}
              step={1}
              value={historicalDaysBack}
              onChange={(e) => {
                setHistoricalDaysBack(Number(e.target.value));
                setPreferencesSaved(false);
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>7 days</span>
              <span>1 year</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={isSavingPreferences}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                preferencesSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }`}
            >
              {isSavingPreferences ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : preferencesSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {preferencesSaved ? 'Saved' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Alert Recipients */}
      <SectionCard title="Alert Recipients" icon={<Bell className="w-5 h-5" />}>
        <div className="mt-4 space-y-5">
          {/* Org Staff */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Members
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Select staff who should receive storm alerts for your operating areas.
            </p>
            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                No team members found
              </p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {members.map((member) => {
                  const isSelected = recipientUserIds.has(member.user_id);
                  const displayName = member.full_name || member.email;
                  const initials = displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={member.user_id}
                      onClick={() => toggleRecipientUser(member.user_id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                        {initials || <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {displayName}
                        </p>
                        {member.full_name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* External Emails */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              External Email Addresses
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Add email addresses for people outside your team who should receive alerts.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addExternalEmail();
                    }
                  }}
                  placeholder="email@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addExternalEmail}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {emailError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{emailError}</p>
            )}
            {externalEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {externalEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                  >
                    {email}
                    <button
                      onClick={() => removeExternalEmail(email)}
                      className="ml-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveRecipients}
              disabled={isSavingRecipients}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                recipientsSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
              }`}
            >
              {isSavingRecipients ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : recipientsSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {recipientsSaved ? 'Saved' : 'Save Recipients'}
            </button>
          </div>
        </div>
      </SectionCard>

      {showCreateTurfModal && (
        <CreateTurfModal
          stormEvents={stormEvents}
          onConfirm={handleCreateTurf}
          onClose={() => setShowCreateTurfModal(false)}
        />
      )}
    </div>
  );
}
