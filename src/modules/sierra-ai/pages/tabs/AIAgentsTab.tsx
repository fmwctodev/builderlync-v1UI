import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Bot,
  Phone,
  MessageSquare,
  Mail,
  CheckCircle2,
  Pause,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import {
  fetchAgents,
  deleteAgent,
  duplicateAgent,
  updateAgentStatus,
  AIAgent,
} from '../../services/agentsApi';
import { CreateAgentWizard } from '../CreateAgentWizard';
import { elevenlabsApi } from '../../services/elevenlabsApi';
import { useAppSelector } from '../../../roof-runner/store/hooks';

export function AIAgentsTab() {
  const navigate = useNavigate();
  const { currentOrganizationSlug, currentOrganization } = useCurrentOrganization();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const { user } = useAppSelector((state) => state.auth);
  const orgSlug = user?.companySlug || localStorage.getItem('currentOrganizationSlug');

  useEffect(() => {
    console.log('showCreateModal changed:', showCreateModal);
  }, [showCreateModal]);

  useEffect(() => {
    loadAgents();
  }, [user?.id]);

  const loadAgents = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await elevenlabsApi.getAgents(String(user.id));
      setAgents(response.data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!currentOrganization?.id) return;

    try {
      const duplicated = await duplicateAgent(id, currentOrganization.id);
      setAgents((prev) => [duplicated, ...prev]);
    } catch (error) {
      console.error('Error duplicating agent:', error);
      alert('Failed to duplicate agent');
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'paused' | 'draft') => {
    try {
      const updated = await updateAgentStatus(id, status);
      setAgents((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status');
    }
  };

  const startEditingName = (agent: AIAgent) => {
    setEditingNameId(agent.id);
    setEditingName(agent.name);
  };

  const saveAgentName = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const { updateAgent } = await import('../../services/agentsApi');
      const updated = await updateAgent({ id, name: editingName.trim() });
      setAgents((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingNameId(null);
    } catch (error) {
      console.error('Error updating agent name:', error);
      alert('Failed to update agent name');
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Phone className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            Draft
          </span>
        );
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading agents...</div>
        </div>
      );
    }

    if (agents.length === 0 && searchTerm === '' && statusFilter === 'all') {
      return (
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Create Your First AI Agent
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Build intelligent conversational agents that can handle customer inquiries,
                book appointments, and engage with your customers across voice, SMS, and webchat channels.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    // console.log('Button clicked, currentOrganization:', currentOrganization);
                    // if (!currentOrganization) {
                    //   alert('Please wait for organization to load or select an organization');
                    //   return;
                    // }
                    navigate(`/org/${orgSlug}/create-agent`);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Agents</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredAgents.length} {filteredAgents.length === 1 ? 'agent' : 'agents'}
            </p>
          </div>
          <button
            onClick={() => {
              // console.log('Create Agent clicked, currentOrganization:', currentOrganization);
              // if (!currentOrganization) {
              //   alert('Please wait for organization to load or select an organization');
              //   return;
              // }
              navigate(`/org/${orgSlug}/create-agent`);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible">
          <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Channels
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 ">
                {filteredAgents.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => navigate(`/org/${orgSlug}/ai-agents/agent/${agent.id}`)}
                    className="bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      {editingNameId === agent.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => saveAgentName(agent.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveAgentName(agent.id);
                            if (e.key === 'Escape') setEditingNameId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="px-2 py-1 border border-red-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        />
                      ) : (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{agent.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {agent.description}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {getTypeIcon(agent.agent_type)}
                        <span className="capitalize">{agent.agent_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(agent.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {agent.channels?.voice?.enabled && (
                          <div className="p-1 bg-red-50 dark:bg-red-900/20 rounded">
                            <Phone className="w-3 h-3 text-red-700 dark:text-red-400" />
                          </div>
                        )}
                        {agent.channels?.sms?.enabled && (
                          <div className="p-1 bg-green-50 dark:bg-green-900/20 rounded">
                            <MessageSquare className="w-3 h-3 text-green-700 dark:text-green-400" />
                          </div>
                        )}
                        {agent.channels?.webchat?.enabled && (
                          <div className="p-1 bg-red-50 dark:bg-red-900/20 rounded">
                            <Bot className="w-3 h-3 text-red-700 dark:text-red-400" />
                          </div>
                        )}
                        {agent.channels?.email?.enabled && (
                          <div className="p-1 bg-orange-50 dark:bg-orange-900/20 rounded">
                            <Mail className="w-3 h-3 text-orange-700 dark:text-orange-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {((agent.stats?.callsHandled || 0) + (agent.stats?.messagesHandled || 0))} interactions
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === agent.id ? null : agent.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        {openMenuId === agent.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999]">
                            <button
                              onClick={() => {
                                startEditingName(agent);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Rename
                            </button>
                            {agent.status === 'active' ? (
                              <button
                                onClick={() => {
                                  handleStatusChange(agent.id, 'paused');
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <PauseCircle className="w-4 h-4" />
                                Pause
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleStatusChange(agent.id, 'active');
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <PlayCircle className="w-4 h-4" />
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDuplicate(agent.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(agent.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAgents.length === 0 && (searchTerm !== '' || statusFilter !== 'all') && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No agents found matching your filters</p>
          </div>
        )}
      </div>
    );
  };

  return renderContent();
}
