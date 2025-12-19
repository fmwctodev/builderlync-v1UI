import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  Plus,
  Folder,
  FileText,
  Search,
  Clock,
  List,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  FolderPlus,
  Code,
  Check,
  X,
  Edit2,
  ArrowLeft,
} from 'lucide-react';
import { formsApi } from '../services/formsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { CreateFormModal } from '../components/CreateFormModal';
import { EmbedCodeModal } from '../components/EmbedCodeModal';
import type { MarketingForm, FormFolder } from '../types/forms';

export const FormsBuildTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentOrganizationId: organizationId } = useCurrentOrganization();
  const [forms, setForms] = useState<MarketingForm[]>([]);
  const [folders, setFolders] = useState<FormFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'clock'>('list');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [renamingFormId, setRenamingFormId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedFormForEmbed, setSelectedFormForEmbed] = useState<MarketingForm | null>(null);
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [selectedFormForMove, setSelectedFormForMove] = useState<MarketingForm | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'folders'>('forms');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [organizationId, currentFolder, debouncedSearchQuery, activeTab]);

  useEffect(() => {
    const shouldRefresh = searchParams.get('refreshForms');
    if (shouldRefresh === 'true') {
      loadData();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('refreshForms');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
        if (renamingFormId) {
          setRenamingFormId(null);
          setRenameValue('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [renamingFormId]);

  useEffect(() => {
    if (renamingFormId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFormId]);

  const loadData = async () => {
    try {
      // setLoading(true);
      if (activeTab === 'folders') {
        const foldersData = await formsApi.getFolders(organizationId, debouncedSearchQuery);
        setFolders(foldersData);
        setForms([]);
      } else {
        const formsData = currentFolder 
          ? await formsApi.getFormsByFolder(currentFolder, organizationId)
          : await formsApi.getForms(organizationId, debouncedSearchQuery);
        setForms(formsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    setShowCreateFormModal(true);
  };

  const handleCreateFormType = (type: 'scratch' | 'template') => {
    setShowCreateFormModal(false);
    if (type === 'scratch') {
      const basePath = orgSlug ? `/org/${orgSlug}` : '';
      navigate(`${basePath}/marketing/forms/builder/new`);
    }
  };

  const handleEditForm = (formId: string) => {
    const basePath = orgSlug ? `/org/${orgSlug}` : '';
    navigate(`${basePath}/marketing/forms/builder/${formId}`);
  };

  const handleViewSubmissions = (formId: string) => {
    const basePath = orgSlug ? `/org/${orgSlug}` : '';
    navigate(`${basePath}/marketing/forms/submissions/${formId}`);
  };

  const handleDuplicateForm = async (formId: string) => {
    try {
      await formsApi.duplicateForm(formId, organizationId);
      loadData();
    } catch (error) {
      console.error('Error duplicating form:', error);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await formsApi.deleteForm(formId, organizationId);
      loadData();
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await formsApi.createFolder({ name }, organizationId);
      setShowCreateFolderModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleStartRename = (form: MarketingForm) => {
    setRenamingFormId(form.id);
    setRenameValue(form.name);
    setOpenDropdownId(null);
  };

  const handleCancelRename = () => {
    setRenamingFormId(null);
    setRenameValue('');
  };

  const handleSaveRename = async (formId: string) => {
    if (!renameValue.trim() || renameSaving) return;

    try {
      setRenameSaving(true);
      await formsApi.updateForm(formId, { name: renameValue.trim() }, organizationId);
      setRenamingFormId(null);
      setRenameValue('');
      loadData();
    } catch (error) {
      console.error('Error renaming form:', error);
    } finally {
      setRenameSaving(false);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, formId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(formId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleShowEmbedCode = (form: MarketingForm) => {
    setSelectedFormForEmbed(form);
    setShowEmbedModal(true);
    setOpenDropdownId(null);
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    if (!selectedFormForMove) return;
    try {
      await formsApi.moveFormToFolder(selectedFormForMove.id, folderId, organizationId);
      setShowMoveToFolderModal(false);
      setSelectedFormForMove(null);
      loadData();
    } catch (error) {
      console.error('Error moving form:', error);
    }
  };

  const toggleDropdown = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === formId ? null : formId);
  };

  const filteredForms = forms;
  const filteredFolders = folders;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forms</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create, manage, and organise forms effortlessly to capture lead info and engage users—all without coding
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FolderPlus size={18} />
            <span>Create folder</span>
          </button>
          <button
            onClick={handleCreateForm}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Form</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'forms'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Forms
        </button>
        <button
          onClick={() => setActiveTab('folders')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'folders'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Folders
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={`Search for ${activeTab}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {currentFolder && (
          <button
            onClick={() => setCurrentFolder(null)}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
          >
            <ArrowLeft size={16} />
            <span>Back to All Forms</span>
          </button>
        )}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'Home'}
        </span>
      </div>

      {filteredFolders.length === 0 && filteredForms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No forms yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by creating your first lead capture form
          </p>
          <button
            onClick={handleCreateForm}
            className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Your First Form</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeTab === 'folders' && filteredFolders.map((folder) => (
                <tr
                  key={folder.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      <Folder className="text-gray-400" size={20} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {folder.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(folder.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {folder.userName || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {activeTab === 'forms' && filteredForms.map((form) => (
                <tr
                  key={form.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-gray-400" size={20} />
                      {renamingFormId === form.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => handleRenameKeyDown(e, form.id)}
                            className="flex-1 px-2 py-1 text-sm border border-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={renameSaving}
                          />
                          <button
                            onClick={() => handleSaveRename(form.id)}
                            disabled={!renameValue.trim() || renameSaving}
                            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            disabled={renameSaving}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {form.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {form.userName || form.user_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block" ref={openDropdownId === form.id ? dropdownRef : null}>
                      <button
                        onClick={(e) => toggleDropdown(form.id, e)}
                        className={`p-2 rounded transition-colors ${
                          openDropdownId === form.id
                            ? 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openDropdownId === form.id && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                          <button
                            onClick={() => {
                              handleEditForm(form.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => {
                              handleDuplicateForm(form.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Copy size={16} />
                            <span>Duplicate</span>
                          </button>

                          <button
                            onClick={() => handleStartRename(form)}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit2 size={16} />
                            <span>Rename</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFormForMove(form);
                              setShowMoveToFolderModal(true);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Folder size={16} />
                            <span>Move to Folder</span>
                          </button>

                          <button
                            onClick={() => handleShowEmbedCode(form)}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Code size={16} />
                            <span>Get Embed Code</span>
                          </button>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                          <button
                            onClick={() => {
                              handleDeleteForm(form.id);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {showCreateFormModal && (
        <CreateFormModal
          onClose={() => setShowCreateFormModal(false)}
          onCreate={handleCreateFormType}
        />
      )}

      {showEmbedModal && selectedFormForEmbed && (
        <EmbedCodeModal
          form={selectedFormForEmbed}
          onClose={() => {
            setShowEmbedModal(false);
            setSelectedFormForEmbed(null);
          }}
        />
      )}

      {showMoveToFolderModal && selectedFormForMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Move "{selectedFormForMove.name}" to Folder
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleMoveToFolder(null)}
                className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                No Folder (Root)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveToFolder(folder.id)}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowMoveToFolderModal(false);
                  setSelectedFormForMove(null);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateFolderModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Create Folder
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
