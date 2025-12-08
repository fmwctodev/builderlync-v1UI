import React, { useState, useEffect } from 'react';
import { X, Search, Folder, FileText } from 'lucide-react';

interface Snippet {
  id: number;
  name: string;
  body: string;
  type: string;
  folder_id: number | null;
  subject?: string;
}

interface SnippetFolder {
  id: number;
  name: string;
}

interface SnippetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet: (body: string, subject?: string) => void;
  type?: 'text' | 'email';
}

export function SnippetSelector({ isOpen, onClose, onSelectSnippet, type = 'text' }: SnippetSelectorProps) {
  const [folders, setFolders] = useState<SnippetFolder[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      loadSnippets();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
      const response = await fetch(`${API_BASE_URL}/snippets/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setFolders(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders([]);
    }
  };

  const loadSnippets = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
      const response = await fetch(`${API_BASE_URL}/snippets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setSnippets(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Failed to load snippets:', error);
      setSnippets([]);
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesType = snippet.type === type;
    const matchesFolder = selectedFolder === 'all' || snippet.folder_id === selectedFolder;
    const matchesSearch = !searchQuery || 
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesFolder && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[800px] max-h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Snippet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Folders Sidebar */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSelectedFolder('all');
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 cursor-pointer ${
                selectedFolder === 'all' 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All Snippets</span>
            </button>
            {folders.map(folder => (
              <button
                key={folder.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedFolder(folder.id);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 cursor-pointer ${
                  selectedFolder === folder.id 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>{folder.name}</span>
              </button>
            ))}
          </div>

          {/* Snippets List */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search snippets..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredSnippets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No snippets found</div>
              ) : (
                <div className="space-y-2">
                  {filteredSnippets.map(snippet => {
                    const folderName = snippet.folder_id 
                      ? folders.find(f => f.id === snippet.folder_id)?.name 
                      : 'Uncategorized';
                    
                    return (
                      <button
                        key={snippet.id}
                        onClick={() => {
                          onSelectSnippet(snippet.body, snippet.subject);
                          onClose();
                        }}
                        className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{snippet.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              {folderName}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
                              {snippet.type}
                            </span>
                          </div>
                        </div>
                        {snippet.subject && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject: {snippet.subject}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{snippet.body}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
