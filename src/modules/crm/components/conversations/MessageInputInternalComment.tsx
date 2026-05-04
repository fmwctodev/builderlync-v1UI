import React, { useState } from 'react';
import { Send, Smile, Tag } from 'lucide-react';
import { TagDropdown } from '../../../../shared/components/TagDropdown';
import { EmojiPicker } from '../../../../shared/components/EmojiPicker';

interface MessageInputInternalCommentProps {
  onSend: (message: string, metadata: any) => void;
}

export function MessageInputInternalComment({ onSend }: MessageInputInternalCommentProps) {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message, {
        mentions,
      });
      setMessage('');
      setMentions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Detect @ mentions (simplified - in production, implement proper mention dropdown)
  const handleMessageChange = (value: string) => {
    setMessage(value);

    // Extract mentions (users starting with @)
    const mentionPattern = /@(\w+)/g;
    const foundMentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(value)) !== null) {
      foundMentions.push(match[1]);
    }

    setMentions(foundMentions);
  };

  return (
    <div className="flex flex-col space-y-3 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
      {/* Info Banner */}
      <div className="flex items-start space-x-2 text-sm text-yellow-800 dark:text-yellow-200 mb-2">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p>
          <span className="font-medium">Internal Comment:</span> This message is only visible to your team members and will not be sent to the contact.
        </p>
      </div>

      {/* Message Textarea */}
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write a comment and use @ to mention users. This is not visible to the contact."
          rows={6}
          className="w-full px-4 py-3 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
        />
      </div>

      {/* Show detected mentions */}
      {mentions.length > 0 && (
        <div className="flex items-center space-x-2 text-xs text-yellow-700 dark:text-yellow-300">
          <span>Mentioning:</span>
          {mentions.map((mention, index) => (
            <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">
              @{mention}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between">
        {/* Left: Action Buttons */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={(emoji) => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
                position="top"
              />
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowTagDropdown(!showTagDropdown); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert tag"
            >
              <Tag className="w-5 h-5" />
            </button>
            {showTagDropdown && (
              <TagDropdown
                onSelect={(val) => {
                  setMessage(prev => prev + val);
                  setShowTagDropdown(false);
                }}
                onClose={() => setShowTagDropdown(false)}
                position="top"
              />
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMessage('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
