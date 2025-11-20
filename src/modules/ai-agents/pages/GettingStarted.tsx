import { useState } from 'react';
import { Phone, MessageSquare, Zap, Calendar } from 'lucide-react';

export function GettingStarted() {
  const [activeTab, setActiveTab] = useState('voice-ai');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Hey Sean, here are few things you can get started with
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Phone className="w-8 h-8 text-red-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Voice AI</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create and manage voice-enabled AI agents for phone interactions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-8 h-8 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Conversation AI</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Build intelligent chatbots for customer support and engagement
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('voice-ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'voice-ai'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Voice AI
            </button>
            <button
              onClick={() => setActiveTab('conversation-ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversation-ai'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Conversation AI
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'voice-ai' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create Your First Voice AI Agent</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-red-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Spin up a new Voice AI agent</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Spin up a new Voice AI agent in just a few clicks. Configure its name, greeting, and basic conversation flow to begin harnessing voice-based interactions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Test & Talk to Your Voice AI Agent</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Engage in a quick test call with your Voice AI agent. This helps confirm it's set up correctly, and you'll get a feel for how it handles basic conversations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-purple-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Assign a Phone Number & Go Live</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Link a dedicated phone number to your Voice AI agent or enable it as a backup to the phone number in case you are not around.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'conversation-ai' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create Your First Conversation AI Agent</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-red-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Set up a new Chatbot agent</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Set up a new Chatbot agent to handle text conversations. Give it a personality and basic instructions to ensure consistent, on-brand responses.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Talk to Your Conversation AI Agent</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Initiate a test chat session to see how your Conversation AI agent handles typical queries. Adjust its responses or flows as you see fit.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-purple-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Train Your Conversation AI Agent</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Refine your agent's knowledge base and conversation parameters. Provide FAQs, brand guidelines, or instructions so it can handle customer requests more accurately.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Book an Appointment with your Conversation AI Agent</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Add a calendar to the bot and give it the ability to directly book appointments for your contacts while talking to them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
