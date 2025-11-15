import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Search, Book, HelpCircle, ExternalLink, Send } from 'lucide-react';

const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatStarted, setChatStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'ai', timestamp: string}>>([]);

  const handleStartChat = () => {
    setChatStarted(true);
    setMessages([
      {
        id: 1,
        text: "Hi! I'm your BuilderLync AI assistant. I have access to our complete knowledge base and can help you with any questions about using the platform. How can I assist you today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "I understand your question. Let me help you with that. Based on our knowledge base, here's what I recommend...",
        sender: 'ai' as const,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const knowledgeBaseArticles = [
    {
      title: 'Getting Started with BuilderLync',
      category: 'Basics',
      description: 'Learn the fundamentals of using BuilderLync for your roofing business',
      readTime: '5 min read'
    },
    {
      title: 'Setting Up Your First Job Pipeline',
      category: 'Jobs',
      description: 'Step-by-step guide to creating and managing job opportunities',
      readTime: '8 min read'
    },
    {
      title: 'Integrating with QuickBooks',
      category: 'Integrations',
      description: 'How to connect and sync your QuickBooks data with BuilderLync',
      readTime: '10 min read'
    },
    {
      title: 'Creating Automated Workflows',
      category: 'Automation',
      description: 'Build powerful automations to streamline your business processes',
      readTime: '12 min read'
    },
    {
      title: 'Managing Team Permissions',
      category: 'Settings',
      description: 'Configure user roles and permissions for your team members',
      readTime: '6 min read'
    },
    {
      title: 'Using AI Agents for Lead Qualification',
      category: 'AI Agents',
      description: 'Deploy AI agents to handle incoming leads and book appointments',
      readTime: '15 min read'
    }
  ];

  const faqs = [
    {
      question: 'How do I export my contact data?',
      answer: 'Only account owners can export data. Go to Contacts > Export button. This feature is restricted for security purposes.'
    },
    {
      question: 'Can I integrate with other CRM systems?',
      answer: 'Currently, we support QuickBooks integration with 2-way sync. Additional integrations are planned for future releases.'
    },
    {
      question: 'How do I set up automated follow-ups?',
      answer: 'Navigate to Automations > Create Workflow. You can set triggers based on job stages, time delays, or contact actions.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and ACH payments. Billing is handled securely through our payment processor.'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Support Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Get help, find answers, and connect with our support team</p>
      </div>

      {/* Support Options */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Start Chat */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start Chat</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get instant help from our AI assistant with access to our complete knowledge base
            </p>
            <button 
              onClick={handleStartChat}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Chat Now
            </button>
          </div>

          {/* Email Support */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Submit a support ticket and get a detailed response within 24 hours
            </p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Send Email
            </button>
          </div>

          {/* Phone Support */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Call Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Speak directly with our support team for urgent issues
            </p>
            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Call Now
            </button>
          </div> */}
        </div>

        {/* Chat Interface */}
        {chatStarted && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Support Chat</h3>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Knowledge Base</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeBaseArticles.map((article, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs dark:bg-blue-900 dark:text-blue-200">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{article.readTime}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{article.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{article.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{faq.question}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;