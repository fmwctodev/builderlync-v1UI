import { X, MapPin, Phone, Mail, Calendar, ClipboardList, User, CreditCard, ChevronRight, AlertTriangle, CloudRain } from 'lucide-react';
import type { Door, CanvassVisit, ContactReveal, CanvassOutcome } from '../../types';
import { getHailSeverityBand, HAIL_SEVERITY_COLORS } from '../../types';
import type { ParsedHailAlert, HailForecastPoint } from '../../services/nwsApiService';

export interface DoorInfoDrawerProps {
  door: Door | null;
  visits?: CanvassVisit[];
  revealedContact?: ContactReveal | null;
  creditBalance?: number;
  revealCost?: number;
  onClose: () => void;
  onLogVisit: (door: Door) => void;
  onViewDetails: (door: Door) => void;
  onRevealContact: (door: Door) => void;
  onCreateLead: (door: Door) => void;
  isRevealing?: boolean;
  activeAlerts?: ParsedHailAlert[];
  hailForecast?: HailForecastPoint[];
}

function getOutcomeBadge(outcome: CanvassOutcome) {
  const styles: Record<CanvassOutcome, { bg: string; text: string }> = {
    NO_ANSWER: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    NOT_HOME: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    INTERESTED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    NOT_INTERESTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    FOLLOW_UP: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    CALLBACK_REQUESTED: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    APPOINTMENT_SET: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-700 dark:text-primary-400' },
    DO_NOT_KNOCK: { bg: 'bg-gray-800 dark:bg-gray-900', text: 'text-white' },
  };

  const style = styles[outcome];
  const label = outcome.replace(/_/g, ' ');

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}

export function DoorInfoDrawer({
  door,
  visits = [],
  revealedContact,
  creditBalance = 0,
  revealCost = 1,
  onClose,
  onLogVisit,
  onViewDetails,
  onRevealContact,
  onCreateLead,
  isRevealing,
  activeAlerts = [],
  hailForecast = [],
}: DoorInfoDrawerProps) {
  if (!door) return null;

  const canReveal = !revealedContact && creditBalance >= revealCost;

  const nearbyAlerts = activeAlerts.filter(
    (a) => a.isHailRelated || a.isThunderstormRelated || a.isTornadoRelated
  );

  const upcomingHail = hailForecast.filter(
    (f) => f.hailWeather.length > 0 || f.hazardPhenomena.some((h) => h.toLowerCase().includes('hail'))
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:absolute md:inset-auto md:right-4 md:bottom-4 md:w-96">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{door.address1}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {door.city}, {door.state} {door.zip}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
              {door.last_outcome ? (
                getOutcomeBadge(door.last_outcome)
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  Not Visited
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {door.visit_count} visit{door.visit_count !== 1 ? 's' : ''}
            </span>
          </div>

          {door.is_do_not_knock && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Do Not Knock
              </p>
            </div>
          )}

          {nearbyAlerts.length > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  Active Storm Alerts
                </h4>
              </div>
              {nearbyAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="flex items-start gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: alert.severity === 'Extreme' ? '#dc2626' : alert.severity === 'Severe' ? '#f97316' : '#f59e0b' }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {alert.event}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {alert.severity}
                      {alert.maxHailInches ? ` - ${alert.maxHailInches}" hail` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingHail.length > 0 && nearbyAlerts.length === 0 && (
            <div className="p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CloudRain className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <h4 className="text-sm font-medium text-primary-700 dark:text-primary-400">
                  Hail Forecast
                </h4>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {upcomingHail[0].hailWeather[0]?.description || 'Hail risk in upcoming forecast'}
              </p>
            </div>
          )}

          {revealedContact ? (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Information
              </h4>
              {revealedContact.name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{revealedContact.name}</span>
                </div>
              )}
              {revealedContact.phones.map((phone, i) => (
                <a
                  key={i}
                  href={`tel:${phone}`}
                  className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
              ))}
              {revealedContact.emails.map((email, i) => (
                <a
                  key={i}
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {email}
                </a>
              ))}
            </div>
          ) : (
            <button
              onClick={() => onRevealContact(door)}
              disabled={!canReveal || isRevealing}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                canReveal
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={`w-5 h-5 ${canReveal ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${canReveal ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500'}`}>
                    {isRevealing ? 'Revealing...' : 'Reveal Contact Info'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {revealCost} credit{revealCost !== 1 ? 's' : ''} (Balance: {creditBalance})
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          )}

          {visits.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recent Visits
              </h4>
              {visits.slice(0, 3).map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(visit.occurred_at).toLocaleDateString()}
                    </span>
                  </div>
                  {getOutcomeBadge(visit.outcome)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onLogVisit(door)}
              disabled={door.is_do_not_knock}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardList className="w-4 h-4" />
              Log Visit
            </button>
            <button
              onClick={() => onCreateLead(door)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <User className="w-4 h-4" />
              Create Lead
            </button>
          </div>
          <button
            onClick={() => onViewDetails(door)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View Full Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
