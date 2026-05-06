import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, ChevronDown, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { getAppointments, Appointment } from '../../../../shared/store/services/calendarsApi';
import { format } from 'date-fns';

interface AppointmentListViewProps {
  onNewAppointment: () => void;
}

// Column definitions for Manage Columns (UXA-005)
type ColumnKey = '#' | 'title' | 'contact' | 'status' | 'time' | 'calendar' | 'owner';
const ALL_COLUMNS: { key: ColumnKey; label: string; required?: boolean }[] = [
  { key: '#', label: '#', required: true },
  { key: 'title', label: 'Title', required: true },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
  { key: 'time', label: 'Appointment Time' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'owner', label: 'Appointment Owner' },
];
const VISIBLE_COLUMNS_KEY = 'builderlync.calendar.appointmentColumns';
const loadVisibleColumns = (): ColumnKey[] => {
  if (typeof window === 'undefined') return ALL_COLUMNS.map((c) => c.key);
  try {
    const raw = window.localStorage.getItem(VISIBLE_COLUMNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ColumnKey[];
      // Ensure required columns are always included
      const set = new Set(parsed);
      ALL_COLUMNS.filter((c) => c.required).forEach((c) => set.add(c.key));
      return ALL_COLUMNS.filter((c) => set.has(c.key)).map((c) => c.key);
    }
  } catch {
    // ignore parse errors
  }
  return ALL_COLUMNS.map((c) => c.key);
};

// Sort options for Sort by dropdown (UXA-004)
type SortKey = 'time-newest' | 'time-oldest' | 'title-az' | 'title-za' | 'status';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'time-newest', label: 'Newest first' },
  { key: 'time-oldest', label: 'Oldest first' },
  { key: 'title-az', label: 'Title (A → Z)' },
  { key: 'title-za', label: 'Title (Z → A)' },
  { key: 'status', label: 'Status' },
];

// Advanced filter form (UXA-003)
interface AdvancedFilters {
  startDate: string;
  endDate: string;
  status: 'all' | 'upcoming' | 'cancelled' | 'completed';
}
const emptyAdvancedFilters: AdvancedFilters = {
  startDate: '',
  endDate: '',
  status: 'all',
};

