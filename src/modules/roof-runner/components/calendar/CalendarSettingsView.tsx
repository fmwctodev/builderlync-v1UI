import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, MoreVertical, Pencil, Share2, X as XIcon, Code, X } from 'lucide-react';
import { getCalendars, getCalendarGroups, deleteCalendar, Calendar, CalendarGroup } from '../../../../shared/store/services/calendarsApi';
import { format } from 'date-fns';

interface CalendarSettingsViewProps {
  onNewCalendar: () => void;
  onEditCalendar: (calendar: Calendar) => void;
}

const CalendarSettingsView: React.FC<CalendarSettingsViewProps> = ({ onNewCalendar, onEditCalendar }) => {
  const [activeTab, setActiveTab] = useState<'calendars' | 'service-menu' | 'rooms' | 'equipment'>('calendars');
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [groups, setGroups] = useState<CalendarGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedEmbedUrl, setSelectedEmbedUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const getEmbedCode = (url: string) => {
    return `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [calendarsData, groupsData] = await Promise.all([
        getCalendars(),
        getCalendarGroups()
      ]);
      setCalendars(calendarsData);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this calendar?');
    if (!confirmed) return;

    try {
      await deleteCalendar(calendarId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting calendar:', error);
      alert('Failed to delete calendar');
    }
  };

  const handleShareCalendar = async (calendar: Calendar) => {
    if (!calendar.cal_url) {
      alert('No booking URL found for this calendar');
      return;
    }

    try {
      await navigator.clipboard.writeText(calendar.cal_url);
      alert('Booking URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy booking URL:', error);
      alert('Failed to copy booking URL');
    }
  };

  const handleOpenEmbedModal = (calendar: Calendar) => {
    if (!calendar.cal_url) {
      alert('No booking URL found for this calendar');
      return;
    }

    setSelectedEmbedUrl(calendar.cal_url);
    setShowEmbedModal(true);
  };

  const handleCopyEmbedCode = async () => {
    const embedCode = getEmbedCode(selectedEmbedUrl);

    try {
      await navigator.clipboard.writeText(embedCode);
      alert('Embed code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy embed code:', error);
      alert('Failed to copy embed code');
      return;
    }

    setShowEmbedModal(false);
  };

  const filteredCalendars = calendars.filter(cal => {
    const matchesSearch = cal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cal.status === statusFilter;
    const matchesType = typeFilter === 'all' || cal.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCalendars = calendars.length;
  const ungroupedCalendars = calendars.filter(cal => !cal.group_id);

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Groups */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <button className="w-full px-4 py-3 bg-primary-50 dark:bg-primary-900/20 text-blue-700 dark:text-primary-400 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
            All Calendars ({totalCalendars})
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Groups</h3>
          </div>

          <div className="space-y-1">
            <div className="group">
              <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg cursor-pointer">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Not Grouped</span>
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">
                    {ungroupedCalendars.length}
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {groups.map(group => {
              const isExpanded = expandedGroups.has(group.id);
              return (
                <div key={group.id} className="group">
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2" onClick={() => toggleGroup(group.id)}>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{group.name}</span>
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">
                        {group.calendar_count || 0}
                      </span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="flex items-center gap-2 px-3 py-2 mt-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg w-full transition-colors">
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('calendars')}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'calendars'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Calendars
                {activeTab === 'calendars' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('service-menu')}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'service-menu'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Service Menu
                {activeTab === 'service-menu' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'rooms'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Rooms
                {activeTab === 'rooms' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('equipment')}
                className={`px-4 py-3 font-medium transition-colors relative ${
                  activeTab === 'equipment'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Equipment
                {activeTab === 'equipment' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-blue-400"></div>
                )}
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Type: All</option>
                <option value="personal">Personal</option>
                <option value="round-robin">Round Robin</option>
                <option value="event">Event</option>
              </select>

              <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Owned by: Anyone</option>
              </select>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Calendar/Group Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={onNewCalendar}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                New Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Calendar Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCalendars.map((calendar) => (
                      <tr key={calendar.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: calendar.color }}></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {calendar.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {groups.find(g => g.id === calendar.group_id)?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {calendar.duration} mins
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {calendar.type.replace('-', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            calendar.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {calendar.status.charAt(0).toUpperCase() + calendar.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(calendar.updated_at), 'MMM dd yyyy\nh:mm a')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() => onEditCalendar(calendar)}
                            >
                              <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() => handleShareCalendar(calendar)}
                            >
                              <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() => handleOpenEmbedModal(calendar)}
                            >
                              <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              onClick={() => handleDeleteCalendar(calendar.id)}
                            >
                              <XIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEmbedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Embed Code</h3>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <textarea
                  value={getEmbedCode(selectedEmbedUrl)}
                  readOnly
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <button
                onClick={handleCopyEmbedCode}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSettingsView;
