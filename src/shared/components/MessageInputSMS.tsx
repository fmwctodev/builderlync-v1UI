import React, { useState, useEffect } from 'react';
import { Send, FileText, Paperclip, Smile, Tag, DollarSign, Plus, Sparkles, ChevronDown } from 'lucide-react';
import { sendSMS } from '../services/conversationsApi';
import { supabase } from '../lib/supabase';
import { TagDropdown } from './TagDropdown';
import { EmojiPicker } from './EmojiPicker';

interface MessageInputSMSProps {
  conversationId: string;
  toNumber?: string;
  contactName?: string;
  onSendSuccess?: () => void;
  onSendError?: (error: string) => void;
}

export function MessageInputSMS({ conversationId, toNumber, contactName, onSendSuccess, onSendError }: MessageInputSMSProps) {
  const [message, setMessage] = useState('');
  const [selectedFromNumber, setSelectedFromNumber] = useState('');
  const [selectedToNumber, setSelectedToNumber] = useState(toNumber || '');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [availableFromNumbers, setAvailableFromNumbers] = useState<Array<{ number: string; verified: boolean }>>([]);

  // Calculate SMS character count and segments
  const calculateSMSStats = (text: string) => {
    const length = text.length;
    let segments = 1;

    if (length === 0) {
      return { chars: 0, segments: 0 };
    }

    // Standard GSM-7 encoding: 160 chars per segment, 153 for concatenated
    // Extended characters (like €, ^, {, }, [, ], ~, |, \) count as 2
    const hasExtendedChars = /[\^{}\\~\[\]|€]/.test(text);

    if (length <= 160 && !hasExtendedChars) {
      segments = 1;
    } else {
      segments = Math.ceil(length / 153);
    }

    return { chars: length, segments };
  };

  const { chars, segments } = calculateSMSStats(message);

  // Fetch available phone numbers on mount
  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const { data, error } = await supabase
          .from('twilio_phone_numbers')
          .select('phone_number, is_default')
          .order('is_default', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const numbers = data.map(n => ({ number: n.phone_number, verified: true }));
          setAvailableFromNumbers(numbers);

          // Set default number
          const defaultNum = data.find(n => n.is_default);
          setSelectedFromNumber(defaultNum?.phone_number || data[0].phone_number);
        }
      } catch (error) {
        console.error('Failed to fetch phone numbers:', error);
      }
    };

    fetchPhoneNumbers();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !selectedToNumber || sending) return;

    setSending(true);
    try {
      await sendSMS({
        conversation_id: conversationId,
        to_number: selectedToNumber,
        from_number: selectedFromNumber,
        message: message.trim(),
      });

      setMessage('');
      onSendSuccess?.();
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      onSendError?.(error.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const availableToNumbers = [
    { number: toNumber || '', label: 'Primary', isPrimary: true },
  ];

  return (
    <div className="flex flex-col space-y-3">
      {/* From and To Fields */}
      <div className="flex items-center space-x-4">
        {/* From Field */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From:
          </label>
          <button
            onClick={() => setShowFromDropdown(!showFromDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <span>{selectedFromNumber}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showFromDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              {availableFromNumbers.map((num) => (
                <button
                  key={num.number}
                  onClick={() => {
                    setSelectedFromNumber(num.number);
                    setShowFromDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{num.number}</span>
                  {num.verified && (
                    <span className="text-xs text-green-600 dark:text-green-400">✓ Verified</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* To Field */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To:
          </label>
          <button
            onClick={() => setShowToDropdown(!showToDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <span>{selectedToNumber || 'Select number'}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showToDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
              {availableToNumbers.map((num) => (
                <button
                  key={num.number}
                  onClick={() => {
                    setSelectedToNumber(num.number);
                    setShowToDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{num.number}</span>
                  {num.isPrimary && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Textarea */}
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />

        {/* AI Assistant Button */}
        <button
          className="absolute bottom-3 right-3 p-2 text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-white dark:border-gray-700" />
          </div>
        </button>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between">
        {/* Left: Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Attach document">
            <FileText className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Attach file">
            <Paperclip className="w-5 h-5" />
          </button>
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
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Payment">
            <DollarSign className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="More options">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Character Counter and Actions */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Chars: {chars}, Segs: {segments}
          </span>
          <button
            onClick={() => setMessage('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || !selectedToNumber || sending}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>{sending ? 'Sending...' : 'Send'}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
