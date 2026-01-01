import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  Link,
  Smile,
  Plus,
  Quote,
  Code,
  Superscript,
  Subscript,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { getSignature, updateSignature } from '../../../../shared/store/services/profileApi';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

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
        if (editor && response.data.html_content) {
          editor.commands.setContent(response.data.html_content);
        }
      }
    } catch (err) {
      console.error('Error loading signature:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        editor.chain().focus().insertContent(`<img src="${url}" alt="signature" style="max-width: 200px; height: auto;" />`).run();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      const response = await updateSignature({
        htmlContent: editor?.getHTML() || '',
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

  if (loading || !editor) {
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

        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2">
            <div className="flex flex-wrap gap-2">
              <select 
                onChange={(e) => {
                  const value = e.target.value;
                  editor.chain().focus().setFontFamily(value).run();
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier">Courier</option>
              </select>

              <select 
                onChange={(e) => {
                  const value = e.target.value;
                  editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="14px">14px</option>
                <option value="12px">12px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
              </select>

              <select 
                onChange={(e) => {
                  const value = e.target.value;
                  editor.chain().focus().setMark('textStyle', { lineHeight: value }).run();
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="1.5">1.5</option>
                <option value="1.0">1.0</option>
                <option value="2.0">2.0</option>
              </select>

              <select 
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                  else if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                  else editor.chain().focus().setParagraph().run();
                }}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
              </select>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              >
                <Strikethrough className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignCenter className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Redo className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Link className="w-4 h-4" />
              </button>

              <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Smile className="w-4 h-4" />
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

              <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Quote className="w-4 h-4" />
              </button>

              <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>

          <EditorContent editor={editor} className="bg-white dark:bg-gray-800" />
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
