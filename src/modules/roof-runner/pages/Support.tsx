import { useState } from 'react';
import { MessageCircle, Mail, Search, HelpCircle, Send } from 'lucide-react';
import {
  PageContainer, PageHeader, Section, SectionHeader, Card, CardBody,
  CardHeader, Button, Input, Chip,
} from '../../../shared/components/ui';

const Support: React.FC = () => {
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
    { title: 'Getting Started with BuilderLync', category: 'Basics',       description: 'Learn the fundamentals of using BuilderLync for your roofing business', readTime: '5 min read' },
    { title: 'Setting Up Your First Job Pipeline', category: 'Jobs',        description: 'Step-by-step guide to creating and managing job opportunities',         readTime: '8 min read' },
    { title: 'Integrating with QuickBooks',       category: 'Integrations', description: 'How to connect and sync your QuickBooks data with BuilderLync',         readTime: '10 min read' },
    { title: 'Creating Automated Workflows',      category: 'Automation',   description: 'Build powerful automations to streamline your business processes',     readTime: '12 min read' },
    { title: 'Managing Team Permissions',         category: 'Settings',     description: 'Configure user roles and permissions for your team members',           readTime: '6 min read' },
    { title: 'Using AI Agents for Lead Qualification', category: 'AI Agents', description: 'Deploy AI agents to handle incoming leads and book appointments',     readTime: '15 min read' },
  ];

  const faqs = [
    { question: 'How do I export my contact data?',         answer: 'Only account owners can export data. Go to Contacts > Export button. This feature is restricted for security purposes.' },
    { question: 'Can I integrate with other CRM systems?',  answer: 'Currently, we support QuickBooks integration with 2-way sync. Additional integrations are planned for future releases.' },
    { question: 'How do I set up automated follow-ups?',    answer: 'Navigate to Automations > Create Workflow. You can set triggers based on job stages, time delays, or contact actions.' },
    { question: 'What payment methods do you accept?',      answer: 'We accept all major credit cards and ACH payments. Billing is handled securely through our payment processor.' },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Help"
        title="Support center"
        subtitle="Get help, find answers, and connect with our support team."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-signal-100 dark:bg-signal-500/15 rounded-studio-2 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-signal-500" />
              </div>
              <div className="studio-text-title-2 mb-1">Start chat</div>
              <p className="studio-text-muted mb-4">
                Get instant help from our AI assistant with access to our complete knowledge base.
              </p>
              <Button variant="primary" fullWidth onClick={handleStartChat}>
                Start chat now
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-signal-100 dark:bg-signal-500/15 rounded-studio-2 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-signal-500" />
              </div>
              <div className="studio-text-title-2 mb-1">Email support</div>
              <p className="studio-text-muted mb-4">
                Submit a support ticket and get a detailed response within 24 hours.
              </p>
              <a href="mailto:support@builderlync.com" className="block">
                <Button variant="primary" fullWidth>
                  Send email
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </Section>

      {chatStarted && (
        <Section>
          <Card flush>
            <div className="px-5 py-4 border-b border-edge-soft dark:border-edge-d-soft">
              <div className="studio-text-title-2">Support chat</div>
            </div>
            <div className="h-96 overflow-y-auto scrollbar-studio p-5 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      'max-w-xs lg:max-w-md px-3 py-2 rounded-studio-2 ' +
                      (msg.sender === 'user'
                        ? 'bg-signal-500 text-white'
                        : 'bg-surface-2 dark:bg-surface-d-2 text-ink-1 dark:text-ink-d-1')
                    }
                  >
                    <p className="studio-text-body">{msg.text}</p>
                    <p className="studio-text-caption opacity-75 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-edge-soft dark:border-edge-d-soft flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message…"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleSendMessage} aria-label="Send">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </Section>
      )}

      <Section>
        <SectionHeader
          title="Knowledge base"
          actions={
            <div className="w-72">
              <Input leadingIcon={<Search />} placeholder="Search articles…" />
            </div>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeBaseArticles.map((article, index) => (
            <Card key={index} interactive>
              <div className="flex items-center justify-between mb-2">
                <Chip tone="signal">{article.category}</Chip>
                <span className="studio-text-caption text-ink-3 dark:text-ink-d-3">{article.readTime}</span>
              </div>
              <div className="studio-text-body-strong mb-1">{article.title}</div>
              <p className="studio-text-muted">{article.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <Card flush>
          <CardHeader title="Frequently asked questions" className="px-5 pt-5" />
          <CardBody className="px-5 pb-5">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-studio-2 border border-edge-soft dark:border-edge-d-soft p-4"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-signal-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="studio-text-body-strong mb-1">{faq.question}</div>
                      <p className="studio-text-muted">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </Section>
    </PageContainer>
  );
};

export default Support;
