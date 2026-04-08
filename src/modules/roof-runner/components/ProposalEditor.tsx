import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Settings, Eye, Minus, Plus, X } from 'lucide-react';
import { proposalsApi, Proposal } from '../services/proposalsApi';
import { proposalSharingApi } from '../services/proposalSharingApi';
import { getBusinessInfo, BusinessInfo } from '../../../shared/store/services/businessInfoApi';

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
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
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
      loadBusinessInfo();
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

  const loadBusinessInfo = async () => {
    try {
      const response = await getBusinessInfo();
      setBusinessInfo(response.data);
    } catch (error) {
      console.error('Error loading business info:', error);
    }
  };

  const getRepresentativeName = () => {
    if (businessInfo?.representative_first_name && businessInfo?.representative_last_name) {
      return `${businessInfo.representative_first_name} ${businessInfo.representative_last_name}`;
    }
    return "Company representative name";
  };

  const getCompanyName = () => {
    const name = proposal?.sections?.settings?.companyName || businessInfo?.friendly_business_name || businessInfo?.legal_business_name;
    return name && name.trim() && name !== "Company Name" ? name : "Company Name";
  };

  const getCompanyLogo = () => {
    return proposal?.sections?.settings?.companyLogo || businessInfo?.business_logo || null;
  };

  const getCustomerName = () => {
    const name = proposal?.sections?.settings?.customerName;
    return name && name.trim() && name !== "Customer Name" ? name : "Customer Name";
  };

  const getCustomerEmail = () => {
    const email = proposal?.sections?.settings?.customerEmail;
    return email && email.trim() && email !== "customer@email.com" ? email : "";
  };

  const getCustomerPhone = () => {
    const phone = proposal?.sections?.settings?.customerPhone;
    return phone && phone.trim() && phone !== "(000) 000-0000" ? phone : "";
  };

  const getCustomerAddress = () => {
    const address = proposal?.sections?.settings?.customerAddress || proposal?.address?.address;
    return address && address.trim() && address !== "Customer Address" ? address : "";
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
      <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-saved</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {proposal?.address?.address || proposal?.title || 'Untitled Proposal'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors font-medium"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
          <button 
            onClick={() => navigate(`/proposals/preview/${proposalId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      <div className="flex pt-16 w-full">
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Customer</h3>
            <div className="space-y-2">
              <div className="font-semibold text-gray-900 dark:text-white">
                {getCustomerName()}
              </div>
              {getCustomerEmail() && (
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="text-gray-400">✉</span>
                  {getCustomerEmail()}
                </div>
              )}
              {getCustomerPhone() && (
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="text-gray-400">☎</span>
                  {getCustomerPhone()}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sections</h3>
              <button 
                onClick={() => navigate(`/proposals/template/${proposalId}`)}
                className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all font-medium ${
                    activeSection === section
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-8 overflow-auto">
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

          <div className="absolute bottom-6 right-6 flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <button 
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} 
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-l-lg"
              title="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200 dark:border-gray-700">{zoomLevel}%</span>
            <button 
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} 
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-r-lg"
              title="Zoom in"
            >
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
                  if (!emailData.recipientEmail) {
                    alert('Please provide a recipient email');
                    return;
                  }
                  
                  try {
                    setSending(true);
                    const result = await proposalSharingApi.sendEmail(Number(proposalId), {
                      recipientEmail: emailData.recipientEmail,
                      recipientName: emailData.recipientName,
                      subject: emailData.subject || `Proposal`,
                      message: emailData.message || `Please review the attached proposal.`
                    });
                    if ((result as any)?.status === 'sent' && proposal) {
                      setProposal({ ...proposal, status: 'sent' });
                    }
                    alert('Proposal sent successfully!');
                    setShowEmailModal(false);
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