const AppointmentListView: React.FC<AppointmentListViewProps> = ({ onNewAppointment }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'cancelled' | 'all'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced filters (UXA-003)
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const [filterDraft, setFilterDraft] = useState<AdvancedFilters>(emptyAdvancedFilters);
  const advancedFilterCount =
    (advancedFilters.startDate ? 1 : 0) +
    (advancedFilters.endDate ? 1 : 0) +
    (advancedFilters.status !== 'all' ? 1 : 0);

  // Sort by (UXA-004)
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('time-newest');

  // Manage Columns (UXA-005)
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(() => loadVisibleColumns());
  const visibleColumnSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VISIBLE_COLUMNS_KEY, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }
      const data = await getAppointments(filters);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = appointments.filter((apt) => apt.title.toLowerCase().includes(q));

    // Advanced filters (UXA-003)
    if (advancedFilters.startDate) {
      const start = new Date(advancedFilters.startDate).getTime();
      result = result.filter((a) => new Date(a.appointment_time).getTime() >= start);
    }
    if (advancedFilters.endDate) {
      const end = new Date(advancedFilters.endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // end-of-day
      result = result.filter((a) => new Date(a.appointment_time).getTime() <= end);
    }
    if (advancedFilters.status !== 'all') {
      result = result.filter((a) => a.status === advancedFilters.status);
    }

    // Sort (UXA-004)
    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'time-newest':
          return new Date(b.appointment_time).getTime() - new Date(a.appointment_time).getTime();
        case 'time-oldest':
          return new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime();
        case 'title-az':
          return a.title.localeCompare(b.title);
        case 'title-za':
          return b.title.localeCompare(a.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return sorted;
  }, [appointments, searchQuery, advancedFilters, sortKey]);

  const openFiltersModal = () => {
    setFilterDraft(advancedFilters);
    setShowFiltersModal(true);
  };
  const applyFilters = () => {
    setAdvancedFilters(filterDraft);
    setShowFiltersModal(false);
  };
  const clearFilters = () => {
    setAdvancedFilters(emptyAdvancedFilters);
    setFilterDraft(emptyAdvancedFilters);
    setShowFiltersModal(false);
  };

  const toggleColumn = (key: ColumnKey) => {
    const col = ALL_COLUMNS.find((c) => c.key === key);
    if (col?.required) return; // can't toggle required columns
    setVisibleColumns((prev) => {
      const set = new Set(prev);
      if (set.has(key)) {
        set.delete(key);
      } else {
        set.add(key);
      }
      return ALL_COLUMNS.filter((c) => set.has(c.key)).map((c) => c.key);
    });
  };

  // Close sort menu when clicking outside
  useEffect(() => {
    if (!showSortMenu) return;
    const handler = () => setShowSortMenu(false);
    // Defer attachment so the click that opened it doesn't immediately close it.
    const t = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handler);
    };
  }, [showSortMenu]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'upcoming'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Upcoming
            {activeTab === 'upcoming' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'cancelled'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Cancelled
            {activeTab === 'cancelled' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'all'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            All
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={openFiltersModal}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Advanced Filters</span>
              {advancedFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded text-xs font-medium">
                  {advancedFilterCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortMenu((s) => !s);
                }}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sort: {SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Newest first'}
                </span>
              </button>
              {showSortMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSortKey(opt.key);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${sortKey === opt.key ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      <span>{opt.label}</span>
                      {sortKey === opt.key && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={() => setShowColumnsModal(true)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium border border-gray-300 dark:border-gray-600"
          >
            Manage Columns
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-gray-300 dark:text-gray-600">
                  <rect x="20" y="30" width="80" height="70" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="20" y1="45" x2="100" y2="45" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="35" cy="37" r="2" fill="currentColor"/>
                  <circle cx="45" cy="37" r="2" fill="currentColor"/>
                  <circle cx="55" cy="37" r="2" fill="currentColor"/>
                  <rect x="30" y="55" width="60" height="8" rx="2" fill="currentColor" opacity="0.3"/>
                  <rect x="30" y="70" width="40" height="8" rx="2" fill="currentColor" opacity="0.3"/>
                  <rect x="30" y="85" width="50" height="8" rx="2" fill="currentColor" opacity="0.3"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No {activeTab === 'all' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Appointments!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have any {activeTab === 'all' ? '' : activeTab} appointments right now.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
              >
                See All Appointments
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {visibleColumnSet.has('#') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        #
                      </th>
                    )}
                    {visibleColumnSet.has('title') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                    )}
                    {visibleColumnSet.has('contact') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                    )}
                    {visibleColumnSet.has('status') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    {visibleColumnSet.has('time') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Appointment Time
                      </th>
                    )}
                    {visibleColumnSet.has('calendar') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Calendar
                      </th>
                    )}
                    {visibleColumnSet.has('owner') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Appointment Owner
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAppointments.map((appointment, index) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      {visibleColumnSet.has('#') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                      )}
                      {visibleColumnSet.has('title') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {appointment.title}
                        </td>
                      )}
                      {visibleColumnSet.has('contact') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {appointment.contacts
                            ? appointment.contacts.full_name
                              || `${appointment.contacts.first_name || ''} ${appointment.contacts.last_name || ''}`.trim()
                              || appointment.contacts.email
                              || '-'
                            : '-'
                          }
                        </td>
                      )}
                      {visibleColumnSet.has('status') && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'upcoming'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                      )}
                      {visibleColumnSet.has('time') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(appointment.appointment_time), 'MMM dd, yyyy h:mm a')}
                        </td>
                      )}
                      {visibleColumnSet.has('calendar') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {appointment.calendars?.name || '-'}
                        </td>
                      )}
                      {visibleColumnSet.has('owner') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {appointment.staff
                            ? `${appointment.staff.first_name} ${appointment.staff.last_name}`.trim()
                            : '-'
                          }
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <button
          onClick={() => setShowColumnsModal(true)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          Customize List
        </button>
      </div>

      {/* Advanced Filters modal — UXA-003 */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                <button onClick={() => setShowFiltersModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start date</label>
                    <input
                      type="date"
                      value={filterDraft.startDate}
                      onChange={(e) => setFilterDraft((f) => ({ ...f, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End date</label>
                    <input
                      type="date"
                      value={filterDraft.endDate}
                      onChange={(e) => setFilterDraft((f) => ({ ...f, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filterDraft.status}
                    onChange={(e) => setFilterDraft((f) => ({ ...f, status: e.target.value as AdvancedFilters['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Any status</option>
                    <option value="upcoming">Upcoming only</option>
                    <option value="cancelled">Cancelled only</option>
                    <option value="completed">Completed only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button onClick={clearFilters} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  Clear all
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowFiltersModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    Cancel
                  </button>
                  <button onClick={applyFilters} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Columns modal — UXA-005 */}
      {showColumnsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Columns</h3>
                <button onClick={() => setShowColumnsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Toggle which columns appear in the appointments table. Your selection is saved on this device.
              </p>
              <div className="space-y-2 mb-6">
                {ALL_COLUMNS.map((col) => {
                  const checked = visibleColumnSet.has(col.key);
                  return (
                    <label
                      key={col.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${col.required ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-default' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'}`}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{col.label}</div>
                        {col.required && <div className="text-xs text-gray-500 dark:text-gray-400">Always visible</div>}
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={col.required}
                        onChange={() => toggleColumn(col.key)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setVisibleColumns(ALL_COLUMNS.map((c) => c.key))}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Reset to default
                </button>
                <button onClick={() => setShowColumnsModal(false)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentListView;
