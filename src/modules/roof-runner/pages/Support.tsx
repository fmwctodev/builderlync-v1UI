import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HelpCircle, Mail, MessageCircle, BookOpen, ArrowRight, Search } from 'lucide-react';
import { SupportTicketModal } from '../components/SupportTicketModal';
import { supportApi, SupportTicketListItem } from '../services/supportApi';
import { getAllCategories, getArticleCount, getFeaturedArticles } from '../../knowledge-base/data';

const statusStyles: Record<string, string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  waiting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

const priorityStyles: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const Support: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tickets, setTickets] = useState<SupportTicketListItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketListItem | null>(null);
  const [openingTicket, setOpeningTicket] = useState(false);
  const [chattermateLoadFailed, setChattermateLoadFailed] = useState(false);

  // Knowledge base teasers (read from local data — no network call)
  const kbCategories = getAllCategories().slice(0, 8);
  const kbFeatured = getFeaturedArticles(3);
  const kbTotal = getArticleCount();

  useEffect(() => {
    (window as any).chattermateId = 'f638c1bb-753c-476d-bee1-1ded1ee2e39d';

    const script = document.createElement('script');
    script.src = 'https://app.chattermate.chat/webclient/chattermate.min.js';
    script.async = true;
    script.id = 'chattermate-script';
    script.onerror = () => {
      console.log('ChatterMate widget failed to load - using proxy fallback');
      setChattermateLoadFailed(true);
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('chattermate-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    loadTickets(currentPage);
  }, [currentPage]);

  const loadTickets = async (page = 1) => {
    try {
      setLoadingTickets(true);
      const query: any = { page, limit: 5 };
      const response = await supportApi.getMyTickets(query);
      setTickets(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 });
    } catch {
      setToast({ message: 'Failed to load tickets.', type: 'error' });
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleOpenTicket = async (ticketId: string) => {
    try {
      const quickPreview = tickets.find((t) => t.id === ticketId) || null;
      setSelectedTicket(quickPreview);
      setOpeningTicket(true);
      const response = await supportApi.getTicketById(ticketId);
      setSelectedTicket(response.data);
    } catch {
      setToast({ message: 'Failed to open ticket details.', type: 'error' });
    } finally {
      setOpeningTicket(false);
    }
  };

  const handleSubmitTicket = async (data: { subject: string; message: string; priority: string; image?: File | null }) => {
    try {
      await supportApi.submitTicket(data as any);
      setToast({ message: 'Support ticket submitted successfully! We\'ll get back to you within 24 hours.', type: 'success' });
      setShowTicketModal(false);
      setCurrentPage(1);
      await loadTickets(1);
    } catch (error) {
      setToast({ message: 'Failed to submit ticket. Please try again.', type: 'error' });
      throw error;
    }
  };

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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Support Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Get help, find answers, and connect with our support team</p>
      </div>

      <div className="p-6">
        {/* Knowledge Base — hero card + category teasers */}
        <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-800 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Knowledge Base
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {kbTotal} articles, video walkthroughs, and step-by-step guides for every BuilderLync module.
                </p>
              </div>
              <Link
                to={`${orgPrefix}/support/knowledge-base`}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 shrink-0 mt-1"
              >
                Browse all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mini search → routes to KB home */}
            <Link
              to={`${orgPrefix}/support/knowledge-base`}
              className="flex items-center gap-3 px-4 py-3 mb-5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Search guides, videos, module overviews…
              </span>
            </Link>

            {/* Featured articles */}
            {kbFeatured.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Featured guides
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {kbFeatured.map((a) => (
                    <Link
                      key={a.slug}
                      to={`${orgPrefix}/support/knowledge-base/${a.categorySlug}/${a.slug}`}
                      className="group block p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600 transition-all"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                        {a.title}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {a.readMinutes ? `${a.readMinutes} min read` : 'Guide'}
                        {a.primaryVideoUrl && ' · Video'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Category strip */}
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Browse by module
              </div>
              <div className="flex flex-wrap gap-2">
                {kbCategories.map((c) => {
                  const Icon = c.icon;
                  return (
                    <Link
                      key={c.slug}
                      to={`${orgPrefix}/support/knowledge-base/${c.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {c.name}
                    </Link>
                  );
                })}
                <Link
                  to={`${orgPrefix}/support/knowledge-base`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  See all categories
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ChatterMate AI Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get instant help from ChatterMate AI assistant with access to our complete knowledge base
            </p>
            {chattermateLoadFailed ? (
              <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-left">
                <strong className="font-medium">Chat is unavailable right now.</strong> The ChatterMate widget couldn't load. In the meantime, please use Email Support or browse the Knowledge Base above for instant answers.
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">To enable ChatterMate widget:</p>
                <ol className="text-xs text-gray-500 dark:text-gray-500 text-left space-y-1">
                  <li>1. Add localhost:5173 to allowed domains in ChatterMate dashboard</li>
                  <li>2. Widget will appear in bottom right corner</li>
                </ol>
              </>
            )}
          </div>

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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Tickets</h3>
            <button
              onClick={() => loadTickets(currentPage)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
          <div className="p-6">
            {loadingTickets ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No tickets found for this filter.</div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.ticket_number}</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{ticket.subject}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Updated: {new Date(ticket.updated_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyles[ticket.priority] || priorityStyles.medium}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[ticket.status] || statusStyles.open}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => handleOpenTicket(ticket.id)}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} tickets)
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 dark:text-white"
                >
                  Prev
                </button>
                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, pagination.page - 3), Math.max(0, pagination.page - 3) + 5)
                  .map((pageNo) => (
                    <button
                      key={pageNo}
                      onClick={() => setCurrentPage(pageNo)}
                      className={`px-3 py-1.5 border rounded-lg ${
                        pageNo === pagination.page
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 dark:text-white'
                      }`}
                    >
                      {pageNo}
                    </button>
                  ))}
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 dark:text-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

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
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}

      <SupportTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onSubmit={handleSubmitTicket}
      />

      {(selectedTicket || openingTicket) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-3">
              {openingTicket || !selectedTicket ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading ticket...</div>
              ) : (
                <>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{selectedTicket.ticket_number}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTicket.subject}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[selectedTicket.status] || statusStyles.open}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyles[selectedTicket.priority] || priorityStyles.medium}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(selectedTicket.created_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last Update: {new Date(selectedTicket.updated_at).toLocaleString()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
