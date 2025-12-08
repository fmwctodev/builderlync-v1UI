import React, { useState, useEffect } from 'react';
import { Send, Users, Plus, X, AlertTriangle, Settings, FileText } from 'lucide-react';
import { SnippetSelector } from './SnippetSelector';
import { useNavigate } from 'react-router-dom';
import { smtpApi } from '../services/smtpApi';
import { CreateTeamModal } from './CreateTeamModal';

interface TeamMessageInputProps {
  onSend: (message: string, metadata: any) => void;
}

export function TeamMessageInput({ onSend }: TeamMessageInputProps) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showSnippetSelector, setShowSnippetSelector] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const teamsData = await smtpApi.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedTeam || (messageType === 'email' && !subject.trim())) {
      setError('Please fill in all required fields');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await smtpApi.sendTeamMessage(selectedTeam, subject, message, messageType);
      
      onSend(message, {
        teamId: selectedTeam,
        messageType,
        subject: messageType === 'email' ? subject : undefined,
        teamName: teams.find(t => t.id.toString() === selectedTeam)?.name
      });

      setMessage('');
      setSubject('');
    } catch (error: any) {
      setError(error.error || error.message || 'Failed to send team message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Team Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Team:</label>
          <button
            onClick={() => {
              console.log('Create Team button clicked');
              setShowCreateTeam(true);
            }}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Create Team</span>
          </button>
        </div>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Choose a team...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.team_members?.length || 0} members)
            </option>
          ))}
        </select>
      </div>

      {/* Message Type */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Message Type:</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="email"
              checked={messageType === 'email'}
              onChange={(e) => setMessageType(e.target.value as 'email')}
              className="mr-2"
            />
            Email
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="sms"
              checked={messageType === 'sms'}
              onChange={(e) => setMessageType(e.target.value as 'sms')}
              className="mr-2"
            />
            SMS
          </label>
        </div>
      </div>

      {/* Subject (Email only) */}
      {messageType === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Type your ${messageType} message to team...`}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Send Button */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setShowSnippetSelector(true)}
          className="p-2 text-gray-500 hover:text-gray-700"
          title="Insert snippet"
        >
          <FileText className="w-5 h-5" />
        </button>
        <div className="flex space-x-3">
        <button
          onClick={() => {setMessage(''); setSubject('');}}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear
        </button>
        <button
          onClick={handleSend}
          disabled={!message.trim() || !selectedTeam || sending || (messageType === 'email' && !subject.trim())}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Users className="w-4 h-4" />
          <span>{sending ? 'Sending...' : `Send ${messageType.toUpperCase()} to Team`}</span>
        </button>
        </div>
      </div>

      <CreateTeamModal 
        isOpen={showCreateTeam}
        onClose={() => {
          console.log('Modal close called');
          setShowCreateTeam(false);
        }}
        onTeamCreated={() => {
          console.log('Team created callback');
          setShowCreateTeam(false);
          loadTeams();
        }}
      />
      {showCreateTeam && console.log('showCreateTeam is true')}

      <SnippetSelector
        isOpen={showSnippetSelector}
        onClose={() => setShowSnippetSelector(false)}
        onSelectSnippet={(body) => setMessage(body)}
        type={messageType === 'email' ? 'email' : 'text'}
      />
    </div>
  );
}

