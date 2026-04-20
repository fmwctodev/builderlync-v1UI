import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Plus,
  Camera,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Briefcase,
  Tag,
} from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import { getDoorById, updateDoor } from '../services/doorsApi';
import { getVisitsByDoor } from '../services/visitsApi';
import { revealContact } from '../services/contactRevealApi';
import { getOrCreateOrgSettings } from '../services/orgSettingsApi';
import type { Door, CanvassVisit, CanvassOrgSettings } from '../types';
import { supabase } from '../../../shared/lib/supabase';

const OUTCOME_CONFIG = {
  NO_ANSWER: { label: 'No Answer', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: <Clock className="w-3 h-3" /> },
  NOT_HOME: { label: 'Not Home', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: <Home className="w-3 h-3" /> },
  INTERESTED: { label: 'Interested', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
  APPOINTMENT_SET: { label: 'Appointment Set', color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400', icon: <Calendar className="w-3 h-3" /> },
  NOT_INTERESTED: { label: 'Not Interested', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
  FOLLOW_UP: { label: 'Follow Up', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <MessageSquare className="w-3 h-3" /> },
  CALLBACK_REQUESTED: { label: 'Callback', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <Phone className="w-3 h-3" /> },
  DO_NOT_KNOCK: { label: 'Do Not Knock', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <AlertTriangle className="w-3 h-3" /> },
} as const;

export function DoorDetailPage() {
  const { doorId } = useParams<{ doorId: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useCurrentOrganization();
  const { user } = useSupabaseUser();
  const organizationId = currentOrganization?.id;

  const [door, setDoor] = useState<Door | null>(null);
  const [visits, setVisits] = useState<CanvassVisit[]>([]);
  const [orgSettings, setOrgSettings] = useState<CanvassOrgSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'visits' | 'actions' | 'media'>('visits');
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId || !doorId) return;
    loadData();
  }, [organizationId, doorId]);

  async function loadData() {
    if (!organizationId || !doorId) return;
    setIsLoading(true);
    try {
      const [doorData, visitsData, settings] = await Promise.all([
        getDoorById(organizationId, doorId),
        getVisitsByDoor(organizationId, doorId),
        getOrCreateOrgSettings(organizationId),
      ]);
      setDoor(doorData);
      setVisits(visitsData);
      setOrgSettings(settings);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRevealContact = async () => {
    if (!organizationId || !userId || !doorId) return;
    setIsRevealing(true);
    try {
      const result = await revealContact(organizationId, doorId, user!.id);
      if (!result.fromCache) {
        setCreditBalance((prev) => prev - result.creditsCharged);
      }
      setDoor((prev) => prev ? { ...prev, revealed_contact: result.reveal } : prev);
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCreateContact = async () => {
    if (!organizationId || !door) return;
    setIsCreatingContact(true);
    try {
      const nameParts = (door.revealed_contact?.name || 'Unknown Owner').split(' ');
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          organization_id: organizationId,
          first_name: nameParts[0] || 'Unknown',
          last_name: nameParts.slice(1).join(' ') || 'Owner',
          phone: door.revealed_contact?.phones[0] || '',
          email: door.revealed_contact?.emails[0] || '',
          address_line1: door.address1,
          address_line2: door.address2 || '',
          city: door.city,
          state: door.state,
          created_by: user?.id,
        })
        .select('id')
        .single();

      if (error) throw error;
      setCreateSuccess(`Contact created`);
      setTimeout(() => {
        navigate(`/contacts/${data.id}`);
      }, 800);
    } catch {
      setCreateSuccess(null);
    } finally {
      setIsCreatingContact(false);
    }
  };

  const userId = user?.id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!door) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Door not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const lastOutcome = door.last_outcome ? OUTCOME_CONFIG[door.last_outcome] : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl shrink-0">
            <Home className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {door.address1}
            </h1>
            {door.address2 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{door.address2}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {door.city}, {door.state} {door.zip}
            </p>
          </div>
          {lastOutcome && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full shrink-0 ${lastOutcome.color}`}
            >
              {lastOutcome.icon}
              {lastOutcome.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{door.visit_count}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Visits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {door.is_do_not_knock ? 'DNK' : '—'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {door.property_type ? door.property_type.charAt(0).toUpperCase() + door.property_type.slice(1) : '—'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
          </div>
        </div>
      </div>

      {door.is_do_not_knock && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm mb-5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          This address is marked Do Not Knock
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5">
        {(['visits', 'actions', 'media'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
            {tab === 'visits' && visits.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {visits.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'visits' && (
        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No visits recorded yet
            </div>
          ) : (
            visits.map((visit) => {
              const config = OUTCOME_CONFIG[visit.outcome];
              return (
                <div
                  key={visit.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(visit.occurred_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {visit.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{visit.notes}</p>
                  )}
                  {visit.tags && visit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {visit.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary-600" />
              Contact Information
            </h3>

            {door.revealed_contact ? (
              <div className="space-y-2">
                {door.revealed_contact.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{door.revealed_contact.name}</span>
                  </div>
                )}
                {door.revealed_contact.phones.map((phone) => (
                  <div key={phone} className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${phone}`} className="text-primary-600 hover:underline">{phone}</a>
                  </div>
                ))}
                {door.revealed_contact.emails.map((email) => (
                  <div key={email} className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${email}`} className="text-primary-600 hover:underline">{email}</a>
                  </div>
                ))}

                {createSuccess ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-3">
                    <CheckCircle className="w-4 h-4" />
                    {createSuccess}
                  </div>
                ) : (
                  <button
                    onClick={handleCreateContact}
                    disabled={isCreatingContact}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {isCreatingContact ? 'Creating...' : 'Add to CRM'}
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Reveal contact info for this address (costs{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {orgSettings?.contact_reveal_cost || 1} credit
                  </span>
                  ).
                </p>
                <button
                  onClick={handleRevealContact}
                  disabled={isRevealing}
                  className="flex items-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
                >
                  {isRevealing ? (
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {isRevealing ? 'Revealing...' : 'Reveal Contact'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-green-600" />
              CRM Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/contacts?prefill_address=${encodeURIComponent(door.address1 + ', ' + door.city + ', ' + door.state)}`)}
                className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-4 h-4 text-primary-600" />
                New Contact
              </button>
              <button
                onClick={() => navigate(`/opportunities/new?address=${encodeURIComponent(door.address1)}`)}
                className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-green-600" />
                New Opportunity
              </button>
              <button
                onClick={() => navigate(`/jobs/new?address=${encodeURIComponent(door.address1)}`)}
                className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-orange-600" />
                New Job
              </button>
              <button
                onClick={() => navigate(`/calendar/new?address=${encodeURIComponent(door.address1)}`)}
                className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-primary-600" />
                Schedule Appt
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              Do Not Knock
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mark this address to skip in future canvassing runs
              </p>
              <button
                onClick={async () => {
                  if (!organizationId || !doorId) return;
                  const newVal = !door.is_do_not_knock;
                  await updateDoor(organizationId, doorId, { is_do_not_knock: newVal });
                  setDoor((prev) => prev ? { ...prev, is_do_not_knock: newVal } : prev);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  door.is_do_not_knock
                    ? 'bg-red-600'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    door.is_do_not_knock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No photos yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Photos are captured during canvassing mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
