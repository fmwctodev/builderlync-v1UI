import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Link as LinkIcon,
  Smile,
  Quote,
  Code,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { getSignature, updateSignature } from '../../../../shared/store/services/profileApi';
import './SignatureEditor.css';

const getAccessToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

interface SignatureSectionProps {
  onUpdate?: () => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ onUpdate }) => {
  const [enableSignature, setEnableSignature] = useState(true);
  const [includeInReplies, setIncludeInReplies] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSignature();
  }, []);

  const loadSignature = async () => {
    try {
      setLoading(true);
      const response = await getSignature();
      if (response.success && response.data) {
        setEnableSignature(response.data.enable_signature);
        setIncludeInReplies(response.data.include_in_replies);
        if (editorRef.current && response.data.html_content) {
          editorRef.current.innerHTML = response.data.html_content;
        }
      }
    } catch (err) {
      console.error('Error loading signature:', err);
    } finally {
      setLoading(false);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      try {
        setSaving(true);
        setError(null);

        const formData = new FormData();
        formData.append('profile', file);

        const token = getAccessToken();
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const result = await response.json();
        const imageUrl = result.data.profile;

        execCommand('insertImage', imageUrl);

        // Add styling to the inserted image
        setTimeout(() => {
          if (editorRef.current) {
            const images = editorRef.current.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
              if (images[i].src === imageUrl) {
                images[i].style.maxWidth = '100%';
                images[i].style.height = 'auto';
                images[i].style.display = 'inline-block';
                images[i].style.cursor = 'pointer';
              }
            }
          }
        }, 100);

      } catch (error) {
        console.error('Image upload error:', error);
        setError('Failed to upload image');
      } finally {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const currentWidth = target.style.width || target.getAttribute('width') || '100%';
        const newWidth = window.prompt('Enter image width (e.g., 200px, 50%, or 100%):', currentWidth);
        if (newWidth !== null) {
          (target as HTMLImageElement).style.width = newWidth;
          (target as HTMLImageElement).style.maxWidth = '100%'; // Ensure it doesn't overflow
        }
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('click', handleEditorClick);
      return () => editor.removeEventListener('click', handleEditorClick);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      const response = await updateSignature({
        htmlContent: editorRef.current?.innerHTML || '',
        enableSignature: enableSignature,
        includeInReplies: includeInReplies,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onUpdate?.();
      } else {
        setError(response.message || 'Failed to save signature');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save signature');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Signature saved successfully!</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Signature</h3>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enableSignature}
              onChange={(e) => setEnableSignature(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Enable signature on all outgoing messages
            </span>
          </label>
        </div>

        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden signature-editor">
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2">
            <div className="flex flex-wrap gap-2">
              <select
                onChange={(e) => execCommand('fontName', e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Font Family</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
              </select>

              <select
                onChange={(e) => execCommand('fontSize', e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="">FontSize</option>
                <option value="1">Small</option>
                <option value="3">Normal</option>
                <option value="5">Large</option>
                <option value="7">Huge</option>
              </select>

              <select
                onChange={(e) => execCommand('formatBlock', e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
              </select>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => execCommand('strikeThrough')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                type="button"
                onClick={() => execCommand('justifyLeft')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => execCommand('justifyCenter')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignCenter className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => execCommand('justifyRight')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => execCommand('justifyFull')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                type="button"
                onClick={() => execCommand('undo')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => execCommand('redo')}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Redo className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button type="button"
                onClick={() => {
                  const url = window.prompt('Enter URL:');
                  if (url) {
                    execCommand('createLink', url);
                  }
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <LinkIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Insert image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button type="button" onClick={() => execCommand('formatBlock', 'blockquote')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Quote className="w-4 h-4" />
              </button>

              <button type="button" onClick={() => execCommand('formatBlock', 'pre')} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            onInput={() => { }} // Handle change if needed
            className="prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 bg-white dark:bg-gray-800"
            style={{ overflowY: 'auto' }}
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeInReplies}
              onChange={(e) => setIncludeInReplies(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Include this signature before quoted text in replies
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Update Profile</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SignatureSection;
