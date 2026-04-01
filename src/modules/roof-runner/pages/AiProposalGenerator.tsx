import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  X,
} from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { getContacts, type Contact } from '../../../shared/store/services/contactsApi';
import { proposalsApi } from '../services/proposalsApi';
import { templateApi, type Template } from '../services/templateApi';
import {
  AI_PROPOSAL_TEMPLATES,
  SECTION_LABELS,
  type SectionType,
} from '../types/aiProposal';

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
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
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
  const [orgTemplates, setOrgTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState<SectionType[]>(['intro', 'scope', 'materials', 'timeline', 'terms']);
  const [customInstructions, setCustomInstructions] = useState('');

  // Step 3 / generation state
  const [statusIndex, setStatusIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (!contactSearch || (contactSearch?.length || 0) < 2 || selectedContact) {
      setContactResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setContactLoading(true);
      try {
        const res = await getContacts(contactSearch, undefined, 1, 10);
        setContactResults(res?.data?.contacts || []);
        setShowContactDropdown(true);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setContactResults([]);
      } finally {
        setContactLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [contactSearch, selectedContact]);

  function selectContact(contact: Contact) {
    setSelectedContact(contact);
    setContactSearch(contact.full_name || contact.fullName);
    setShowContactDropdown(false);
  }

  function clearContact() {
    setSelectedContact(null);
    setContactSearch('');
    setContactResults([]);
  }

  useEffect(() => {
    setTemplatesLoading(true);
    templateApi.getTemplates()
      .then(setOrgTemplates)
      .catch(err => console.error('Error fetching templates:', err))
      .finally(() => setTemplatesLoading(false));
  }, []);

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
    setStep(3);
    setIsGenerating(true);
    setGenerationError(null);
    setStatusIndex(0);

    const interval = setInterval(() => {
      setStatusIndex((i) => (i < (STATUS_MESSAGES?.length || 0) - 1 ? i + 1 : i));
    }, 2000);

    try {
      // 1. Create draft proposal via backend API
      const proposal = await proposalsApi.createProposal({
        title: title || 'New AI Proposal',
        template_id: selectedTemplateId || undefined,
        contact_id: selectedContact?.id,
      });

      if (!proposal?.id) {
        throw new Error('Failed to create proposal record');
      }

      setCreatedProposalId(String(proposal.id));

      // 2. Generate AI sections via backend proxy
      const genResult = await proposalsApi.generateAiProposal({
        organization_id: currentOrganizationId || '',
        proposal_id: String(proposal.id),
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
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 1 ? setStep((step - 1) as WizardStep) : navigate(-1))}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={isGenerating}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Sparkles size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Generate with AI</h1>
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : isDone
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    }`}
                  >
                    {isDone ? <CheckCircle size={12} /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < (stepLabels?.length || 0) - 1 && (
                    <div className={`w-4 h-px ${isDone ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Step 1: Setup & Contact */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Proposal Setup</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Give your proposal a clear title and link it to a customer for better AI personalization.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Proposal Title <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Roof Replacement – 123 Main St"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm shadow-sm"
                />
              </div>

              {/* Contact Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Customer / Contact <span className="text-primary-500">*</span>
                </label>
                <div className="relative" ref={contactDropdownRef}>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-primary-500" />
                    <input
                      type="text"
                      value={contactSearch}
                      onChange={(e) => {
                        setContactSearch(e.target.value);
                        if (selectedContact) setSelectedContact(null);
                      }}
                      placeholder="Search customers by name, email, or company..."
                      className={`w-full pl-11 pr-11 py-3 border rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm shadow-sm ${
                        selectedContact
                          ? 'border-primary-400 dark:border-primary-500 bg-primary-50/10'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    />
                    {contactLoading ? (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary-500" />
                    ) : selectedContact && (
                      <button onClick={clearContact} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {showContactDropdown && (contactResults?.length || 0) > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto overflow-x-hidden divide-y divide-gray-100 dark:divide-gray-700 animate-in fade-in zoom-in-95 duration-200">
                      {contactResults.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectContact(c)}
                          className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col gap-0.5"
                        >
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{c.full_name || c.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                             {[c.company, c.email].filter(Boolean).join(' · ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedContact && (
                  <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-xl animate-in zoom-in-95 duration-300">
                    <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {(selectedContact.full_name || selectedContact.fullName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-primary-900 dark:text-primary-100 truncate">{selectedContact.full_name || selectedContact.fullName}</div>
                      {selectedContact.email && (
                        <div className="text-xs text-primary-600 dark:text-primary-400 truncate">{selectedContact.email}</div>
                      )}
                    </div>
                    <div className="px-2 py-1 bg-primary-100 dark:bg-primary-900/40 rounded text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                      Selected
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!title || !selectedContact}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Next Step
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Context & Template */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Refine AI Context</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select an existing template as a base and tell AI what specific details to focus on.</p>
            </div>

            {/* Template Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900 dark:text-white">
                  Base Template
                </label>
                {templatesLoading ? (
                  <div className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-850">
                    <Loader2 size={16} className="animate-spin text-primary-500" />
                    <span className="text-sm text-gray-400 font-medium">Fetching your templates...</span>
                  </div>
                ) : (
                  <div className="relative group">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full appearance-none px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium shadow-sm cursor-pointer"
                    >
                      <option value="">No template (use default logic)</option>
                      {orgTemplates.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}{tpl.is_default ? ' (Default)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
                  </div>
                )}
              </div>

              {/* Section Checkboxes */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   Checklist for AI Generation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_SECTIONS.map((s) => (
                    <label
                      key={s}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${
                        selectedSections.includes(s)
                          ? 'bg-primary-50/30 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800'
                          : 'bg-white border-gray-100 dark:bg-gray-750 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        selectedSections.includes(s)
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-300 group-hover:border-primary-400'
                      }`}>
                        {selectedSections.includes(s) && <CheckCircle size={14} className="fill-current" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedSections.includes(s)}
                        onChange={() => toggleSection(s)}
                      />
                      <span className={`text-sm font-medium transition-colors ${
                        selectedSections.includes(s) ? 'text-primary-900 dark:text-primary-100' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {SECTION_LABELS[s]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Instructions */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
                   <span>Special AI Instructions</span>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                  placeholder="Tell AI about the project specifics, e.g., 'Emphasize that we use GAF shingles' or 'Note that the north side has heavy algae growth'..."
                  className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={18} />
                Previous
              </button>
              <button
                onClick={runGeneration}
                disabled={(selectedSections?.length || 0) === 0}
                className="inline-flex items-center gap-2 px-10 py-3.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-slow active:scale-95"
              >
                <Sparkles size={18} />
                Generate Now
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-in zoom-in-95 duration-500">
            {generationError ? (
              <div className="space-y-6">
                <div className="w-24 h-24 rounded-full bg-error-50 dark:bg-error-900/20 flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle size={40} className="text-error-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">{generationError}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { setStep(2); setGenerationError(null); }}
                    className="px-8 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate(`${orgPrefix}/proposals`)}
                    className="px-8 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md transition-all"
                  >
                    Manual Creation
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-sm mx-auto">
                <div className="relative mx-auto w-32 h-32">
                   {/* Main animated glow */}
                   <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping duration-[2000ms]" />
                   <div className="absolute inset-2 bg-primary-500/30 rounded-full animate-pulse" />
                   
                   <div className="relative w-full h-full rounded-full bg-white dark:bg-gray-800 border-4 border-primary-500/20 flex items-center justify-center shadow-xl overflow-hidden">
                      <Sparkles size={48} className="text-primary-600 dark:text-primary-400 animate-bounce-slow" />
                      
                      {/* Spinning border effect */}
                      <div className="absolute inset-0 border-t-4 border-primary-500 rounded-full animate-spin duration-1000" />
                   </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI is Crafting...</h2>
                  <div className="h-10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-all duration-700 animate-in fade-in slide-in-from-bottom-2 italic font-medium">
                      "{STATUS_MESSAGES[statusIndex]}"
                    </p>
                  </div>
                </div>

                {/* Progress pill markers */}
                <div className="flex justify-center gap-2">
                  {(STATUS_MESSAGES || []).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-700 ${
                        i <= statusIndex ? 'w-8 bg-primary-500 shadow-[0_0_8px_rgba(var(--color-primary-500),0.4)]' : 'w-2 bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-4 bg-green-50/50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <CheckCircle size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Success!</h2>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  We've successfully generated {sectionsCount} custom sections for your proposal.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Draft Preview</h3>
              <div className="grid gap-4">
                {generatedSections.map((s) => (
                  <div 
                    key={s.id} 
                    className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${
                      s.expanded ? 'ring-2 ring-primary-500/20 border-primary-200 dark:border-primary-800 shadow-lg' : 'border-gray-100 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <button
                      onClick={() => toggleSectionExpand(s.id)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                           s.expanded ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                        }`}>
                           {s.type === 'intro' && <User size={16} />}
                           {s.type === 'scope' && <Search size={16} />}
                           {s.type === 'materials' && <Zap size={16} />}
                           {s.type === 'timeline' && <Settings size={16} />}
                           {s.type === 'terms' && <CheckCircle size={16} />}
                           {s.type === 'damage_assessment' && <AlertCircle size={16} />}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{SECTION_LABELS[s.type as SectionType] || s.type}</span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{s.title}</h4>
                        </div>
                      </div>
                      {s.expanded ? (
                        <ChevronUp size={20} className="text-primary-500" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </button>
                    {s.expanded && (
                      <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div
                          className="text-sm text-gray-600 dark:text-gray-300 prose prose-primary prose-sm dark:prose-invert max-w-none bg-gray-50/50 dark:bg-gray-850 p-5 rounded-xl border border-gray-100 dark:border-gray-700 line-clamp-10"
                          dangerouslySetInnerHTML={{ __html: s.content }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 pb-12">
              <button
                onClick={() => navigate(`${orgPrefix}/proposals/editor/${createdProposalId}`)}
                className="flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-0.5"
              >
                <Sparkles size={18} />
                Open in Full Editor
              </button>
              <button
                onClick={() => navigate(`${orgPrefix}/proposals`)}
                className="flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
