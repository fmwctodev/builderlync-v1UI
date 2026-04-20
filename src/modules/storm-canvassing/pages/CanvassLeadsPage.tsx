import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  Plus,
} from 'lucide-react';

import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getLeads, updateLead, getLeadStats, createAppointment } from '../services/canvassLeadsApi';
import type { CanvassLead, CanvassLeadStatus } from '../types';

const STATUS_COLUMNS: Array<{ status: CanvassLeadStatus; label: string; color: string }> = [
  { status: 'NEW', label: 'New', color: 'bg-gray-500' },
  { status: 'CONTACTED', label: 'Contacted', color: 'bg-primary-500' },
  { status: 'SCHEDULED', label: 'Scheduled', color: 'bg-primary-600' },
  { status: 'WON', label: 'Won', color: 'bg-green-500' },
  { status: 'LOST', label: 'Lost', color: 'bg-red-500' },
];

export function CanvassLeadsPage() {
  const { currentOrganization } = useCurrentOrganization();
  const organizationId = currentOrganization?.id;

  const [leads, setLeads] = useState<CanvassLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<CanvassLeadStatus, number>;
    totalValue: number;
    appointmentsScheduled: number;
  } | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [leadsData, statsData] = await Promise.all([
          getLeads(organizationId!),
          getLeadStats(organizationId!),
        ]);
        setLeads(leadsData.leads);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading leads:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [organizationId]);

  const handleStatusChange = async (leadId: string, newStatus: CanvassLeadStatus) => {
    if (!organizationId) return;

    try {
      await updateLead(organizationId, leadId, { status: newStatus });
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      );
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.address?.toLowerCase().includes(query)
    );
  });

  const leadsByStatus = STATUS_COLUMNS.reduce(
    (acc, { status }) => {
      acc[status] = filteredLeads.filter((lead) => lead.status === status);
      return acc;
    },
    {} as Record<CanvassLeadStatus, CanvassLead[]>
  );

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Canvass Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Leads generated from door-to-door canvassing
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pipeline Value</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.appointmentsScheduled}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.byStatus?.WON || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Won Deals</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STATUS_COLUMNS.map(({ status, label, color }) => (
              <div
                key={status}
                className="w-72 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      {leadsByStatus[status]?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
                  {leadsByStatus[status]?.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={(newStatus) => handleStatusChange(lead.id, newStatus)}
                    />
                  ))}

                  {(!leadsByStatus[status] || leadsByStatus[status].length === 0) && (
                    <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-500">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {lead.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline block">
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-gray-500 dark:text-gray-400 hover:underline block">
                          {lead.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {lead.address || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as CanvassLeadStatus)}
                      className="text-sm bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {STATUS_COLUMNS.map(({ status, label }) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface LeadCardProps {
  lead: CanvassLead;
  onStatusChange: (status: CanvassLeadStatus) => void;
}

function LeadCard({ lead, onStatusChange }: LeadCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow">
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
        {lead.name || 'Unknown Contact'}
      </h4>

      <div className="space-y-1 text-sm">
        {lead.phone && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        {lead.address && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{lead.address}</span>
          </div>
        )}
      </div>

      {lead.estimated_value && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            ${lead.estimated_value.toLocaleString()}
          </span>
        </div>
      )}

      {lead.appointments && lead.appointments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(lead.appointments[0].start_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
