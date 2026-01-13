import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Phone, Search, Book, HelpCircle, ExternalLink, Send } from 'lucide-react';
import { SupportTicketModal } from '../components/SupportTicketModal';
import { supportApi } from '../services/supportApi';

const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    (window as any).chattermateId = 'f638c1bb-753c-476d-bee1-1ded1ee2e39d';
    
    const script = document.createElement('script');
    script.src = 'https://app.chattermate.chat/webclient/chattermate.min.js';
    script.async = true;
    script.id = 'chattermate-script';
    script.onerror = () => {
      console.log('ChatterMate widget failed to load - using proxy fallback');
    };
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.getElementById('chattermate-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const handleSubmitTicket = async (data: { subject: string; message: string; priority: string }) => {
    try {
      await supportApi.submitTicket(data);
      setToast({ message: 'Support ticket submitted successfully! We\'ll get back to you within 24 hours.', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to submit ticket. Please try again.', type: 'error' });
      throw error;
    }
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
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ChatterMate AI Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get instant help from ChatterMate AI assistant with access to our complete knowledge base
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              To enable ChatterMate widget:
            </p>
            <ol className="text-xs text-gray-500 dark:text-gray-500 text-left space-y-1">
              <li>1. Add localhost:5173 to allowed domains in ChatterMate dashboard</li>
              <li>2. Widget will appear in bottom right corner</li>
            </ol>
          </div>

          {/* Email Support */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Submit a support ticket and get a detailed response within 24 hours
            </p>
            <button
              onClick={() => setShowTicketModal(true)}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
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

        {/* Knowledge Base */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Knowledge Base</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeBaseArticles.map((article, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs dark:bg-red-900 dark:text-red-200">
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
        </div> */}

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
                    <HelpCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
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

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <SupportTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onSubmit={handleSubmitTicket}
      />
    </div>
  );
};

export default Support;