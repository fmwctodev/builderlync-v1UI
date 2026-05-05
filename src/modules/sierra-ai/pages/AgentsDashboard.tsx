import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Phone, MessageSquare, Globe, CheckCircle2, Pause, Plus } from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { fetchAgents, AIAgent } from '../services/agentsApi';

export function AgentsDashboard() {
  const navigate = useNavigate();
  const { currentOrganizationSlug, currentOrganization } = useCurrentOrganization();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, [currentOrganization?.id]);

  const loadAgents = async () => {
    if (!currentOrganization?.id) return;

    try {
      setLoading(true);
      const data = await fetchAgents(currentOrganization.id);
      setAgents(data);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgent = (agent: AIAgent) => {
    console.log('Try agent:', agent.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Agents</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your conversational AI agents for voice, SMS, and webchat
          </p>
        </div>

        {/* Empty State or Agent Cards Grid */}
        {agents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center mb-8">
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
                  onClick={() => navigate(`/ai-agents/create`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Agent
                </button>
                <button
                  onClick={() => navigate(`/ai-agents/create`)}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Start from Blank
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/ai-agents/agent/${agent.id}`)}
            >
              {/* Agent Header with Visual */}
              <div className="relative h-48 bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  {agent.status === 'active' ? (
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Bot className="w-10 h-10 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <Bot className="w-10 h-10 text-gray-600" />
                    </div>
                  )}
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {agent.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : agent.status === 'paused' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Pause className="w-3 h-3" />
                      Paused
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Agent Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                </div>

                {/* Channel Badges */}
                <div className="flex gap-2 mb-4">
                  {agent.channels.voice?.enabled && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <Phone className="w-3 h-3" />
                      Voice
                    </div>
                  )}
                  {agent.channels.sms?.enabled && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <MessageSquare className="w-3 h-3" />
                      SMS
                    </div>
                  )}
                  {agent.channels.webchat?.enabled && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <Globe className="w-3 h-3" />
                      Webchat
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.stats.callsHandled || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.stats.messagesHandled || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.stats.appointmentsBooked || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Booked</div>
                  </div>
                </div>

                {/* Try Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTryAgent(agent);
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  Try a call
                </button>
              </div>
            </div>
          ))}
            </div>

            {/* Create New Agent Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/ai-agents/create`)}
                className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Start from blank
              </button>
              <button
                onClick={() => navigate(`/ai-agents/create`)}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
              >
                Create agent
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
