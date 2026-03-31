import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Settings,
  Zap,
} from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getContacts } from '../../../shared/store/services/contactsApi';
import { createProposal } from '../services/proposalsNewApi';
import { generateAiProposal } from '../services/aiProposalApi';
import { getProposalTemplatesByOrg, type OrgProposalTemplate } from '../services/proposalTemplatesApi';
import {
  AI_PROPOSAL_TEMPLATES,
  SECTION_LABELS,
  type SectionType,
} from '../types/aiProposal';
import type { Contact } from '../../../shared/store/services/contactsApi';

type WizardStep = 1 | 2 | 3 | 4;

interface GeneratedSectionPreview {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  expanded: boolean;
}

const ALL_SECTIONS: SectionType[] = [
  'intro',
  'scope',
  'materials',
  'timeline',
  'terms',
  'damage_assessment',
];

const STATUS_MESSAGES = [
  'Creating your proposal...',
  'Gathering project context...',
  'Generating content with AI...',
  'Finalizing sections...',
];

export default function AiProposalGenerator() {
  const navigate = useNavigate();
  const { currentOrganizationId } = useCurrentOrganization();

  const [step, setStep] = useState<WizardStep>(1);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  // Step 2 state
  const [orgTemplates, setOrgTemplates] = useState<OrgProposalTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState<SectionType[]>(['intro', 'scope', 'materials', 'timeline', 'terms']);
  const [customInstructions, setCustomInstructions] = useState('');

  // Step 3 / generation state
  const [statusIndex, setStatusIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Step 4 state
  const [createdProposalId, setCreatedProposalId] = useState<string | null>(null);
  const [generatedSections, setGeneratedSections] = useState<GeneratedSectionPreview[]>([]);
  const [sectionsCount, setSectionsCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node)) {
        setShowContactDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!contactSearch || contactSearch.length < 2) {
      setContactResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setContactLoading(true);
      try {
        const res = await getContacts(currentOrganizationId, contactSearch, undefined, 1, 10);
        setContactResults(res.data.data);
        setShowContactDropdown(true);
      } catch {
        setContactResults([]);
      } finally {
        setContactLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [contactSearch, currentOrganizationId]);

  function selectContact(contact: Contact) {
    setSelectedContact(contact);
    setContactSearch(contact.full_name);
    setShowContactDropdown(false);
  }

  function clearContact() {
    setSelectedContact(null);
    setContactSearch('');
    setContactResults([]);
  }

  useEffect(() => {
    if (!currentOrganizationId) return;
    setTemplatesLoading(true);
    getProposalTemplatesByOrg(currentOrganizationId)
      .then(setOrgTemplates)
      .finally(() => setTemplatesLoading(false));
  }, [currentOrganizationId]);

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSelectedSections(['intro', 'scope', 'materials', 'timeline', 'terms']);
      return;
    }
    setSelectedSections([...ALL_SECTIONS]);
  }

  function toggleSection(section: SectionType) {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  }

  async function runGeneration() {
    if (!currentOrganizationId) return;

    setStep(3);
    setIsGenerating(true);
    setGenerationError(null);
    setStatusIndex(0);

    const interval = setInterval(() => {
      setStatusIndex((i) => (i < STATUS_MESSAGES.length - 1 ? i + 1 : i));
    }, 1800);

    try {
      // Create draft proposal immediately
      const proposalResult = await createProposal({
        organization_id: currentOrganizationId,
        title,
        type: 'proposal',
        contact_id: selectedContact?.id ?? undefined,
        status: 'draft',
        content: { sections: [] },
      });

      if (!proposalResult.success || !proposalResult.data) {
        throw new Error(proposalResult.message ?? 'Failed to create proposal');
      }

      const proposalId = proposalResult.data.id;
      setCreatedProposalId(proposalId);

      // Generate AI sections
      const genResult = await generateAiProposal({
        organization_id: currentOrganizationId,
        proposal_id: proposalId,
        contact_id: selectedContact?.id,
        sections_to_generate: selectedSections,
        custom_instructions: customInstructions || undefined,
      });

      clearInterval(interval);

      if (!genResult.success) {
        throw new Error(genResult.error?.message ?? 'AI generation failed');
      }

      setSectionsCount(genResult.sections_generated);
      setGeneratedSections(
        genResult.sections.map((s) => ({
          id: s.id ?? crypto.randomUUID(),
          type: s.section_type,
          title: s.title,
          content: s.content,
          order: s.sort_order,
          expanded: false,
        }))
      );

      setStep(4);
      setIsGenerating(false);
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }

  function toggleSectionExpand(id: string) {
    setGeneratedSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  }

  const [isGenerating, setIsGenerating] = useState(false);

  const stepLabels: { icon: React.ReactNode; label: string }[] = [
    { icon: <User size={14} />, label: 'Setup' },
    { icon: <Settings size={14} />, label: 'Context' },
    { icon: <Zap size={14} />, label: 'Generating' },
    { icon: <CheckCircle size={14} />, label: 'Done' },
  ];

  function navigateToStep(target: WizardStep) {
    if (isGenerating) return;
    setStep(target);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 1 ? setStep((step - 1) as WizardStep) : navigate(-1))}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={isGenerating}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-primary-600 dark:text-primary-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Generate with AI</h1>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {stepLabels.map((s, i) => {
              const stepNum = (i + 1) as WizardStep;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <React.Fragment key={i}>
                  <button
                    onClick={() => navigateToStep(stepNum)}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isGenerating ? 'cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-primary-300 dark:hover:ring-primary-600'
                    } ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : isDone
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    {isDone ? <CheckCircle size={12} /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-4 h-px ${isDone ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-200 dark:bg-gray-600'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── Step 1: Setup & Contact ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Proposal Setup</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Give your proposal a title and link it to a contact.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Proposal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Roof Replacement – 123 Main St"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              {/* Contact selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Customer / Contact <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={contactDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      value={contactSearch}
                      onChange={(e) => {
                        setContactSearch(e.target.value);
                        if (selectedContact) setSelectedContact(null);
                      }}
                      placeholder="Search contacts by name, email, or company..."
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${
                        selectedContact
                          ? 'border-primary-400 dark:border-primary-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {contactLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  {showContactDropdown && contactResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {contactResults.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectContact(c)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{c.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {[c.company, c.email].filter(Boolean).join(' · ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showContactDropdown && contactSearch.length >= 2 && contactResults.length === 0 && !contactLoading && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No contacts found for "{contactSearch}"</p>
                    </div>
                  )}
                </div>

                {selectedContact && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {selectedContact.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary-800 dark:text-primary-200 truncate">{selectedContact.full_name}</div>
                      {selectedContact.email && (
                        <div className="text-xs text-primary-600 dark:text-primary-400 truncate">{selectedContact.email}</div>
                      )}
                    </div>
                    <button onClick={clearContact} className="text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-xs shrink-0">
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Context & Template ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Choose a Template</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a template and customize the sections you want generated.</p>
            </div>

            {/* Template dropdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Template
              </label>
              {templatesLoading ? (
                <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading templates...</span>
                </div>
              ) : (
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">No template (start fresh)</option>
                  {orgTemplates.length > 0 ? (
                    orgTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}{tpl.is_default ? ' (default)' : ''}
                      </option>
                    ))
                  ) : (
                    AI_PROPOSAL_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))
                  )}
                </select>
              )}
              {orgTemplates.length === 0 && !templatesLoading && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  Showing default templates. Add custom templates in Settings.
                </p>
              )}
            </div>

            {/* Section checkboxes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sections to Generate</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_SECTIONS.map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(s)}
                      onChange={() => toggleSection(s)}
                      className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{SECTION_LABELS[s]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Additional Instructions <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                placeholder="Any specific details you want the AI to include or emphasize..."
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={runGeneration}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Sparkles size={16} />
                Generate Proposal
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Generating ── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            {generationError ? (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generation failed</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">{generationError}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep(2); setGenerationError(null); }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('proposals/new')}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Manually
                  </button>
                </div>
              </>
            ) : isGenerating ? (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Sparkles size={32} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <Loader2 className="absolute -inset-1 w-22 h-22 text-primary-500 animate-spin opacity-40" style={{ width: 88, height: 88, top: -4, left: -4 }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generating your proposal</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-500">
                    {STATUS_MESSAGES[statusIndex]}
                  </p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {STATUS_MESSAGES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i <= statusIndex ? 'w-6 bg-primary-500' : 'w-2 bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Sparkles size={32} className="text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Generating your proposal</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This is where AI generation progress will be shown.
                  </p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {STATUS_MESSAGES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-2 rounded-full bg-gray-200 dark:bg-gray-700"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  Go back to Setup and Context to fill in details, then use Generate Proposal to start.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Proposal generated!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sectionsCount > 0
                    ? `${sectionsCount} section${sectionsCount !== 1 ? 's' : ''} created and saved as a draft.`
                    : 'Generated sections will appear here after running AI generation.'}
                </p>
              </div>
            </div>

            {generatedSections.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {generatedSections.map((s) => (
                  <div key={s.id}>
                    <button
                      onClick={() => toggleSectionExpand(s.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{s.title}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{s.type}</span>
                      </div>
                      {s.expanded ? (
                        <ChevronUp size={16} className="text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400 shrink-0" />
                      )}
                    </button>
                    {s.expanded && (
                      <div
                        className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: s.content }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {['Introduction', 'Scope of Work', 'Materials', 'Timeline', 'Terms & Conditions'].map((label, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4">
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full shrink-0" />
                    <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{label}</span>
                    <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">Pending</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {createdProposalId ? (
                <button
                  onClick={() => navigate(`proposals/${createdProposalId}/edit`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Sparkles size={16} />
                  Open in Proposal Builder
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <Sparkles size={16} />
                  Open in Proposal Builder
                </button>
              )}
              <button
                onClick={() => navigate('proposals')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Proposals
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
