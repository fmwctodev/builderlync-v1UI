import React, { useEffect, useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { templateApi, Template } from '../../services/templateApi';

interface TemplatesGridProps {
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
}

export default function TemplatesGrid({ openDropdown, setOpenDropdown }: TemplatesGridProps) {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingTemplate, setRenamingTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!renamingTemplate || !newTemplateName.trim()) return;
    try {
      await templateApi.updateTemplate(renamingTemplate.id, { name: newTemplateName });
      await loadTemplates();
      setShowRenameModal(false);
      setRenamingTemplate(null);
      setNewTemplateName('');
    } catch (error) {
      console.error('Error renaming template:', error);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const duplicated = await templateApi.duplicateTemplate(template.id, { name: `${template.name} (Copy)` });
      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplateId) return;
    try {
      await templateApi.deleteTemplate(deletingTemplateId);
      await loadTemplates();
      setShowDeleteModal(false);
      setDeletingTemplateId(null);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={async () => {
            try {
              const newTemplate = await templateApi.createTemplate({ name: 'New Template' });
              navigate(`${orgPrefix}/proposals/template/${newTemplate.id}`, { state: { from: 'templates' } });
            } catch (error) {
              console.error('Error creating template:', error);
            }
          }}
          className="bg-white dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-colors"
        >
          <Plus size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Template</span>
        </div>

        {templates.map((template) => (
          <div 
            key={template.id} 
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`${orgPrefix}/proposals/template/${template.id}`, { state: { from: 'templates' } })}
          >
            <div className="h-48 bg-gray-200 dark:bg-gray-600 overflow-hidden">
              {template.content?.settings?.coverImage ? (
                <img 
                  src={template.content.settings.coverImage} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">No Cover Image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-end">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{template.name}</h3>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === template.id ? null : template.id);
                    }}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                  {openDropdown === template.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingTemplate(template);
                            setNewTemplateName(template.name);
                            setShowRenameModal(true);
                            setOpenDropdown(null);
                          }}
                          disabled={template.is_locked}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(template);
                            setOpenDropdown(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          Make a copy
                        </button>
                        {!template.is_global && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTemplateId(template.id);
                              setShowDeleteModal(true);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-error-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rename Modal */}
      {showRenameModal && renamingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rename Template</h3>
              <button 
                onClick={() => {
                  setShowRenameModal(false);
                  setRenamingTemplate(null);
                  setNewTemplateName('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter template name"
                autoFocus
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setRenamingTemplate(null);
                  setNewTemplateName('');
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!newTemplateName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Template</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTemplateId(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
