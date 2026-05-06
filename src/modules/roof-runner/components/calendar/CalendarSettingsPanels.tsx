/**
 * Calendar Settings — Service Menu, Rooms, Equipment panels
 *
 * Companion panels for the three non-Calendars tabs in CalendarSettingsView.
 * Each panel shows a list of items with create/edit/delete affordances,
 * filterable by name. The underlying API endpoints in `calendarsApi` are
 * currently stubbed (`getServiceMenuItems` etc. return `[]`, `create*` /
 * `update*` / `delete*` throw "API is not implemented"), so each panel
 * gracefully degrades:
 *   - List loads as empty (correct behavior with stub API).
 *   - Create / Edit / Delete attempts surface a friendly inline notice
 *     explaining that backend support is being added — instead of a
 *     thrown unhandled error.
 *
 * When the real APIs land, the panels need no UI changes; only the
 * service-layer error handling collapses to a normal success path.
 *
 * Tracked under UXA-001 in docs/UX_AUDIT.md.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Coffee, Home, Wrench } from 'lucide-react';
import {
  getServiceMenuItems,
  createServiceMenuItem,
  updateServiceMenuItem,
  deleteServiceMenuItem,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  ServiceMenuItem,
  Room,
  Equipment,
} from '../../../../shared/store/services/calendarsApi';

// ============================================================================
// Shared bits
// ============================================================================

const NOT_IMPLEMENTED_MESSAGE =
  'This feature is being wired up. The backend endpoint for saving these settings isn’t live yet — your changes weren’t saved.';

const isNotImplementedError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return /not implemented/i.test(err.message);
  }
  return false;
};

const PanelHeader: React.FC<{
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onAddClick: () => void;
  addLabel: string;
}> = ({ title, description, searchValue, onSearchChange, onAddClick, addLabel }) => (
  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </button>
    </div>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={`Search ${title.toLowerCase()}…`}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  </div>
);

const EmptyState: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
}> = ({ icon: Icon, title, description, ctaLabel, onCta }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">{description}</p>
    <button
      onClick={onCta}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
    >
      <Plus className="w-4 h-4" />
      {ctaLabel}
    </button>
  </div>
);

const InlineNotice: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
    <span className="flex-1">{message}</span>
    <button onClick={onDismiss} className="flex-shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded p-0.5">
      <X className="w-4 h-4" />
    </button>
  </div>
);

// ============================================================================
// Service Menu Panel
// ============================================================================

interface ServiceFormState {
  name: string;
  description: string;
  duration: string; // string in form; parse before submit
  price: string;
  status: 'active' | 'inactive';
}
const emptyService: ServiceFormState = {
  name: '',
  description: '',
  duration: '60',
  price: '',
  status: 'active',
};

export const ServiceMenuPanel: React.FC = () => {
  const [items, setItems] = useState<ServiceMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServiceMenuItem | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyService);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getServiceMenuItems();
      setItems(data);
    } catch (err) {
      console.error('Error fetching service menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyService);
    setShowModal(true);
  };

  const openEdit = (item: ServiceMenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      duration: String(item.duration),
      price: item.price != null ? String(item.price) : '',
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Service name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        duration: Number(form.duration) || 60,
        price: form.price ? Number(form.price) : undefined,
        status: form.status,
      };
      if (editing) {
        await updateServiceMenuItem(editing.id, payload);
      } else {
        await createServiceMenuItem(payload);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      if (isNotImplementedError(err)) {
        setNotice(NOT_IMPLEMENTED_MESSAGE);
        setShowModal(false);
      } else {
        console.error(err);
        alert('Failed to save service. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ServiceMenuItem) => {
    if (!window.confirm(`Delete the service "${item.name}"?`)) return;
    try {
      await deleteServiceMenuItem(item.id);
      await fetchItems();
    } catch (err) {
      if (isNotImplementedError(err)) {
        setNotice(NOT_IMPLEMENTED_MESSAGE);
      } else {
        console.error(err);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PanelHeader
        title="Service Menu"
        description="Define the services you offer so they can be attached to bookable calendars."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={openCreate}
        addLabel="New Service"
      />
      {notice && <InlineNotice message={notice} onDismiss={() => setNotice(null)} />}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <EmptyState
              icon={Coffee}
              title={search ? 'No services match your search' : 'No services yet'}
              description={
                search
                  ? `Try a different search term, or clear the filter to see all services.`
                  : `Create your first service so customers can book the right type of appointment.`
              }
              ctaLabel="New Service"
              onCta={openCreate}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.duration} min</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.price != null ? `$${item.price.toFixed(2)}` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Delete">
                          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Service' : 'New Service'}</h3>
                <button onClick={() => !saving && setShowModal(false)} disabled={saving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. 30-minute consultation"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What does this service include?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (USD)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="(optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">Active — bookable</option>
                    <option value="inactive">Inactive — hidden</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setShowModal(false)} disabled={saving} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">Cancel</button>
                <button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Rooms Panel
// ============================================================================

interface RoomFormState {
  name: string;
  description: string;
  capacity: string;
  status: 'active' | 'inactive';
}
const emptyRoom: RoomFormState = {
  name: '',
  description: '',
  capacity: '',
  status: 'active',
};

export const RoomsPanel: React.FC = () => {
  const [items, setItems] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomFormState>(emptyRoom);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      setItems(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyRoom);
    setShowModal(true);
  };

  const openEdit = (item: Room) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      capacity: item.capacity != null ? String(item.capacity) : '',
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Room name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        status: form.status,
      };
      if (editing) {
        await updateRoom(editing.id, payload);
      } else {
        await createRoom(payload);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      if (isNotImplementedError(err)) {
        setNotice(NOT_IMPLEMENTED_MESSAGE);
        setShowModal(false);
      } else {
        console.error(err);
        alert('Failed to save room. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Room) => {
    if (!window.confirm(`Delete the room "${item.name}"?`)) return;
    try {
      await deleteRoom(item.id);
      await fetchItems();
    } catch (err) {
      if (isNotImplementedError(err)) {
        setNotice(NOT_IMPLEMENTED_MESSAGE);
      } else {
        console.error(err);
        alert('Failed to delete room. Please try again.');
      }
    }
  };

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PanelHeader
        title="Rooms"
        description="Track meeting rooms or physical spaces that can be booked alongside an appointment."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={openCreate}
        addLabel="New Room"
      />
      {notice && <InlineNotice message={notice} onDismiss={() => setNotice(null)} />}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <EmptyState
              icon={Home}
              title={search ? 'No rooms match your search' : 'No rooms yet'}
              description={
                search
                  ? `Try a different search term, or clear the filter to see all rooms.`
                  : `Add the meeting rooms or spaces you book — capacity, names, status — and tie them to calendars.`
              }
              ctaLabel="New Room"
              onCta={openCreate}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.capacity != null ? `${item.capacity} people` : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Delete">
                          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Room' : 'New Room'}</h3>
                <button onClick={() => !saving && setShowModal(false)} disabled={saving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Main Conference Room"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Floor, location notes, included equipment…"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                    <input
                      type="number"
                      min={0}
                      value={form.capacity}
                      onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                      placeholder="(optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setShowModal(false)} disabled={saving} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">Cancel</button>
                <button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Equipment Panel
// ============================================================================

interface EquipmentFormState {
  name: string;
  description: string;
  quantity: string;
  status: 'active' | 'inactive' | 'maintenance';
}
const emptyEquipment: EquipmentFormState = {
  name: '',
  description: '',
  quantity: '1',
  status: 'active',
};

const equipmentStatusStyles: Record<EquipmentFormState['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export const EquipmentPanel: React.FC = () => {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState<EquipmentFormState>(emptyEquipment);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getEquipment();
      setItems(data);
    } catch (err) {
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyEquipment);
    setShowModal(true);
  };

  const openEdit = (item: Equipment) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      quantity: String(item.quantity),
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('Equipment name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        quantity: Number(form.quantity) || 1,
        status: form.status,
      };
      if (editing) {
        await updateEquipment(editing.id, payload);
      } else {
        await createEquipment(payload);
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      if (isNotImplementedError(err)) {
        setNotice(NOT_IMPLEMENTED_MESSAGE);
        setShowModal(false);
      } else {
        console.error(err);
        alert('Failed to save equipment. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Equipment) => {
    if (!window.confirm(`Delete "${item.name}" from your equipment list?`)) return;
    try {
      await deleteEquipment(item.id);
      await fetchItems();
    } catch (err) {
      if (isNotImplementedError(err)) {
        setNotice(NOT_IMPLEMENTED_MESSAGE);
      } else {
        console.error(err);
        alert('Failed to delete equipment. Please try again.');
      }
    }
  };

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PanelHeader
        title="Equipment"
        description="Inventory shared equipment (drones, ladders, vehicles) so they can be reserved per appointment."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={openCreate}
        addLabel="New Equipment"
      />
      {notice && <InlineNotice message={notice} onDismiss={() => setNotice(null)} />}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <EmptyState
              icon={Wrench}
              title={search ? 'No equipment matches your search' : 'No equipment yet'}
              description={
                search
                  ? `Try a different search term, or clear the filter to see all equipment.`
                  : `Add equipment your team books — drones, vehicles, ladders — so calendars can hold them per appointment.`
              }
              ctaLabel="New Equipment"
              onCta={openCreate}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${equipmentStatusStyles[item.status]}`}>
                        {item.status === 'active' ? 'Active' : item.status === 'inactive' ? 'Inactive' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Edit">
                          <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Delete">
                          <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Equipment' : 'New Equipment'}</h3>
                <button onClick={() => !saving && setShowModal(false)} disabled={saving} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Inspection Drone Kit #1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Asset tag, location, accessories…"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EquipmentFormState['status'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="active">Active — bookable</option>
                      <option value="inactive">Inactive — hidden</option>
                      <option value="maintenance">Maintenance — temporarily unavailable</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setShowModal(false)} disabled={saving} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50">Cancel</button>
                <button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Equipment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
