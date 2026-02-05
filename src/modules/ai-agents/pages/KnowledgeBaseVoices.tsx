import { useState, useEffect } from 'react';
import { Plus, Upload, FileText, MessageSquare, Table, Globe, Trash2, Volume2, Play } from 'lucide-react';
import { useAuth } from '../../abc-supply/context/AuthContext';

interface KnowledgeItem {
  id: string;
  type: 'article' | 'qapair' | 'table' | 'website';
  title: string;
  created_at: string;
}

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  preview_url?: string;
}

export function KnowledgeBaseVoices() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'knowledge' | 'voices'>('knowledge');
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    if (activeTab === 'knowledge' && selectedAgent) {
      loadKnowledgeBase();
    } else if (activeTab === 'voices') {
      loadVoices();
    }
  }, [activeTab, selectedAgent]);

  const loadKnowledgeBase = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/knowledge-base/qapairs?agent_id=${selectedAgent}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setKnowledgeItems(data.data || []);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/elevenlabs/voices`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setVoices(data.data?.voices || []);
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKnowledge = async (formData: FormData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/knowledge-base/articles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (response.ok) {
        loadKnowledgeBase();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding knowledge:', error);
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/knowledge-base/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      loadKnowledgeBase();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  };

  const handleSelectVoice = async (voiceId: string) => {
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-agents/${selectedAgent}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voice_id: voiceId })
      });
      if (response.ok) {
        setSelectedVoice(voiceId);
        alert('Voice updated successfully!');
      }
    } catch (error) {
      console.error('Error updating voice:', error);
    }
  };

  const handleSyncToElevenLabs = async () => {
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }
    try {
      const orgId = localStorage.getItem('currentOrganizationId');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/knowledge-base/sync-to-elevenlabs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          organization_id: orgId,
          agent_id: selectedAgent
        })
      });
      if (response.ok) {
        alert('Knowledge base synced to ElevenLabs successfully!');
      }
    } catch (error) {
      console.error('Error syncing to ElevenLabs:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Manage Knowledge Base and AI Voices
        </p>
        <button
          onClick={handleSyncToElevenLabs}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sync to ElevenLabs
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'knowledge'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('voices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'voices'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
            >
              <Volume2 className="w-4 h-4 inline mr-2" />
              Voices
            </button>
          </nav>
        </div>

        {activeTab === 'knowledge' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Knowledge Base Items</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {knowledgeItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No knowledge base items yet. Add your first item to get started.
                      </td>
                    </tr>
                  ) : (
                    knowledgeItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteKnowledge(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Available Voices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {voices.map((voice) => (
                <div
                  key={voice.voice_id}
                  onClick={() => handleSelectVoice(voice.voice_id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedVoice === voice.voice_id
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{voice.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
