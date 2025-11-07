import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  image: string;
}

interface TemplatesGridProps {
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  onCreateTemplate: () => void;
}

export default function TemplatesGrid({ openDropdown, setOpenDropdown, onCreateTemplate }: TemplatesGridProps) {
  const templates: Template[] = [
    { id: '1', title: 'Standard Roof Proposal', image: '/api/placeholder/300/200' },
    { id: '2', title: 'Commercial Roofing Template', image: '/api/placeholder/300/200' },
    { id: '3', title: 'Residential Repair Template', image: '/api/placeholder/300/200' }
  ];

  const templateActions = ['Rename', 'Make a copy', 'Delete'];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={onCreateTemplate}
          className="bg-white dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors"
        >
          <Plus size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Template</span>
        </div>

        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-200 dark:bg-gray-600"></div>
            <div className="p-4">
              <div className="flex justify-between items-end">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{template.title}</h3>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                  {openDropdown === template.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        {templateActions.map((action) => (
                          <button
                            key={action}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              action === 'Delete' ? 'text-error-600' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}