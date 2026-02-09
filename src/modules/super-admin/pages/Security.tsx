import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Download, CheckCheck, ScrollText, ShieldCheck, AlertOctagon, Settings2, Search, Copy } from 'lucide-react';
import { supabase } from '../services/supabase-client';
import {
  AuditLogEntry,
  SecurityEvent,
  SecuritySettings as SecuritySettingsType,
  UserSecurityProfile,
  AuditLogFilters,
  SecurityEventFilters,
  MfaFilters,
} from '../types/security';
import {
  getActorTypeColor,
  getActorTypeIcon,
  getSeverityColor,
  getSeverityIcon,
  formatTimestamp,
  formatIPAddress,
  getMfaStatusColor,
  getMfaStatusIcon,
  getRiskLevel,
  getRiskColor,
  formatResourceAction,
  validateIPAddress,
  getDaysSincePasswordChange,
} from '../utils/security-utils';
import { clsx } from 'clsx';

type Tab = 'audit' | 'access' | 'events' | 'policies';

export const Security: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('audit');
  const [loading, setLoading] = useState(true);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserSecurityProfile[]>([]);
  const [settings, setSettings] = useState<SecuritySettingsType | null>(null);

  const [auditFilters, setAuditFilters] = useState<AuditLogFilters>({});
  const [eventFilters, setEventFilters] = useState<SecurityEventFilters>({});
  const [mfaFilters, setMfaFilters] = useState<MfaFilters>({});

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'audit') {
        const { data, error } = await supabase
          .from('audit_log')
          .select(`
            *,
            enterprise_accounts:account_id (id, name, status)
          `)
          .order('timestamp', { ascending: false })
          .limit(100);
        if (error) throw error;
        setAuditLogs(data || []);
      } else if (activeTab === 'access') {
        const { data, error } = await supabase
          .from('user_security_profile')
          .select('*')
          .order('failed_login_count', { ascending: false });
        if (error) throw error;
        setUserProfiles(data || []);
      } else if (activeTab === 'events') {
        const { data, error } = await supabase
          .from('security_events')
          .select(`
            *,
            enterprise_accounts:account_id (id, name, status)
          `)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setSecurityEvents(data || []);
      } else if (activeTab === 'policies') {
        const { data, error } = await supabase
          .from('security_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          acknowledged: true,
          acknowledged_by: 'super_admin@example.com',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Failed to acknowledge event:', error);
    }
  };

  const handleAcknowledgeAll = async () => {
    if (!confirm('Mark all unacknowledged security events as acknowledged?')) return;

    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          acknowledged: true,
          acknowledged_by: 'super_admin@example.com',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('acknowledged', false);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Failed to acknowledge all:', error);
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditFilters.search) {
      const search = auditFilters.search.toLowerCase();
      if (
        !log.actor_email?.toLowerCase().includes(search) &&
        !log.description?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (auditFilters.actorType && auditFilters.actorType !== 'all' && log.actor_type !== auditFilters.actorType) {
      return false;
    }
    if (auditFilters.resourceType && log.resource_type !== auditFilters.resourceType) {
      return false;
    }
    return true;
  });

  const filteredEvents = securityEvents.filter((event) => {
    if (eventFilters.severity && eventFilters.severity !== 'all' && event.severity !== eventFilters.severity) {
      return false;
    }
    if (eventFilters.status === 'acknowledged' && !event.acknowledged) return false;
    if (eventFilters.status === 'unacknowledged' && event.acknowledged) return false;
    return true;
  });

  const filteredProfiles = userProfiles.filter((profile) => {
    if (mfaFilters.search) {
      const search = mfaFilters.search.toLowerCase();
      if (!profile.user_id.toLowerCase().includes(search)) return false;
    }
    if (mfaFilters.mfaStatus === 'enabled' && !profile.mfa_enabled) return false;
    if (mfaFilters.mfaStatus === 'disabled' && profile.mfa_enabled) return false;
    if (mfaFilters.riskLevel === 'high' && getRiskLevel(profile) !== 'high') return false;
    if (mfaFilters.riskLevel === 'stale' && getDaysSincePasswordChange(profile.last_password_change_at) <= 180) return false;
    return true;
  });

  const mfaStats = {
    total: userProfiles.length,
    mfaEnabled: userProfiles.filter((p) => p.mfa_enabled).length,
    highRisk: userProfiles.filter((p) => getRiskLevel(p) === 'high').length,
    stalePassword: userProfiles.filter((p) => getDaysSincePasswordChange(p.last_password_change_at) > 180).length,
  };

  const eventStats = {
    total: securityEvents.length,
    unacknowledged: securityEvents.filter((e) => !e.acknowledged).length,
    critical: securityEvents.filter((e) => e.severity === 'critical').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security & Audit</h1>
            <p className="text-gray-600 mt-1">Track activity, enforce MFA, and review security posture</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {activeTab === 'audit' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          )}
          {activeTab === 'events' && eventStats.unacknowledged > 0 && (
            <button
              onClick={handleAcknowledgeAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Acknowledged
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <TabButton
              active={activeTab === 'audit'}
              onClick={() => setActiveTab('audit')}
              icon={ScrollText}
              label="Audit Log"
              count={auditLogs.length}
            />
            <TabButton
              active={activeTab === 'access'}
              onClick={() => setActiveTab('access')}
              icon={ShieldCheck}
              label="Access & MFA"
              count={mfaStats.total - mfaStats.mfaEnabled}
            />
            <TabButton
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
              icon={AlertOctagon}
              label="Security Events"
              count={eventStats.unacknowledged}
            />
            <TabButton
              active={activeTab === 'policies'}
              onClick={() => setActiveTab('policies')}
              icon={Settings2}
              label="Policies"
            />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'audit' && (
            <AuditLogTab
              logs={filteredAuditLogs}
              loading={loading}
              filters={auditFilters}
              onFilterChange={setAuditFilters}
              onViewDetail={(log) => {
                setSelectedAuditLog(log);
                setDetailDrawerOpen(true);
              }}
            />
          )}

          {activeTab === 'access' && (
            <AccessMfaTab
              profiles={filteredProfiles}
              loading={loading}
              stats={mfaStats}
              filters={mfaFilters}
              onFilterChange={setMfaFilters}
            />
          )}

          {activeTab === 'events' && (
            <SecurityEventsTab
              events={filteredEvents}
              loading={loading}
              stats={eventStats}
              filters={eventFilters}
              onFilterChange={setEventFilters}
              onViewDetail={(event) => {
                setSelectedEvent(event);
                setDetailDrawerOpen(true);
              }}
              onAcknowledge={handleAcknowledgeEvent}
            />
          )}

          {activeTab === 'policies' && (
            <PoliciesTab
              settings={settings}
              loading={loading}
              onSave={async (newSettings) => {
                try {
                  const { error } = await supabase
                    .from('security_settings')
                    .upsert(newSettings);
                  if (error) throw error;
                  loadData();
                } catch (error) {
                  console.error('Failed to save settings:', error);
                }
              }}
            />
          )}
        </div>
      </div>

      {detailDrawerOpen && selectedAuditLog && (
        <AuditLogDetailDrawer
          log={selectedAuditLog}
          onClose={() => {
            setDetailDrawerOpen(false);
            setSelectedAuditLog(null);
          }}
        />
      )}

      {detailDrawerOpen && selectedEvent && (
        <SecurityEventDetailDrawer
          event={selectedEvent}
          onClose={() => {
            setDetailDrawerOpen(false);
            setSelectedEvent(null);
          }}
          onAcknowledge={(id) => {
            handleAcknowledgeEvent(id);
            setDetailDrawerOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<any>;
  label: string;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
      active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count !== undefined && (
      <span className={clsx('px-2 py-0.5 text-xs rounded-full', active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}>
        {count}
      </span>
    )}
  </button>
);

interface AuditLogTabProps {
  logs: AuditLogEntry[];
  loading: boolean;
  filters: AuditLogFilters;
  onFilterChange: (filters: AuditLogFilters) => void;
  onViewDetail: (log: AuditLogEntry) => void;
}

const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs, loading, filters, onFilterChange, onViewDetail }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email, description..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filters.actorType || 'all'}
          onChange={(e) => onFilterChange({ ...filters, actorType: e.target.value as any })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Actors</option>
          <option value="super_admin">Super Admin</option>
          <option value="account_admin">Account Admin</option>
          <option value="user">User</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => {
              const ActorIcon = getActorTypeIcon(log.actor_type);
              return (
                <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewDetail(log)}>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTimestamp(log.timestamp)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ActorIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.actor_email || 'System'}</div>
                        <span className={clsx('inline-block px-2 py-0.5 text-xs rounded mt-1', getActorTypeColor(log.actor_type))}>
                          {log.actor_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(log.enterprise_accounts as any)?.name || 'Global'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatResourceAction(log.resource_type, log.action)}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {formatIPAddress(log.ip_address)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-600 hover:text-red-700 text-sm">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface AccessMfaTabProps {
  profiles: UserSecurityProfile[];
  loading: boolean;
  stats: { total: number; mfaEnabled: number; highRisk: number; stalePassword: number };
  filters: MfaFilters;
  onFilterChange: (filters: MfaFilters) => void;
}

const AccessMfaTab: React.FC<AccessMfaTabProps> = ({ profiles, loading, stats, filters, onFilterChange }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const mfaPercent = stats.total > 0 ? Math.round((stats.mfaEnabled / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">MFA Enabled</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{mfaPercent}%</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">High Risk</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.highRisk}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Stale Password</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.stalePassword}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filters.mfaStatus || 'all'}
          onChange={(e) => onFilterChange({ ...filters, mfaStatus: e.target.value as any })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All MFA Status</option>
          <option value="enabled">MFA Enabled</option>
          <option value="disabled">MFA Disabled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MFA Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed Logins</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles.map((profile) => {
              const MfaIcon = getMfaStatusIcon(profile.mfa_enabled);
              const risk = getRiskLevel(profile);

              return (
                <tr key={profile.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{profile.user_id.substring(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', getMfaStatusColor(profile.mfa_enabled))}>
                      <MfaIcon className="w-3 h-3" />
                      {profile.mfa_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTimestamp(profile.last_login_at)}</td>
                  <td className="px-6 py-4">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', profile.failed_login_count >= 5 ? 'bg-red-100 text-red-800' : profile.failed_login_count >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800')}>
                      {profile.failed_login_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium uppercase', getRiskColor(risk))}>
                      {risk}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface SecurityEventsTabProps {
  events: SecurityEvent[];
  loading: boolean;
  stats: { total: number; unacknowledged: number; critical: number };
  filters: SecurityEventFilters;
  onFilterChange: (filters: SecurityEventFilters) => void;
  onViewDetail: (event: SecurityEvent) => void;
  onAcknowledge: (id: string) => void;
}

const SecurityEventsTab: React.FC<SecurityEventsTabProps> = ({ events, loading, stats, filters, onFilterChange, onViewDetail, onAcknowledge }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Events</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Unacknowledged</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.unacknowledged}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Critical</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={filters.severity || 'all'}
          onChange={(e) => onFilterChange({ ...filters, severity: e.target.value as any })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filters.status || 'all'}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as any })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="unacknowledged">Unacknowledged Only</option>
          <option value="acknowledged">Acknowledged</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => {
              const SeverityIcon = getSeverityIcon(event.severity);
              return (
                <tr
                  key={event.id}
                  className={clsx('hover:bg-gray-50 cursor-pointer', (event.severity === 'high' || event.severity === 'critical') && 'border-l-4 border-red-500')}
                  onClick={() => onViewDetail(event)}
                >
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTimestamp(event.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', getSeverityColor(event.severity))}>
                      <SeverityIcon className="w-3 h-3" />
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{event.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{event.source_ip}</div>
                    <div className="text-xs text-gray-500">{event.location || 'Unknown'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', event.acknowledged ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {event.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!event.acknowledged && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge(event.id);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm mr-3"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button className="text-red-600 hover:text-red-700 text-sm">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface PoliciesTabProps {
  settings: SecuritySettingsType | null;
  loading: boolean;
  onSave: (settings: Partial<SecuritySettingsType>) => void;
}

const PoliciesTab: React.FC<PoliciesTabProps> = ({ settings, loading, onSave }) => {
  const [formData, setFormData] = useState<Partial<SecuritySettingsType>>(settings || {});
  const [ipInput, setIpInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const addIP = () => {
    if (!ipInput.trim()) return;
    if (!validateIPAddress(ipInput.trim())) {
      alert('Invalid IP address or CIDR format');
      return;
    }
    setFormData({
      ...formData,
      superadmin_ip_allowlist: [...(formData.superadmin_ip_allowlist || []), ipInput.trim()],
    });
    setIpInput('');
  };

  const removeIP = (ip: string) => {
    setFormData({
      ...formData,
      superadmin_ip_allowlist: (formData.superadmin_ip_allowlist || []).filter((i) => i !== ip),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication & MFA</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Enforce MFA</div>
              <div className="text-sm text-gray-600">Require multi-factor authentication for selected roles</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enforce_mfa || false}
                onChange={(e) => setFormData({ ...formData, enforce_mfa: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={formData.session_timeout_minutes || 60}
              onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="5"
              max="480"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IP & Access Control</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Restrict Super Admin by IP</div>
              <div className="text-sm text-gray-600">Only allow super admin access from specific IPs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.restrict_superadmin_ip || false}
                onChange={(e) => setFormData({ ...formData, restrict_superadmin_ip: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {formData.restrict_superadmin_ip && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IP Allowlist</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="192.168.1.1 or 10.0.0.0/8"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addIP}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {(formData.superadmin_ip_allowlist || []).map((ip) => (
                  <div key={ip} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <code className="text-sm">{ip}</code>
                    <button
                      onClick={() => removeIP(ip)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export Controls</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Allow Data Export</div>
              <div className="text-sm text-gray-600">Allow users to export data as CSV/PDF</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_data_export !== false}
                onChange={(e) => setFormData({ ...formData, allow_data_export: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Require Reason for Export</div>
              <div className="text-sm text-gray-600">Users must provide reason before exporting</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_reason_for_export || false}
                onChange={(e) => setFormData({ ...formData, require_reason_for_export: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setFormData(settings || {})}
          disabled={saving}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

interface AuditLogDetailDrawerProps {
  log: AuditLogEntry;
  onClose: () => void;
}

const AuditLogDetailDrawer: React.FC<AuditLogDetailDrawerProps> = ({ log, onClose }) => {
  const copyMetadata = () => {
    navigator.clipboard.writeText(JSON.stringify(log.metadata, null, 2));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Audit Log Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-600">Timestamp</div>
            <div className="text-lg font-medium text-gray-900">{new Date(log.timestamp).toLocaleString()}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Actor</div>
            <div className="text-lg font-medium text-gray-900">{log.actor_email || 'System'}</div>
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded mt-1', getActorTypeColor(log.actor_type))}>
              {log.actor_type.replace('_', ' ')}
            </span>
          </div>

          <div>
            <div className="text-sm text-gray-600">Resource & Action</div>
            <div className="text-lg font-medium text-gray-900">
              {formatResourceAction(log.resource_type, log.action)}
            </div>
          </div>

          {log.description && (
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="text-gray-900">{log.description}</div>
            </div>
          )}

          <div>
            <div className="text-sm text-gray-600">IP Address</div>
            <div className="font-mono text-gray-900">{log.ip_address || 'N/A'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
              <span>Metadata</span>
              <button
                onClick={copyMetadata}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy JSON
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface SecurityEventDetailDrawerProps {
  event: SecurityEvent;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

const SecurityEventDetailDrawer: React.FC<SecurityEventDetailDrawerProps> = ({ event, onClose, onAcknowledge }) => {
  const SeverityIcon = getSeverityIcon(event.severity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={clsx('inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border', getSeverityColor(event.severity))}>
              <SeverityIcon className="w-4 h-4" />
              {event.severity}
            </span>
            <h2 className="text-xl font-semibold text-gray-900">{event.type.replace('_', ' ')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-600">Time</div>
            <div className="text-lg font-medium text-gray-900">{new Date(event.created_at).toLocaleString()}</div>
          </div>

          {event.description && (
            <div>
              <div className="text-sm text-gray-600">Description</div>
              <div className="text-gray-900">{event.description}</div>
            </div>
          )}

          <div>
            <div className="text-sm text-gray-600">Source IP</div>
            <div className="font-mono text-gray-900">{event.source_ip || 'N/A'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Location</div>
            <div className="text-gray-900">{event.location || 'Unknown'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Status</div>
            <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', event.acknowledged ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
              {event.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
            </span>
            {event.acknowledged && (
              <div className="mt-2 text-sm text-gray-600">
                Acknowledged by {event.acknowledged_by} on {new Date(event.acknowledged_at!).toLocaleString()}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Metadata</div>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
            Close
          </button>
          {!event.acknowledged && (
            <button
              onClick={() => onAcknowledge(event.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Acknowledge & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
