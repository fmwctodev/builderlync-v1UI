import React, { useState, useRef, KeyboardEvent } from 'react';
import { ArrowUp, Paperclip, Link, Youtube, Upload, X } from 'lucide-react';
import type { SocialAIAttachment, SocialAIMessageType } from '../types';

interface ChatInputProps {
  onSend: (content: string, messageType?: SocialAIMessageType, attachments?: SocialAIAttachment[]) => Promise<void>;
  sending: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, sending, disabled }) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<SocialAIAttachment[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlType, setUrlType] = useState<'url' | 'youtube'>('url');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending || disabled) return;
    const type: SocialAIMessageType = attachments.some((a) => a.type === 'youtube')
      ? 'youtube_transcript'
      : attachments.some((a) => a.type === 'url')
      ? 'url_scrape'
      : 'text';
    setValue('');
    setAttachments([]);
    await onSend(trimmed, type, attachments);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const addUrlAttachment = () => {
    if (!urlInput.trim()) return;
    const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
    setAttachments((prev) => [
      ...prev,
      {
        type: isYoutube ? 'youtube' : urlType,
        url: urlInput.trim(),
        title: isYoutube ? 'YouTube video' : urlInput.trim(),
      },
    ]);
    setUrlInput('');
    setShowUrlInput(false);
    setShowAttachMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 border border-slate-600 rounded-full text-xs text-slate-300"
            >
              {att.type === 'youtube' ? <Youtube size={12} className="text-red-400" /> : <Link size={12} className="text-cyan-400" />}
              <span className="max-w-[160px] truncate">{att.title ?? att.url}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="text-slate-500 hover:text-slate-300 ml-0.5"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUrlInput && (
        <div className="mb-3 flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addUrlAttachment()}
            placeholder={urlType === 'youtube' ? 'Paste YouTube URL...' : 'Paste URL to analyze...'}
            className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            autoFocus
          />
          <button
            onClick={addUrlAttachment}
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm rounded-lg"
          >
            Add
          </button>
          <button
            onClick={() => setShowUrlInput(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu((v) => !v)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
            title="Attach"
          >
            <Paperclip size={18} />
          </button>

          {showAttachMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-slate-700 border border-slate-600 rounded-xl shadow-xl overflow-hidden min-w-[180px] z-10">
              <button
                onClick={() => { setUrlType('url'); setShowUrlInput(true); setShowAttachMenu(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                <Link size={14} className="text-cyan-400" />
                Paste URL
              </button>
              <button
                onClick={() => { setUrlType('youtube'); setShowUrlInput(true); setShowAttachMenu(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                <Youtube size={14} className="text-red-400" />
                YouTube
              </button>
              <button
                onClick={() => setShowAttachMenu(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                <Upload size={14} className="text-slate-400" />
                Upload File
              </button>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); handleTextareaInput(); }}
          onKeyDown={handleKeyDown}
          placeholder="Ask Sierra to create social content, suggest ideas, or repurpose your content..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
          style={{ maxHeight: '200px' }}
        />

        <button
          onClick={handleSend}
          disabled={!value.trim() || sending || disabled}
          className="p-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
          title="Send (Enter)"
        >
          {sending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>

      <p className="text-xs text-slate-600 mt-2 ml-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;
