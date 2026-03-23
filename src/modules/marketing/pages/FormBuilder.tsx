import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Settings,
  Eye,
  X,
  Trash2,
  GripVertical,
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formsApi } from '../services/formsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { FormBuilderSidebar } from '../components/FormBuilderSidebar';
import { FieldRenderer } from '../components/FieldRenderer';
import { getFieldTypeConfig } from '../constants/formFieldTypes';
import type { FormField, FormFieldType } from '../types/forms';

export const FormBuilderEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganizationId: organizationId, currentOrganizationSlug: orgSlug } = useCurrentOrganization();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
    const config = getFieldTypeConfig(type);
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: config?.label || `New ${type} field`,
      placeholder: '',
      validation: { required: false },
      category: config?.category,
      positionOrder: fields.length,
    };

    if (type === 'select' || type === 'single_dropdown' || type === 'multi_dropdown' || type === 'radio' || type === 'checkbox') {
      newField.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ];
    }

    if (type === 'star_rating') {
      newField.fieldSpecificProps = { maxStars: 5 };
    }

    if (type === 'button') {
      newField.fieldSpecificProps = { buttonText: 'Submit' };
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      const fieldType = active.data.current?.fieldType as FormFieldType;
      if (fieldType) {
        handleAddField(fieldType);
      }
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === -1) return items;

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleSave = async (publish: boolean = false) => {
    if (!formName.trim()) {
      alert('Please enter a form name');
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

      navigate(`/org/${orgSlug}/marketing?tab=forms-funnels&refreshForms=true`);
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/org/${orgSlug}/marketing`)}
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
          <FormBuilderSidebar onAddField={handleAddField} />

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 min-h-[600px]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {formName}
              </h2>
              {formDescription && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">{formDescription}</p>
              )}

              {fields.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    Drag fields from the left sidebar or click to add them to your form
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        isSelected={selectedField === field.id}
                        onSelect={() => setSelectedField(field.id)}
                        onRemove={() => handleRemoveField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>

          {selectedField && selectedFieldData && (
            <FieldSettingsPanel
              field={selectedFieldData}
              onUpdate={(updates) => handleUpdateField(selectedField, updates)}
              onClose={() => setSelectedField(null)}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-2 border-red-500">
            <p className="text-sm font-medium">Adding field...</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableFieldItemProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-move">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          <label className="font-medium text-gray-900 dark:text-white">
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {field.helpText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 ml-6">{field.helpText}</p>
      )}
      <div className="ml-6">
        <FieldRenderer field={field} />
      </div>
    </div>
  );
};

interface FieldSettingsPanelProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}

const FieldSettingsPanel: React.FC<FieldSettingsPanelProps> = ({ field, onUpdate, onClose }) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Field Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Help Text
          </label>
          <textarea
            value={field.helpText || ''}
            onChange={(e) => onUpdate({ helpText: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.validation?.required || false}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    required: e.target.checked,
                  },
                })
              }
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Required field</span>
          </label>
        </div>

        {(field.type === 'select' ||
          field.type === 'single_dropdown' ||
          field.type === 'multi_dropdown' ||
          field.type === 'radio' ||
          field.type === 'checkbox') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Options
            </label>
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])];
                      newOptions[idx] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                      onUpdate({ options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options?.filter((_, i) => i !== idx);
                      onUpdate({ options: newOptions });
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
                    ...(field.options || []),
                    {
                      label: `Option ${(field.options?.length || 0) + 1}`,
                      value: `option${(field.options?.length || 0) + 1}`,
                    },
                  ];
                  onUpdate({ options: newOptions });
                }}
                className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {field.type === 'star_rating' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Stars
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={field.fieldSpecificProps?.maxStars || 5}
              onChange={(e) =>
                onUpdate({
                  fieldSpecificProps: {
                    ...field.fieldSpecificProps,
                    maxStars: parseInt(e.target.value) || 5,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}

        {field.type === 'button' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={field.fieldSpecificProps?.buttonText || 'Submit'}
              onChange={(e) =>
                onUpdate({
                  fieldSpecificProps: {
                    ...field.fieldSpecificProps,
                    buttonText: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const FormBuilder = FormBuilderEnhanced;
