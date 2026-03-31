import React, { useState } from 'react';
import { FileText, Paperclip, Smile, Tag, Clock, X, AlertTriangle, Settings } from 'lucide-react';
import { SnippetSelector } from './SnippetSelector';
import { useNavigate } from 'react-router-dom';
import { TagDropdown } from './TagDropdown';
import { EmojiPicker } from './EmojiPicker';
import { smtpApi } from '../services/smtpApi';

interface MessageInputEmailProps {
  conversationId: string;
  contactEmail?: string;
  contactName?: string;
  contactId?: string;
  onSendSuccess?: () => void;
  onSendError?: (error: string) => void;
}

export function MessageInputEmail({ conversationId, contactEmail, contactName, contactId, onSendSuccess, onSendError }: MessageInputEmailProps) {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSmtpError, setShowSmtpError] = useState(false);
  const [toEmail, setToEmail] = useState(contactEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Calculate word count
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const handleSend = async () => {
    if (!message.trim() || !toEmail || !subject.trim() || !contactId) {
      onSendError?.('Please fill in all required fields');
      return;
    }

    setSending(true);
    setError(null);
    setShowSmtpError(false);

    try {
      await smtpApi.sendEmailMessage(contactId, subject, message);

      // Clear form
      setMessage('');
      setSubject('');
      setCcEmails([]);
      setBccEmails([]);
      setShowCc(false);
      setShowBcc(false);

      onSendSuccess?.();
    } catch (error: any) {
      if (error.error === 'SMTP not configured') {
        setShowSmtpError(true);
        setError(error.message);
        onSendError?.(error.message);
      } else {
        const errorMsg = error.error || error.message || 'Failed to send email';
        setError(errorMsg);
        onSendError?.(errorMsg);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addCcEmail = () => {
    if (ccInput.trim() && !ccEmails.includes(ccInput.trim())) {
      setCcEmails([...ccEmails, ccInput.trim()]);
      setCcInput('');
    }
  };

  const addBccEmail = () => {
    if (bccInput.trim() && !bccEmails.includes(bccInput.trim())) {
      setBccEmails([...bccEmails, bccInput.trim()]);
      setBccInput('');
    }
  };

  const removeCcEmail = (email: string) => {
    setCcEmails(ccEmails.filter((e) => e !== email));
  };

  const removeBccEmail = (email: string) => {
    setBccEmails(bccEmails.filter((e) => e !== email));
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* SMTP Error Alert */}
      {showSmtpError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Email Service Not Configured</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              <button
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  const orgSlug = user.companySlug || 'default';
                  navigate(`/org/${orgSlug}/settings/email-service`);
                }}
                className="mt-2 inline-flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <Settings className="w-4 h-4" />
                <span>Configure Email Service</span>
              </button>
            </div>
            <button
              onClick={() => setShowSmtpError(false)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* General Error Alert */}
      {error && !showSmtpError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {/* To Field with CC/BCC */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
          {/* <div className="flex items-center space-x-2">
            {!showCc && (
              <button
                onClick={() => setShowCc(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                CC
              </button>
            )}
            {!showBcc && (
              <button
                onClick={() => setShowBcc(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                BCC
              </button>
            )}
          </div> */}
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          {contactEmail && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {contactName?.charAt(0) || 'A'}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900 dark:text-white">{contactEmail}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                  Primary
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CC Field */}
      {/* {showCc && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CC:</label>
          <div className="flex flex-wrap gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            {ccEmails.map((email) => (
              <div
                key={email}
                className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm"
              >
                <span>{email}</span>
                <button onClick={() => removeCcEmail(email)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <input
              type="email"
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCcEmail())}
              onBlur={addCcEmail}
              placeholder="Add email and press Enter"
              className="flex-1 min-w-[200px] bg-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )} */}

      {/* BCC Field */}
      {/* {showBcc && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BCC:</label>
          <div className="flex flex-wrap gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            {bccEmails.map((email) => (
              <div
                key={email}
                className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-sm"
              >
                <span>{email}</span>
                <button onClick={() => removeBccEmail(email)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <input
              type="email"
              value={bccInput}
              onChange={(e) => setBccInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBccEmail())}
              onBlur={addBccEmail}
              placeholder="Add email and press Enter"
              className="flex-1 min-w-[200px] bg-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )} */}

      {/* Subject Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Message Textarea */}
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your email message..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between">
        {/* Left: Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSnippetSelector(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Insert snippet"
          >
            <FileText className="w-5 h-5" />
          </button>
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
          {/* 
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Text formatting">
            <Type className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert link">
            <LinkIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert image">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Payment">
            <DollarSign className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="More options">
            <Plus className="w-5 h-5" />
          </button>
          */}
        </div>

        {/* Right: Word Counter and Actions */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
          <button
            onClick={() => {
              setMessage('');
              setSubject('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || !toEmail || !subject.trim() || sending}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>{sending ? 'Sending...' : 'Send'}</span>
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <SnippetSelector
        isOpen={showSnippetSelector}
        onClose={() => setShowSnippetSelector(false)}
        onSelectSnippet={(body, subjectText) => {
          setMessage(body);
          if (subjectText) setSubject(subjectText);
        }}
        type="email"
      />
    </div>
  );
}
