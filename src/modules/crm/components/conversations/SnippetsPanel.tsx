import React, { useState, useEffect } from 'react';
import { Plus, Folder, Mail, MessageSquare, Search, Trash2, MoreVertical, ArrowLeft } from 'lucide-react';
import { snippetsApi, Snippet, SnippetFolder } from '../../../../shared/services/snippetsApi';
import { CreateSnippetModal } from './CreateSnippetModal';
import { CreateFolderModal } from './CreateFolderModal';

interface SnippetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet: (snippet: Snippet) => void;
}

export function SnippetsPanel({ isOpen, onClose, onSelectSnippet }: SnippetsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'folders'>('all');
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<SnippetFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateSnippet, setShowCreateSnippet] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [snippetsData, foldersData] = await Promise.all([
        snippetsApi.getSnippets(),
        snippetsApi.getFolders()
      ]);
      setSnippets(snippetsData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnippet = async (snippet: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await snippetsApi.createSnippet(snippet);
      setShowCreateSnippet(false);
      loadData();
    } catch (error) {
      console.error('Failed to create snippet:', error);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await snippetsApi.createFolder(name);
      setShowCreateFolder(false);
      loadData();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteSnippet = async (id: number) => {
    if (!confirm('Delete this snippet?')) return;
    try {
      await snippetsApi.deleteSnippet(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete snippet:', error);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!confirm('Delete this folder? Snippets will not be deleted.')) return;
    try {
      await snippetsApi.deleteFolder(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolderId === null || s.folder_id === selectedFolderId;
    return matchesSearch && matchesFolder;
  });

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Snippets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create snippets to quickly insert predefined content into messages
            </p>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedFolderId(null);
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All Snippets
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'folders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Folders
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Folder className="w-4 h-4" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => setShowCreateSnippet(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Snippet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {selectedFolderId && (
          <button
            onClick={() => setSelectedFolderId(null)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to all snippets</span>
          </button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : activeTab === 'all' ? (
          <div className="space-y-2">
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No snippets found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSnippets.map((snippet) => (
                    <tr
                      key={snippet.id}
                      onClick={() => {
                        onSelectSnippet(snippet);
                        onClose();
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {snippet.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {snippet.type === 'email' && snippet.subject && (
                          <span className="text-xs text-gray-500">📧 {snippet.subject}: </span>
                        )}
                        {snippet.body}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {snippet.folder?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          snippet.type === 'email'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {snippet.type === 'email' ? <Mail className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                          {snippet.type === 'email' ? 'Email' : 'Text'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(snippet.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSnippet(snippet.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFolders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No folders found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Snippets</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFolders.map((folder) => (
                    <tr 
                      key={folder.id} 
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        setActiveTab('all');
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <Folder className="w-4 h-4 text-blue-500" />
                          <span>{folder.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {folder.snippets?.[0]?.count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(folder.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showCreateSnippet && (
        <CreateSnippetModal
          folders={folders}
          onClose={() => setShowCreateSnippet(false)}
          onCreate={handleCreateSnippet}
        />
      )}

      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}
    </div>
  );
}
