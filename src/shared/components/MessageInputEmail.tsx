import React, { useState, useEffect } from 'react';
import { Send, FileText, Link as LinkIcon, Image as ImageIcon, Paperclip, Smile, DollarSign, Plus, Type, Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MessageInputEmailProps {
  conversationId: string;
  contactEmail?: string;
  contactName?: string;
  onSendSuccess?: () => void;
  onSendError?: (error: string) => void;
}

export function MessageInputEmail({ conversationId, contactEmail, contactName, onSendSuccess, onSendError }: MessageInputEmailProps) {
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  // Load user's connected email accounts
  useEffect(() => {
    loadEmailAccounts();
  }, []);

  const loadEmailAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmailAccounts(accounts || []);

      // Set default from email if available
      if (accounts && accounts.length > 0) {
        setFromEmail(accounts[0].email_address);
      }

      // Load user profile for name
      const { data: profile } = await supabase
        .from('contacts')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .eq('type', 'staff')
        .maybeSingle();

      if (profile) {
        setFromName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      }
    } catch (error) {
      console.error('Failed to load email accounts:', error);
    }
  };
  const [toEmail, setToEmail] = useState(contactEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');

  // Calculate word count
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const handleSend = async () => {
    if (!message.trim() || !toEmail || !subject.trim()) {
      onSendError?.('Please fill in all required fields');
      return;
    }

    if (emailAccounts.length === 0) {
      onSendError?.('No email account connected. Please connect Gmail or Outlook in settings.');
      return;
    }

    setSending(true);
    try {
      // For now, save the email as a pending message in the database
      // The actual sending will be implemented via edge function when email integration is complete
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        message_type: 'email',
        direction: 'outbound',
        sender_id: user.id,
        content: message,
        is_internal: false,
        email_metadata: {
          from_name: fromName,
          from_email: fromEmail,
          to_emails: [toEmail],
          cc_emails: ccEmails.length > 0 ? ccEmails : undefined,
          bcc_emails: bccEmails.length > 0 ? bccEmails : undefined,
          subject: subject,
        },
        delivery_status: 'pending',
      });

      if (error) throw error;

      // Clear form
      setMessage('');
      setSubject('');
      setCcEmails([]);
      setBccEmails([]);
      setShowCc(false);
      setShowBcc(false);

      onSendSuccess?.();
    } catch (error: any) {
      console.error('Failed to send email:', error);
      onSendError?.(error.message || 'Failed to send email');
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
      {/* From Fields */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Name:
          </label>
          <input
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From email:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" title="Email settings">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* To Field with CC/BCC */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
          <div className="flex items-center space-x-2">
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
          </div>
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
      {showCc && (
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
      )}

      {/* BCC Field */}
      {showBcc && (
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
      )}

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
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your email message..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between">
        {/* Left: Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Text formatting">
            <Type className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Attach document">
            <FileText className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert link">
            <LinkIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert image">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Attach file">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Insert emoji">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="Payment">
            <DollarSign className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" title="More options">
            <Plus className="w-5 h-5" />
          </button>
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
    </div>
  );
}
