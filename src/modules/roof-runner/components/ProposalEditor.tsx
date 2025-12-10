import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Settings, Eye, Minus, Plus, X } from 'lucide-react';
import { proposalsApi, Proposal } from '../services/proposalsApi';
import { proposalSharingApi } from '../services/proposalSharingApi';

interface ProposalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  proposalId?: string;
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ isOpen, onClose, templateId, proposalId }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Cover');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (proposalId) {
      loadProposal();
    }
  }, [proposalId]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await proposalsApi.getProposalById(Number(proposalId));
      setProposal(data);
    } catch (error) {
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading proposal...</div>
      </div>
    );
  }

  const sections = proposal?.sections?.map((s: any) => s.name) || [
    'Cover',
    'About Us', 
    'Inspection Photos',
    'Overview',
    'Scope of Work',
    'Estimate'
  ];

  const coverSection = proposal?.sections?.find((s: any) => s.type === 'cover');
  const estimateSection = proposal?.sections?.find((s: any) => s.type === 'quote');

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
      <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10">
        <div className="flex items-center">
          <button onClick={onClose} className="flex items-center text-primary-600 hover:text-primary-700 mr-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to proposals
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Changes auto-saved</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-900 dark:text-white font-medium mr-4">
            {proposal?.address?.address || proposal?.title || 'Untitled Proposal'}
          </span>
          <button 
            onClick={() => setShowEmailModal(true)}
            className="flex items-center px-3 py-1 text-primary-600 hover:text-primary-700 border border-primary-200 rounded mr-2"
          >
            <Send className="w-4 h-4 mr-1" />
            Send
          </button>
          <button 
            onClick={() => navigate(`/proposals/preview/${proposalId}`)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            View proposal
          </button>
        </div>
      </div>

      <div className="flex pt-16 w-full">
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Customer</h3>
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">Michelle Evans</div>
              <div className="text-gray-600 dark:text-gray-400">michelle@mauroatx.com</div>
              <div className="text-gray-600 dark:text-gray-400">(512) 220-0565</div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Proposal sections</h3>
              <button 
                onClick={() => navigate(`/proposals/template/${proposalId}`)}
                className="text-gray-400 hover:text-gray-600"
                title="Edit sections"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    activeSection === section
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-blue-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {activeSection === 'Cover' && coverSection?.cover && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                  <img 
                    src={coverSection.cover.images?.large || coverSection.cover.image_url} 
                    alt="Cover" 
                    className="w-full h-auto rounded-t-lg"
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{coverSection.title || 'Proposal Cover'}</h2>
                  </div>
                </div>
              )}

              {activeSection === 'Estimate' && estimateSection && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Estimate</h2>
                  </div>
                  <div className="p-6">
                    {estimateSection.variations?.map((variation: any) => (
                      <div key={variation.id} className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{variation.name}</h3>
                        {variation.upgrades?.map((upgrade: any) => (
                          <div key={upgrade.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">{upgrade.name}</h4>
                            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                                <div><span className="text-gray-600 dark:text-gray-400">Item</span></div>
                                <div className="text-right"><span className="text-gray-600 dark:text-gray-400">Price</span></div>
                              </div>
                              {upgrade.heading_groups?.map((group: any) => (
                                <div key={group.id}>
                                  {group.variation_items?.map((item: any) => (
                                    <div key={item.id} className="py-2 border-b border-gray-200 dark:border-gray-600">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                          {item.description && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: item.description }} />
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <div className="font-medium text-gray-900 dark:text-white">${item.total?.toFixed(2) || '0.00'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="text-gray-600 dark:text-gray-400">Subtotal</div>
                                  <div className="text-right text-gray-900 dark:text-white">${(upgrade.heading_groups?.reduce((sum: number, group: any) => sum + (group.variation_items?.reduce((itemSum: number, item: any) => itemSum + (item.total || 0), 0) || 0), 0) || 0).toFixed(2)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="text-gray-600 dark:text-gray-400">Margin ({proposal?.sections?.settings?.defaultMargin || 0}%)</div>
                                  <div className="text-right text-gray-900 dark:text-white">${((upgrade.heading_groups?.reduce((sum: number, group: any) => sum + (group.variation_items?.reduce((itemSum: number, item: any) => itemSum + (item.total || 0), 0) || 0), 0) || 0) * (parseFloat(proposal?.sections?.settings?.defaultMargin || '0') / 100)).toFixed(2)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                                  <div className="font-semibold text-gray-900 dark:text-white">Total</div>
                                  <div className="text-right font-semibold text-gray-900 dark:text-white">${((upgrade.heading_groups?.reduce((sum: number, group: any) => sum + (group.variation_items?.reduce((itemSum: number, item: any) => itemSum + (item.total || 0), 0) || 0), 0) || 0) * (1 + parseFloat(proposal?.sections?.settings?.defaultMargin || '0') / 100)).toFixed(2)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection !== 'Cover' && activeSection !== 'Estimate' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{activeSection}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Section content will be displayed here</p>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 right-20 flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send Proposal</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={emailData.recipientName}
                  onChange={(e) => setEmailData({ ...emailData, recipientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={emailData.recipientEmail}
                  onChange={(e) => setEmailData({ ...emailData, recipientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your Proposal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Please review your proposal..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  alert(`{1} ${JSON.stringify(emailData)}`)
                  if (!emailData.recipientEmail || !emailData.recipientName) {
                    alert('Please fill in recipient name and email');
                    return;
                  }
                  try {
                    setSending(true);
                    await proposalSharingApi.sendEmail(Number(proposalId), emailData);
                    alert('Proposal sent successfully!');
                    setShowEmailModal(false);
                    setEmailData({ recipientEmail: '', recipientName: '', subject: '', message: '' });
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Failed to send proposal. Please check your email settings.');
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                {sending ? 'Sending...' : 'Send Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalEditor;
