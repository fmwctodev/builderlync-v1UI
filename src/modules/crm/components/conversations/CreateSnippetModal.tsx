import React, { useState } from 'react';
import { X, Smile, Paperclip, Tag } from 'lucide-react';
import { Snippet, SnippetFolder } from '../../../../shared/services/snippetsApi';
import { TagDropdown } from '../../../../shared/components/TagDropdown';
import { EmojiPicker } from '../../../../shared/components/EmojiPicker';

interface CreateSnippetModalProps {
  folders: SnippetFolder[];
  onClose: () => void;
  onCreate: (snippet: Omit<Snippet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}

export function CreateSnippetModal({ folders, onClose, onCreate }: CreateSnippetModalProps) {
  const [type, setType] = useState<'text' | 'email'>('text');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [folderId, setFolderId] = useState<number | undefined>();
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      type,
      subject: type === 'email' ? subject : undefined,
      body,
      folder_id: folderId
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create {type === 'text' ? 'Text' : 'Email'} Snippet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and reuse {type} snippets for quick access via shortcuts
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${type === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Text Snippet
              </button>
              <button
                type="button"
                onClick={() => setType('email')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg ${type === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Email Snippet
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                // placeholder={type === 'text' ? 'Test' : 'Test'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Subject (Email only) */}
            {type === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  // placeholder="Testing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Snippets Body *
              </label>
              <div className="border border-gray-300 rounded-lg">
                <div className="flex items-center space-x-2 p-2 border-b border-gray-300">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="Insert emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onSelect={(emoji) => {
                          setBody(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        onClose={() => setShowEmojiPicker(false)}
                        position="bottom"
                      />
                    )}
                  </div>
                  <div className="relative">
                    <button type="button" className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" onClick={(e) => { e.preventDefault(); setShowTagDropdown(!showTagDropdown); }}>
                      <Tag className="w-4 h-4" />
                    </button>
                    {showTagDropdown && (
                      <TagDropdown
                        onSelect={(val) => {
                          setBody(prev => prev + val);
                          setShowTagDropdown(false);
                        }}
                        onClose={() => setShowTagDropdown(false)}
                        position="bottom"
                      />
                    )}
                  </div>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  // placeholder={type === 'text' ? 'Testing' : 'Testing email'}
                  rows={6}
                  className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-b-lg"
                  required
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {body.length} characters | {body.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            {/* Folder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder (Optional)
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
