import React, { useState, useEffect } from 'react';
import { Flag, Plus, RefreshCw, Settings2, LayoutTemplate } from 'lucide-react';
import { supabase } from '../services/supabase-client';
import { FeatureFlag, DefaultTemplate, TemplateType } from '../types/features';
import {
  getStatusColor,
  getRolloutStrategyLabel,
  getRolloutStrategyColor,
  getTemplateTypeColor,
  formatTemplateConfig,
  validateTemplateJSON,
  slugifyKey,
} from '../utils/feature-utils';
import { clsx } from 'clsx';

type Tab = 'features' | 'templates';

export const Features: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('features');
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [templates, setTemplates] = useState<DefaultTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FeatureFlag | DefaultTemplate | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'features') {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setFeatures(data || []);
      } else {
        const { data, error } = await supabase
          .from('default_templates')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeatures = features.filter((f) => {
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase()) && !f.key.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && f.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const filteredTemplates = templates.filter((t) => {
    if (searchQuery && !t.label.toLowerCase().includes(searchQuery.toLowerCase()) && !t.key.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && t.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleToggleFeatureStatus = async (feature: FeatureFlag) => {
    const newStatus = feature.status === 'on' ? 'off' : 'on';
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ status: newStatus })
        .eq('id', feature.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  };

  const handleToggleTemplateActive = async (template: DefaultTemplate) => {
    try {
      const { error } = await supabase
        .from('default_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Failed to toggle template:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Features & Flags</h1>
            <p className="text-gray-600 mt-1">Control feature rollout and default templates</p>
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
          <button
            onClick={() => {
              setEditingItem(null);
              setEditorOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'features' ? 'New Feature' : 'New Template'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('features')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'features'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <Settings2 className="w-4 h-4" />
              Feature Flags
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                {features.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
                activeTab === 'templates'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              <LayoutTemplate className="w-4 h-4" />
              Default Templates
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                {templates.length}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'features' ? 'features' : 'templates'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {activeTab === 'features' ? (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="on">On</option>
                <option value="beta">Beta</option>
                <option value="off">Off</option>
              </select>
            ) : (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="pipeline">Pipeline</option>
                <option value="automation">Automation</option>
                <option value="dashboard">Dashboard</option>
              </select>
            )}
          </div>

          {activeTab === 'features' ? (
            <FeaturesTable
              features={filteredFeatures}
              loading={loading}
              onToggle={handleToggleFeatureStatus}
              onEdit={(f) => {
                setEditingItem(f);
                setEditorOpen(true);
              }}
            />
          ) : (
            <TemplatesGrid
              templates={filteredTemplates}
              loading={loading}
              onToggle={handleToggleTemplateActive}
              onEdit={(t) => {
                setEditingItem(t);
                setEditorOpen(true);
              }}
            />
          )}
        </div>
      </div>

      {editorOpen && (
        <EditorDrawer
          item={editingItem}
          type={activeTab}
          onClose={() => {
            setEditorOpen(false);
            setEditingItem(null);
          }}
          onSaved={() => {
            setEditorOpen(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

interface FeaturesTableProps {
  features: FeatureFlag[];
  loading: boolean;
  onToggle: (feature: FeatureFlag) => void;
  onEdit: (feature: FeatureFlag) => void;
}

const FeaturesTable: React.FC<FeaturesTableProps> = ({ features, loading, onToggle, onEdit }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Flag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No features found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rollout</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {features.map((feature) => (
            <tr key={feature.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="text-sm text-gray-500 font-mono">{feature.key}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getStatusColor(feature.status)
                  )}
                >
                  {feature.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getRolloutStrategyColor(feature.rollout_type)
                    )}
                  >
                    {getRolloutStrategyLabel(feature.rollout_type)}
                  </span>
                  {feature.rollout_type === 'percentage' && feature.rollout_config?.percentage && (
                    <span className="text-sm text-gray-600">{feature.rollout_config.percentage}%</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(feature)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onToggle(feature)}
                    className={clsx(
                      'px-3 py-1 text-sm rounded',
                      feature.status === 'on'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    )}
                  >
                    {feature.status === 'on' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface TemplatesGridProps {
  templates: DefaultTemplate[];
  loading: boolean;
  onToggle: (template: DefaultTemplate) => void;
  onEdit: (template: DefaultTemplate) => void;
}

const TemplatesGrid: React.FC<TemplatesGridProps> = ({ templates, loading, onToggle, onEdit }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <LayoutTemplate className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No templates found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                getTemplateTypeColor(template.type)
              )}
            >
              {template.type}
            </span>
            <span
              className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              )}
            >
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">{template.label}</h3>
          <p className="text-sm text-gray-500 font-mono mb-2">{template.key}</p>
          {template.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(template)}
              className="flex-1 px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
            >
              Edit
            </button>
            <button
              onClick={() => onToggle(template)}
              className={clsx(
                'flex-1 px-3 py-1.5 text-sm border rounded',
                template.is_active
                  ? 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  : 'text-green-600 border-green-600 hover:bg-green-50'
              )}
            >
              {template.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

interface EditorDrawerProps {
  item: FeatureFlag | DefaultTemplate | null;
  type: Tab;
  onClose: () => void;
  onSaved: () => void;
}

const EditorDrawer: React.FC<EditorDrawerProps> = ({ item, type, onClose, onSaved }) => {
  const isFeature = type === 'features';
  const isEditing = !!item;

  const [formData, setFormData] = useState<any>(
    item ||
      (isFeature
        ? { key: '', name: '', description: '', status: 'off', rollout_type: 'all', rollout_config: {} }
        : { key: '', type: 'pipeline', label: '', description: '', config: '{}', is_active: true })
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (isFeature) {
        const data: any = {
          key: formData.key,
          name: formData.name,
          description: formData.description || null,
          status: formData.status,
          rollout_type: formData.rollout_type,
          rollout_config: formData.rollout_config || {},
        };

        if (isEditing) {
          const { error: updateError } = await supabase
            .from('feature_flags')
            .update(data)
            .eq('id', (item as FeatureFlag).id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from('feature_flags').insert(data);
          if (insertError) throw insertError;
        }
      } else {
        const validation = validateTemplateJSON(formData.config);
        if (!validation.valid) {
          setError(`Invalid JSON: ${validation.error}`);
          setSaving(false);
          return;
        }

        const data: any = {
          key: formData.key,
          type: formData.type,
          label: formData.label,
          description: formData.description || null,
          config: validation.parsed,
          is_active: formData.is_active,
        };

        if (isEditing) {
          const { error: updateError } = await supabase
            .from('default_templates')
            .update(data)
            .eq('id', (item as DefaultTemplate).id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase.from('default_templates').insert(data);
          if (insertError) throw insertError;
        }
      }

      onSaved();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit' : 'Create'} {isFeature ? 'Feature Flag' : 'Template'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key {!isEditing && <span className="text-gray-500">(auto-generated)</span>}
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm disabled:bg-gray-100"
              placeholder={isFeature ? 'feature_key' : 'template_key'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isFeature ? 'Name' : 'Label'}
            </label>
            <input
              type="text"
              value={isFeature ? formData.name : formData.label}
              onChange={(e) => {
                const value = e.target.value;
                if (isFeature) {
                  setFormData({ ...formData, name: value, key: isEditing ? formData.key : slugifyKey(value) });
                } else {
                  setFormData({ ...formData, label: value, key: isEditing ? formData.key : slugifyKey(value) });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={isFeature ? 'Feature Name' : 'Template Label'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          {isFeature ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                  {(['off', 'beta', 'on'] as const).map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        value={status}
                        checked={formData.status === status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mr-2"
                      />
                      <span className="capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rollout Strategy</label>
                <select
                  value={formData.rollout_type}
                  onChange={(e) => setFormData({ ...formData, rollout_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  <option value="beta">Beta Accounts</option>
                  <option value="percentage">Percentage Rollout</option>
                  <option value="accounts">Specific Accounts</option>
                </select>
              </div>

              {formData.rollout_type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rollout_config?.percentage || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rollout_config: { ...formData.rollout_config, percentage: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                >
                  <option value="pipeline">Pipeline</option>
                  <option value="automation">Automation</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Configuration (JSON)</label>
                <textarea
                  value={typeof formData.config === 'string' ? formData.config : formatTemplateConfig(formData.config)}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={10}
                  placeholder='{"key": "value"}'
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
