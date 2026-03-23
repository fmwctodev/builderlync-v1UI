import React, { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ReputationAIDraft, TonePreset } from '../../types';

interface Props {
  drafts: ReputationAIDraft[];
  generating: boolean;
  onGenerate: (tonePreset?: string) => void;
  onUseDraft: (draft: ReputationAIDraft) => void;
}

const TONE_LABELS: Record<TonePreset, string> = {
  concise: 'Concise & Professional',
  empathetic: 'Friendly & Empathetic',
  fixit: 'Problem-Solving',
};

const TONE_COLORS: Record<TonePreset, string> = {
  concise: 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10',
  empathetic: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10',
  fixit: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10',
};

const DraftCard: React.FC<{
  draft: ReputationAIDraft;
  onUse: () => void;
}> = ({ draft, onUse }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const tone = (draft.tone_preset as TonePreset) ?? 'concise';

  const copy = async () => {
    await navigator.clipboard.writeText(draft.draft_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg border p-3 ${TONE_COLORS[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
        >
          {TONE_LABELS[tone]}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {draft.applied && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
            <Check className="w-3 h-3" /> Used
          </span>
        )}
      </div>

      {expanded && (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">
            {draft.draft_text}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onUse}
              className="flex-1 py-1.5 px-3 text-xs font-medium rounded-md bg-primary-600 hover:bg-primary-700 text-white transition-colors"
            >
              Use this
            </button>
            <button
              onClick={copy}
              className="py-1.5 px-3 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const AIDraftPanel: React.FC<Props> = ({ drafts, generating, onGenerate, onUseDraft }) => {
  const latestBatch = drafts.slice(0, 3);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Reply Drafts</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">gpt-5.1</span>
        </div>
        <button
          onClick={() => onGenerate()}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white transition-colors"
        >
          {generating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {generating ? 'Generating…' : drafts.length > 0 ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {generating && (
        <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
          Generating 3 reply variants with GPT-5.1…
        </div>
      )}

      {!generating && latestBatch.length > 0 && (
        <div className="flex flex-col gap-3">
          {latestBatch.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onUse={() => onUseDraft(draft)}
            />
          ))}
        </div>
      )}

      {!generating && latestBatch.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
          Click "Generate" to create AI-powered reply suggestions.
        </p>
      )}
    </div>
  );
};
