import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

interface SignatureSectionProps {
  onUpdate?: () => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({ onUpdate }) => {
  const [enableSignature, setEnableSignature] = useState(true);
  const [includeInReplies, setIncludeInReplies] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <div style="display: flex; gap: 16px;">
        <img src="https://via.placeholder.com/150" alt="Profile" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;" />
        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">SEAN RICHARD</h2>
          <p style="margin: 4px 0; color: #666;">Founder & Engineer</p>
          <p style="margin: 4px 0;">📞 <a href="tel:+16893102712">1689-310-2712</a></p>
          <p style="margin: 4px 0;">✉️ <a href="mailto:sean@autom8ionlab.com">sean@autom8ionlab.com</a></p>
          <p style="margin: 4px 0;">🌐 US | CA | UK</p>
          <p style="margin: 4px 0;">🌍 <a href="https://autom8ionlab.com">autom8ionlab.com</a></p>
        </div>
      </div>
    `,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      // Save signature to database
      const signatureData = {
        html_content: editor?.getHTML(),
        enable_signature: enableSignature,
        include_in_replies: includeInReplies,
      };

      // TODO: Implement API call to save signature
      console.log('Saving signature:', signatureData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onUpdate?.();
    } catch (err) {
      setError('Failed to save signature');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!editor) {
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
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white">
                <option>Inter</option>
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Courier</option>
              </select>

              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white">
                <option>14px</option>
                <option>12px</option>
                <option>16px</option>
                <option>18px</option>
              </select>

              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white">
                <option>1.5</option>
                <option>1.0</option>
                <option>2.0</option>
              </select>

              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white">
                <option>Paragraph</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
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

              <button type="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Plus className="w-4 h-4" />
              </button>

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
