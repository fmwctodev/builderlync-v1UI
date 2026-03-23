import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Sparkles, Check, Loader2,
  FileText, Search, X, ChevronRight
} from 'lucide-react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { getContacts } from '../../../../shared/store/services/contactsApi';
import { createProposal } from '../../services/proposalsNewApi';
import { generateAiProposal } from '../../services/aiProposalApi';
import {
  AI_PROPOSAL_TEMPLATES,
  SECTION_LABELS,
  type SectionType,
  type AiProposalTemplate,
} from '../../types/aiProposal';
import type { Contact } from '../../../../shared/store/services/contactsApi';

type WizardStep = 1 | 2 | 3 | 4;

const ALL_SECTIONS: SectionType[] = ['intro', 'scope', 'materials', 'timeline', 'terms', 'damage_assessment'];

const GENERATING_MESSAGES = [
  'Creating your proposal...',
  'Analyzing project context...',
  'Generating content with AI...',
  'Finalizing sections...',
];

function ProgressDots({ step }: { step: WizardStep }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {([1, 2, 3, 4] as WizardStep[]).map(s => (
        <div
          key={s}
          className={`rounded-full transition-all ${
            s === step ? 'w-6 h-2 bg-red-600' : s < step ? 'w-2 h-2 bg-red-400' : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function MobileAiProposalGenerator() {
  const navigate = useNavigate();
  const { currentOrganizationId } = useCurrentOrganization();
  const [step, setStep] = useState<WizardStep>(1);

  const [title, setTitle] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const contactTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<AiProposalTemplate | null>(null);
  const [selectedSections, setSelectedSections] = useState<SectionType[]>(['intro', 'scope', 'materials', 'timeline', 'terms']);
  const [customInstructions, setCustomInstructions] = useState('');

  const [msgIndex, setMsgIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedProposalId, setGeneratedProposalId] = useState<string | null>(null);
  const generationStarted = useRef(false);

  useEffect(() => {
    if (!contactSearch.trim()) { setContactResults([]); return; }
    if (contactTimerRef.current) clearTimeout(contactTimerRef.current);
    contactTimerRef.current = setTimeout(async () => {
      if (!currentOrganizationId) return;
      setContactLoading(true);
      try {
        const res = await getContacts(currentOrganizationId, { search: contactSearch });
        setContactResults(res.data || []);
      } catch { /* noop */ }
      setContactLoading(false);
    }, 300);
    return () => { if (contactTimerRef.current) clearTimeout(contactTimerRef.current); };
  }, [contactSearch, currentOrganizationId]);

  useEffect(() => {
    if (step !== 3 || generationStarted.current) return;
    generationStarted.current = true;

    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % GENERATING_MESSAGES.length);
    }, 1800);

    (async () => {
      try {
        if (!currentOrganizationId) throw new Error('No organization');

        const proposalTitle = title.trim() || (selectedContact
          ? `Roofing Proposal – ${selectedContact.first_name} ${selectedContact.last_name}`
          : 'AI-Generated Proposal');

        const createRes = await createProposal({
          organization_id: currentOrganizationId,
          title: proposalTitle,
          status: 'draft',
          contact_id: selectedContact?.id,
        });

        if (!createRes.success || !createRes.data) throw new Error(createRes.message || 'Failed to create');

        const proposalId = createRes.data.id;

        const genRes = await generateAiProposal({
          organization_id: currentOrganizationId,
          proposal_id: proposalId,
          contact_id: selectedContact?.id,
          sections_to_generate: selectedSections,
          custom_instructions: [selectedTemplate?.default_instructions, customInstructions].filter(Boolean).join('\n'),
        });

        clearInterval(interval);

        if (!genRes.success) throw new Error(genRes.error?.message || 'Generation failed');

        setGeneratedProposalId(proposalId);
        setStep(4);
      } catch (err) {
        clearInterval(interval);
        setGenerationError(err instanceof Error ? err.message : 'Generation failed');
      }
    })();

    return () => clearInterval(interval);
  }, [step]);

  const handleTemplateSelect = (template: AiProposalTemplate) => {
    setSelectedTemplate(template);
    setSelectedSections(template.section_types);
    if (template.default_instructions) {
      setCustomInstructions(template.default_instructions);
    }
  };

  const toggleSection = (section: SectionType) => {
    setSelectedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const canProceedStep1 = title.trim().length > 0 || selectedContact !== null;
  const canProceedStep2 = selectedTemplate !== null && selectedSections.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3 py-4">
          <button
            onClick={() => step === 1 ? navigate(-1) : setStep(prev => (prev - 1) as WizardStep)}
            className="text-gray-500 dark:text-gray-400 p-1"
            disabled={step === 3}
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" />
              AI Generator
            </h1>
            <p className="text-xs text-gray-400">
              {step === 1 && 'Step 1 of 4 — Basics'}
              {step === 2 && 'Step 2 of 4 — Template'}
              {step === 3 && 'Step 3 of 4 — Generating'}
              {step === 4 && 'Step 4 of 4 — Review'}
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <ProgressDots step={step} />
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-28">
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Proposal Basics</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                    Proposal Title <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Roof Replacement – Smith Residence"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="relative">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                    Customer <span className="text-gray-400">(optional)</span>
                  </label>
                  {selectedContact ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        {selectedContact.first_name?.[0] || 'C'}
                      </div>
                      <span className="flex-1 text-sm text-green-900 dark:text-green-100">
                        {selectedContact.first_name} {selectedContact.last_name}
                      </span>
                      <button onClick={() => { setSelectedContact(null); setContactSearch(''); }}>
                        <X size={16} className="text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={e => { setContactSearch(e.target.value); setShowContactDropdown(true); }}
                        onFocus={() => setShowContactDropdown(true)}
                        placeholder="Search contacts..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                  )}

                  {showContactDropdown && !selectedContact && contactSearch && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-44 overflow-y-auto">
                      {contactLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 size={16} className="animate-spin text-gray-400" />
                        </div>
                      ) : contactResults.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center p-4">No contacts found</p>
                      ) : (
                        contactResults.map(c => (
                          <button
                            key={c.id}
                            onClick={() => { setSelectedContact(c); setShowContactDropdown(false); setContactSearch(''); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                              {c.first_name?.[0] || 'C'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{c.first_name} {c.last_name}</p>
                              {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!canProceedStep1 && (
              <p className="text-xs text-center text-gray-400">Enter a title or select a customer to continue</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Choose a Template</h2>
              <div className="space-y-2">
                {AI_PROPOSAL_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t)}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                      selectedTemplate?.id === t.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedTemplate?.id === t.id ? 'bg-red-100 dark:bg-red-900/40' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <FileText size={18} className={selectedTemplate?.id === t.id ? 'text-red-600' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>
                    </div>
                    {selectedTemplate?.id === t.id && (
                      <Check size={18} className="text-red-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sections to Generate</h3>
                <div className="space-y-2">
                  {ALL_SECTIONS.map(section => (
                    <button
                      key={section}
                      onClick={() => toggleSection(section)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                        selectedSections.includes(section)
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedSections.includes(section) ? 'bg-red-600 border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedSections.includes(section) && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-800 dark:text-gray-200">{SECTION_LABELS[section]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Custom Instructions</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Guide the AI with project-specific context</p>
              <textarea
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="e.g. 3-tab shingles, 20 squares, 5/12 pitch, storm damage from May 2024..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center mb-6 shadow-lg">
              <Sparkles size={36} className="text-white" />
            </div>
            {generationError ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generation Failed</h2>
                <p className="text-sm text-red-500 mb-6">{generationError}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Go Back
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generating Your Proposal</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{GENERATING_MESSAGES[msgIndex]}</p>
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && generatedProposalId && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Proposal Ready!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your AI-generated proposal is ready. Review and edit it before sending to your customer.
              </p>
            </div>

            <button
              onClick={() => navigate(`../proposals/${generatedProposalId}/edit`)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium text-sm"
            >
              <FileText size={18} />
              <span className="flex-1 text-left">Open and Edit Proposal</span>
              <ChevronRight size={18} />
            </button>

            <button
              onClick={() => navigate('../proposals')}
              className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium"
            >
              Back to Proposals
            </button>
          </div>
        )}
      </div>

      {(step === 1 || step === 2) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 z-30">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(prev => (prev + 1) as WizardStep)}
              disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {step === 2 ? (
                <>
                  <Sparkles size={16} />
                  Generate Proposal
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
