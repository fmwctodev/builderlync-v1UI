import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { FormFieldCategory, FormFieldType } from '../types/forms';
import { CATEGORY_LABELS, getFieldTypesByCategory, FieldTypeConfig } from '../constants/formFieldTypes';

interface FormBuilderSidebarProps {
  onAddField: (type: FormFieldType) => void;
}

export const FormBuilderSidebar: React.FC<FormBuilderSidebarProps> = ({ onAddField }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<FormFieldCategory>>(
    new Set(['personal_info', 'submit', 'text', 'choice'])
  );

  const toggleCategory = (category: FormFieldCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories: FormFieldCategory[] = [
    'personal_info',
    'submit',
    'address',
    'organization',
    'text',
    'choice',
    'rating',
    'customized',
    'other',
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Form Element
        </h3>

        <div className="space-y-1">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category);
            const fields = getFieldTypesByCategory(category);

            return (
              <div key={category} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {CATEGORY_LABELS[category]}
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="pl-2 pb-2 space-y-1">
                    {fields.map((field) => (
                      <DraggableFieldItem
                        key={field.type}
                        field={field}
                        onAddField={onAddField}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface DraggableFieldItemProps {
  field: FieldTypeConfig;
  onAddField: (type: FormFieldType) => void;
}

const DraggableFieldItem: React.FC<DraggableFieldItemProps> = ({ field, onAddField }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-type-${field.type}`,
    data: { fieldType: field.type },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center space-x-3 px-3 py-2 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-move group"
    >
      <GripVertical size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500" />
      <Icon size={16} className="text-gray-500 dark:text-gray-400" />
      <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
    </div>
  );
};
