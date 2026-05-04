import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  X,
  Save,
  Eye,
  Settings,
  ArrowLeft,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { formsApi } from '../services/formsApi';
import { useOrgContext } from '../../../shared/context/OrgContext';
import type { FormField, FormFieldType, MarketingForm } from '../types/forms';

const FIELD_TYPES: Array<{ type: FormFieldType; label: string; icon: string }> = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'email', label: 'Email', icon: '✉️' },
  { type: 'phone', label: 'Phone', icon: '📞' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'radio', label: 'Radio Button', icon: '🔘' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'number', label: 'Number', icon: '🔢' },
];

export const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { organizationId } = useOrgContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadForm();
    }
  }, [id, organizationId]);

  const loadForm = async () => {
    if (!id || id === 'new') return;

    try {
      setLoading(true);
      const form = await formsApi.getFormById(id, organizationId);
      if (form) {
        setFormName(form.name);
        setFormDescription(form.description || '');
        setFields(form.fields);
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      validation: { required: false },
    };

    if (type === 'select' || type === 'radio' || type === 'checkbox') {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
    }

    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  const handleSave = async (publish: boolean = false) => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    if (fields.length === 0) {
      alert('Please add at least one field to the form');
      return;
    }

    try {
      setSaving(true);

      const formData = {
        name: formName,
        description: formDescription,
        fields,
        status: publish ? ('published' as const) : ('draft' as const),
      };

      if (id && id !== 'new') {
        await formsApi.updateForm(id, formData, organizationId);
      } else {
        await formsApi.createForm(formData, organizationId);
      }

      navigate('/marketing/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedFieldData = fields.find((f) => f.id === selectedField);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/marketing/forms')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Form Name"
                className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Form description (optional)"
                className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-gray-600 dark:text-gray-400 placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Add Fields
          </h3>
          <div className="space-y-2">
            {FIELD_TYPES.map((fieldType) => (
              <button
                key={fieldType.type}
                onClick={() => handleAddField(fieldType.type)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">{fieldType.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {fieldType.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {formName || 'Untitled Form'}
            </h2>
            {formDescription && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">{formDescription}</p>
            )}

            {fields.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Add fields from the left sidebar to start building your form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field.id)}
                    className={`group p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedField === field.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <GripVertical size={16} className="text-gray-400" />
                        <label className="font-medium text-gray-900 dark:text-white">
                          {field.label}
                          {field.validation?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveField(field.id);
                        }}
                        className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {field.helpText && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {field.helpText}
                      </p>
                    )}
                    <FieldPreview field={field} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedField && selectedFieldData && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Field Settings
              </h3>
              <button
                onClick={() => setSelectedField(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedFieldData.label}
                  onChange={(e) =>
                    handleUpdateField(selectedField, { label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={selectedFieldData.placeholder || ''}
                  onChange={(e) =>
                    handleUpdateField(selectedField, { placeholder: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Help Text
                </label>
                <textarea
                  value={selectedFieldData.helpText || ''}
                  onChange={(e) =>
                    handleUpdateField(selectedField, { helpText: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFieldData.validation?.required || false}
                    onChange={(e) =>
                      handleUpdateField(selectedField, {
                        validation: {
                          ...selectedFieldData.validation,
                          required: e.target.checked,
                        },
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Required field
                  </span>
                </label>
              </div>

              {(selectedFieldData.type === 'select' ||
                selectedFieldData.type === 'radio' ||
                selectedFieldData.type === 'checkbox') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {selectedFieldData.options?.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...(selectedFieldData.options || [])];
                            newOptions[idx] = { ...option, label: e.target.value };
                            handleUpdateField(selectedField, { options: newOptions });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                        <button
                          onClick={() => {
                            const newOptions = selectedFieldData.options?.filter(
                              (_, i) => i !== idx
                            );
                            handleUpdateField(selectedField, { options: newOptions });
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [
                          ...(selectedFieldData.options || []),
                          {
                            label: `Option ${(selectedFieldData.options?.length || 0) + 1}`,
                            value: `option${(selectedFieldData.options?.length || 0) + 1}`,
                          },
                        ];
                        handleUpdateField(selectedField, { options: newOptions });
                      }}
                      className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FieldPreview: React.FC<{ field: FormField }> = ({ field }) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <input
          type={field.type}
          placeholder={field.placeholder}
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
        />
      );

    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          disabled
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
        />
      );

    case 'select':
      return (
        <select
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
        >
          <option>Select an option</option>
          {field.options?.map((opt) => (
            <option key={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2">
              <input type="checkbox" disabled className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2">
              <input type="radio" name={field.id} disabled className="rounded-full" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
        />
      );

    default:
      return null;
  }
};
